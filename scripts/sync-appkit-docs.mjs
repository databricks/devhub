import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

// Where upstream appkit stores its source-of-truth component examples.
// Paths are relative to the extracted appkit tarball root.
const UPSTREAM_EXAMPLE_DIRS = ["packages/appkit-ui/src/react/ui/examples"];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function runCapture(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf-8",
  });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(" ")}`);
  }

  return result.stdout;
}

function copyDirRecursive(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function replaceDir(source, destination) {
  fs.rmSync(destination, { recursive: true, force: true });
  copyDirRecursive(source, destination);
}

function normalizeMajorChannel(raw) {
  const value = raw.trim();
  if (value.length === 0) {
    fail("Version channel cannot be empty.");
  }

  if (!/^v\d+$/.test(value)) {
    fail("Only major channels are allowed: v0, v1, v2, ...");
  }

  return value;
}

function parseSemverTag(tag) {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareSemver(a, b) {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

function resolveLatestTagForMajor(majorChannel) {
  const major = Number(majorChannel.slice(1));
  const remote = "https://github.com/databricks/appkit.git";
  const pattern = `v${major}.*`;

  const output = runCapture(
    "git",
    ["ls-remote", "--tags", "--refs", remote, pattern],
    repoRoot,
  );

  const tags = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(/\s+/);
      const ref = parts[1] ?? "";
      const tag = ref.replace("refs/tags/", "");
      const parsed = parseSemverTag(tag);
      if (!parsed) {
        return null;
      }
      return { tag, parsed };
    })
    .filter((item) => item !== null);

  if (tags.length === 0) {
    fail(`No tags found for major channel '${majorChannel}'.`);
  }

  tags.sort((a, b) => compareSemver(a.parsed, b.parsed));
  return tags[tags.length - 1].tag;
}

async function downloadTarball(url, outputFile) {
  const response = await fetch(url);
  if (!response.ok) {
    return false;
  }
  if (!response.body) {
    fail(`No response body returned from ${url}`);
  }

  await pipeline(
    Readable.fromWeb(response.body),
    fs.createWriteStream(outputFile),
  );
  return true;
}

// Pascal-cases a kebab-cased file stem ("alert-dialog" -> "AlertDialog").
function pascalCase(stem) {
  return stem
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

// Walks the extracted appkit tree for example files and writes them under
// src/components/doc-examples, preserving kebab-case filenames so the
// <DocExample name="..."> contract stays stable.
function syncExamples(extractedRoot) {
  const outDir = path.join(repoRoot, "src", "components", "doc-examples");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const collected = [];
  for (const dir of UPSTREAM_EXAMPLE_DIRS) {
    const srcDir = path.join(extractedRoot, dir);
    if (!fs.existsSync(srcDir)) continue;

    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".example.tsx")) continue;

      const src = path.join(srcDir, entry.name);
      const dest = path.join(outDir, entry.name);
      fs.copyFileSync(src, dest);

      const stem = entry.name.slice(0, -".example.tsx".length);
      collected.push({ stem, filename: entry.name });
    }
  }

  collected.sort((a, b) => a.stem.localeCompare(b.stem));

  const imports = collected
    .map(
      ({ stem, filename }) =>
        `import ${pascalCase(stem)}Example from "./${filename.replace(/\.tsx$/, "")}";`,
    )
    .join("\n");

  const entries = collected
    .map(({ stem, filename }) => {
      const sourcePath = path.join(outDir, filename);
      const rawSource = fs.readFileSync(sourcePath, "utf-8");
      const escaped = rawSource
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$");
      return `  "${stem}": {\n    Component: ${pascalCase(stem)}Example,\n    source: \`${escaped}\`,\n  }`;
    })
    .join(",\n");

  const registry = `// Auto-generated by scripts/sync-appkit-docs.mjs. Do not edit by hand.\n// Source files alongside this registry are vendored verbatim from the\n// matching appkit release tag and import from '@databricks/appkit-ui/react'.\nimport type { ComponentType } from "react";\n${imports}\n\nexport type DocExampleEntry = { Component: ComponentType; source: string };\n\nexport const docExamples = {\n${entries},\n} as const satisfies Record<string, DocExampleEntry>;\n\nexport type DocExampleKey = keyof typeof docExamples;\n`;

  fs.writeFileSync(path.join(outDir, "registry.ts"), registry, "utf-8");

  console.log(
    `Synced ${collected.length} example components to ${path.relative(repoRoot, outDir)}`,
  );
}

