import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const APPKIT_REMOTE =
  process.env.APPKIT_REMOTE || "https://github.com/databricks/appkit.git";
const APPKIT_BRANCH = process.env.APPKIT_BRANCH || "main";

if (!/^[\w.\-/]+$/.test(APPKIT_BRANCH)) {
  throw new Error(`Invalid APPKIT_BRANCH: ${APPKIT_BRANCH}`);
}

if (!/^https?:\/\//.test(APPKIT_REMOTE) && !/^git@/.test(APPKIT_REMOTE)) {
  throw new Error(`Invalid APPKIT_REMOTE: must be an HTTPS or SSH git URL`);
}

// Where upstream appkit stores its source-of-truth component examples.
// Paths are relative to the cloned appkit repo root.
const UPSTREAM_EXAMPLE_DIRS = ["packages/appkit-ui/src/react/ui/examples"];

function fail(message) {
  throw new Error(message);
}

const SPAWN_TIMEOUT = 120_000; // 2 minutes

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    timeout: SPAWN_TIMEOUT,
  });

  if (result.signal) {
    fail(`Command killed by ${result.signal}: ${command} ${args.join(" ")}`);
  }
  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function runCapture(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf-8",
    timeout: SPAWN_TIMEOUT,
  });

  if (result.signal) {
    fail(`Command killed by ${result.signal}: ${command} ${args.join(" ")}`);
  }
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

// Reads the major version of the installed @databricks/appkit-ui package and
// returns the matching channel directory name (e.g. v0, v1). The local docs
// channel always tracks the installed package's major so the sidebar, the
// preview iframe styles, and the compiled examples stay in lockstep with the
// SDK that the site links against.
function readInstalledAppKitChannel() {
  const pkgJsonPath = path.join(
    repoRoot,
    "node_modules",
    "@databricks",
    "appkit-ui",
    "package.json",
  );
  if (!fs.existsSync(pkgJsonPath)) {
    fail(
      "@databricks/appkit-ui is not installed. Run `npm install` and retry.",
    );
  }
  const { version } = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  const major = version.split(".")[0];
  return { channel: `v${major}`, version };
}

// Checks whether all three sync outputs are present:
// 1. docs/appkit/<channel>/.source-ref (docs were synced)
// 2. src/components/doc-examples/registry.ts (examples were synced)
// 3. static/appkit-preview/<channel>/styles.css (styles were compiled)
// If any is missing, returns false so the sync re-runs.
function isAlreadySynced(channelDir, channel) {
  const sourceRefPath = path.join(channelDir, ".source-ref");
  const registryPath = path.join(
    repoRoot,
    "src",
    "components",
    "doc-examples",
    "registry.ts",
  );
  const stylesPath = path.join(
    repoRoot,
    "static",
    "appkit-preview",
    channel,
    "styles.css",
  );

  if (
    !fs.existsSync(sourceRefPath) ||
    !fs.existsSync(registryPath) ||
    !fs.existsSync(stylesPath)
  ) {
    return false;
  }

  const ref = fs.readFileSync(sourceRefPath, "utf-8").trim();
  console.log(
    `Using AppKit docs synced on ${ref}. Run 'npm run sync:appkit-docs' to resync.`,
  );

  return true;
}

// Shallow-clones the appkit repo at the given branch into destDir,
// using sparse checkout to only fetch docs and examples.
function cloneAppKit(destDir) {
  console.log(`Cloning ${APPKIT_REMOTE} (branch: ${APPKIT_BRANCH})...`);

  run(
    "git",
    [
      "clone",
      "--depth",
      "1",
      "--branch",
      APPKIT_BRANCH,
      "--sparse",
      "--filter=blob:none",
      APPKIT_REMOTE,
      destDir,
    ],
    repoRoot,
  );

  run(
    "git",
    [
      "-C",
      destDir,
      "sparse-checkout",
      "set",
      "docs/docs",
      "docs/versioned_docs",
      "docs/versions.json",
      "packages/appkit-ui/src/react/ui/examples",
    ],
    repoRoot,
  );
}

function getHeadSha(repoDir) {
  return runCapture(
    "git",
    ["-C", repoDir, "rev-parse", "--short", "HEAD"],
    repoRoot,
  ).trim();
}

// Copies versioned docs from the cloned repo if they exist.
// Currently AppKit has no versioned_docs — this is future-proofing for when
// AppKit adopts Docusaurus versioning (docs/versioned_docs/version-X/).
//
// TODO: When AppKit starts using Docusaurus versioning:
// - Read docs/versions.json to determine the latest released version
// - Copy docs/versioned_docs/version-<latest>/ → docs/appkit/v<major>/ (instead of docs/docs/)
// - Copy docs/docs/ → docs/appkit/next/ (unreleased dev docs)
// - Copy remaining versioned_docs/version-*/ → docs/appkit/version-*/
function syncVersionedDocs(clonedRoot, docsRoot) {
  const versionedDocsDir = path.join(clonedRoot, "docs", "versioned_docs");

  if (!fs.existsSync(versionedDocsDir)) {
    return;
  }

  const versionDirs = fs
    .readdirSync(versionedDocsDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith("version-"),
    );

  if (versionDirs.length === 0) {
    return;
  }

  for (const entry of versionDirs) {
    const src = path.join(versionedDocsDir, entry.name);
    const dest = path.join(docsRoot, entry.name);
    replaceDir(src, dest);
    console.log(`Synced versioned docs: ${entry.name}`);
  }
}

// Pascal-cases a kebab-cased file stem ("alert-dialog" -> "AlertDialog").
function pascalCase(stem) {
  return stem
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

// Walks the cloned appkit tree for example files and writes them under
// src/components/doc-examples, preserving kebab-case filenames so the
// <DocExample name="..."> contract stays stable.
function syncExamples(clonedRoot) {
  const outDir = path.join(repoRoot, "src", "components", "doc-examples");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const collected = [];
  for (const dir of UPSTREAM_EXAMPLE_DIRS) {
    const srcDir = path.join(clonedRoot, dir);
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

  const registry = `// Auto-generated by scripts/sync-appkit-docs.mjs. Do not edit by hand.\n// Source files alongside this registry are vendored verbatim from the\n// appkit main branch and import from '@databricks/appkit-ui/react'.\nimport type { ComponentType } from "react";\n${imports}\n\nexport type DocExampleEntry = { Component: ComponentType; source: string };\n\nexport const docExamples = {\n${entries},\n} as const satisfies Record<string, DocExampleEntry>;\n\nexport type DocExampleKey = keyof typeof docExamples;\n`;

  fs.writeFileSync(path.join(outDir, "registry.ts"), registry, "utf-8");

  console.log(
    `Synced ${collected.length} example components to ${path.relative(repoRoot, outDir)}`,
  );
}

// Compiles the installed @databricks/appkit-ui styles.css (Tailwind v4 source
// with @import "tailwindcss" and @source directives pointing at the built
// React components) into a real CSS bundle, and writes it to a public static
// path so the DocExample iframe can link it directly without webpack.
async function syncCompiledStyles(channel, version) {
  const pkgDir = path.join(
    repoRoot,
    "node_modules",
    "@databricks",
    "appkit-ui",
  );

  const srcCss = path.join(pkgDir, "dist", "styles.css");
  if (!fs.existsSync(srcCss)) {
    fail(`dist/styles.css not found in @databricks/appkit-ui@${version}.`);
  }

  const destDir = path.join(repoRoot, "static", "appkit-preview", channel);
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
  const banner = `/* Synced from @databricks/appkit-ui@${version} (${channel}).\n * Source of truth: https://github.com/databricks/appkit\n * Compiled via @tailwindcss/postcss; do not edit by hand.\n * Regenerate via: npm run sync:appkit-docs\n */\n`;
  fs.writeFileSync(destCss, banner + result.css, "utf-8");

  console.log(
    `Compiled @databricks/appkit-ui@${version} styles to ` +
      `${path.relative(repoRoot, destCss)} (${(result.css.length / 1024).toFixed(1)} KB).`,
  );
}

async function main() {
  const force = process.argv.includes("--force");

  const docsRoot = path.join(repoRoot, "docs", "appkit");
  const { channel, version } = readInstalledAppKitChannel();
  const channelDir = path.join(docsRoot, channel);

  // Skip if docs already exist (unless --force)
  if (!force && isAlreadySynced(channelDir, channel)) {
    return;
  }

  fs.mkdirSync(docsRoot, { recursive: true });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "devhub-appkit-docs-"));

  try {
    cloneAppKit(tempDir);

    const sha = getHeadSha(tempDir);
    const syncDate = new Date().toISOString().slice(0, 10);
    const appkitDocsSource = path.join(tempDir, "docs", "docs");

    if (!fs.existsSync(appkitDocsSource)) {
      fail("Could not find docs/docs in cloned AppKit repository.");
    }

    // Clear existing docs and copy fresh content into the versioned channel
    // directory (e.g. v0/, v1/) matching the installed @databricks/appkit-ui
    // major version.
    fs.rmSync(docsRoot, { recursive: true, force: true });
    fs.mkdirSync(docsRoot, { recursive: true });

    replaceDir(appkitDocsSource, channelDir);
    fs.writeFileSync(
      path.join(channelDir, ".source-ref"),
      `${syncDate} (${sha})\n`,
      "utf-8",
    );

    // Copy versioned docs if present (future-proofing)
    syncVersionedDocs(tempDir, docsRoot);

    syncExamples(tempDir);
    await syncCompiledStyles(channel, version);

    console.log(
      `\nAppKit docs synced from ${APPKIT_BRANCH} (${sha}) into docs/appkit/${channel}/, styles @ ${version}.`,
    );
    console.log("Done.");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(
    `Error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