// Compiles the installed @databricks/appkit-ui styles.css (Tailwind v4 source
// with @import "tailwindcss" and @source directives pointing at the built
// React components) into a real CSS bundle, and writes it to a public static
// path so the DocExample iframe can link it directly without webpack.
async function syncCompiledStyles(majorChannel) {
  const pkgDir = path.join(
    repoRoot,
    "node_modules",
    "@databricks",
    "appkit-ui",
  );
  if (!fs.existsSync(pkgDir)) {
    fail(
      "@databricks/appkit-ui is not installed. Run `npm install` and retry.",
    );
  }

  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"),
  );
  const version = pkgJson.version;

  const srcCss = path.join(pkgDir, "dist", "styles.css");
  if (!fs.existsSync(srcCss)) {
    fail(`dist/styles.css not found in @databricks/appkit-ui@${version}.`);
  }

  const destDir = path.join(repoRoot, "static", "appkit-preview", majorChannel);
  fs.mkdirSync(destDir, { recursive: true });
  const destCss = path.join(destDir, "styles.css");

  const [{ default: postcss }, { default: tailwind }] = await Promise.all([
    import("postcss"),
    import("@tailwindcss/postcss"),
  ]);

  const rawCss = fs.readFileSync(srcCss, "utf-8");
  const result = await postcss([tailwind()]).process(rawCss, {
    from: srcCss,
    to: destCss,
  });

  // NOTE: avoid `*/` anywhere inside this banner -- it would terminate the
  // CSS comment early and break the entire stylesheet's parsing.
  const banner = `/* Synced from @databricks/appkit-ui@${version} (${majorChannel}).\n * Source of truth: https://github.com/databricks/appkit\n * Compiled via @tailwindcss/postcss; do not edit by hand.\n * Regenerate via: npm run sync:appkit-docs ${majorChannel}\n */\n`;
  fs.writeFileSync(destCss, banner + result.css, "utf-8");

  console.log(
    `Compiled @databricks/appkit-ui@${version} styles to ` +
      `${path.relative(repoRoot, destCss)} (${(result.css.length / 1024).toFixed(1)} KB).`,
  );

  return version;
}

async function main() {
  const majorArg = process.argv[2];
  if (!majorArg) {
    fail("Usage: node scripts/sync-appkit-docs.mjs <major-channel>");
  }

  const majorChannel = normalizeMajorChannel(majorArg);
  const resolvedTag = resolveLatestTagForMajor(majorChannel);

  const docsRoot = path.join(repoRoot, "docs", "appkit");
  const majorDir = path.join(docsRoot, majorChannel);

  fs.mkdirSync(docsRoot, { recursive: true });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "devhub-appkit-docs-"));
  const archivePath = path.join(tempDir, "appkit.tar.gz");

  const tagUrl = `https://codeload.github.com/databricks/appkit/tar.gz/refs/tags/${resolvedTag}`;

  console.log(
    `Resolved ${majorChannel} to latest AppKit tag ${resolvedTag}. Downloading source...`,
  );
  const downloaded = await downloadTarball(tagUrl, archivePath);

  if (!downloaded) {
    fail(`Could not download AppKit source for tag '${resolvedTag}'.`);
  }

  run("tar", ["-xzf", archivePath], tempDir);

  const extracted = fs
    .readdirSync(tempDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(tempDir, entry.name))
    .find((fullPath) => fs.existsSync(path.join(fullPath, "docs", "docs")));

  if (!extracted) {
    fail("Could not find docs/docs in downloaded AppKit source.");
  }

  const appkitDocsSource = path.join(extracted, "docs", "docs");

  replaceDir(appkitDocsSource, majorDir);
  fs.writeFileSync(
    path.join(majorDir, ".source-ref"),
    `databricks/appkit@${resolvedTag} (${majorChannel})\n`,
    "utf-8",
  );
  fs.rmSync(path.join(docsRoot, "current"), { recursive: true, force: true });

  syncExamples(extracted);
  const stylesVersion = await syncCompiledStyles(majorChannel);

  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log(`\nUpdated major docs: ${path.relative(repoRoot, majorDir)}`);
  console.log(`AppKit docs @ ${resolvedTag}, styles @ ${stylesVersion}.`);
  if (`v${stylesVersion}` !== resolvedTag) {
    console.log(
      `Note: docs tag (${resolvedTag}) and installed @databricks/appkit-ui ` +
        `(${stylesVersion}) differ. Update the dep in package.json if you ` +
        `want them aligned.`,
    );
  }
  console.log("Done.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
