import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const nextAppKitDocsRoot = path.join(
  repoRoot,
  "src",
  "content",
  "docs",
  "appkit",
);

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

function walkFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function normalizeSyncedDocs(docsRoot) {
  const upstreamLlmsLinkHelper =
    /import\s+\w+Context\s+from\s+["'][^"']+["'];\n\nexport function LlmsTxtLink\([\s\S]*?^}\n\n/gm;
  const upstreamSidebarConfigImport =
    /import\s+\{\s*SidebarsConfig\s*\}\s+from\s+["'][^"']+["'];\n/;

  const typedocSidebarTypes = `type SidebarDocItem = {
  type: "doc";
  id: string;
  label: string;
};

type SidebarCategoryItem = {
  type: "category";
  label: string;
  items: Array<SidebarDocItem | SidebarCategoryItem>;
};

type TypedocSidebar = {
  items: SidebarCategoryItem[];
};

`;

  for (const filePath of walkFiles(docsRoot)) {
    if (!/\.(md|mdx|ts|tsx)$/.test(filePath)) {
      continue;
    }

    const source = fs.readFileSync(filePath, "utf-8");
    let updated = source
      .replaceAll(
        "@site@/components/DocExample",
        "@/components/content/doc-example",
      )
      .replaceAll(
        "@site/src/components/DocExample",
        "@/components/content/doc-example",
      )
      .replace(upstreamLlmsLinkHelper, "")
      .replaceAll("<LlmsTxtLink />", "[`llms.txt`](/llms.txt)");

    // Upstream authors links with Docusaurus/typedoc slug conventions that
    // differ from DevHub's github-slugger heading ids. Rewrite the known
    // mismatches so intra-site anchors and the API index resolve:
    //   - github-slugger drops the leading underscore, so the `_clientMessage?`
    //     property renders with id `clientmessage`, not `_clientmessage`.
    //   - a spaced em-dash (`(OBO) — per-user`) collapses to a single hyphen,
    //     not the double hyphen typedoc/docusaurus emit.
    //   - upstream API pages live at /docs/api/*; DevHub serves them under the
    //     versioned AppKit channel (e.g. /docs/appkit/v0/api/*).
    const channel = path.relative(docsRoot, filePath).split(path.sep)[0];
    updated = updated
      .replaceAll("#_clientmessage", "#clientmessage")
      .replaceAll(
        "#on-behalf-of-obo--per-user-connections",
        "#on-behalf-of-obo-per-user-connections",
      )
      .replaceAll("](/docs/api/", `](/docs/appkit/${channel}/api/`);

    if (upstreamSidebarConfigImport.test(updated)) {
      updated = updated
        .replace(upstreamSidebarConfigImport, typedocSidebarTypes)
        .replace(
          "const typedocSidebar: SidebarsConfig = {",
          "const typedocSidebar: TypedocSidebar = {",
        );
    }

    if (updated !== source) {
      fs.writeFileSync(filePath, updated, "utf-8");
    }
  }
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
      "@databricks/appkit-ui is not installed. Run `pnpm install` and retry.",
    );
  }
  const { version } = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  const major = version.split(".")[0];
  return { channel: `v${major}`, version };
}

// Resolves the upstream HEAD short SHA without cloning. Returns null if the
// remote is unreachable (offline dev), in which case callers should fall back
// to whatever is already on disk.
function getUpstreamHeadSha() {
  const result = spawnSync(
    "git",
    ["ls-remote", APPKIT_REMOTE, `refs/heads/${APPKIT_BRANCH}`],
    {
      encoding: "utf-8",
      timeout: SPAWN_TIMEOUT,
    },
  );
  if (result.status !== 0) return null;
  const [fullSha] = result.stdout.trim().split(/\s+/);
  if (!fullSha || !/^[0-9a-f]{7,}$/.test(fullSha)) return null;
  return fullSha.slice(0, 7);
}

// Reads the short SHA from the channel's `.source-ref` marker file.
// Format: "YYYY-MM-DD (abcdef0)\n".
function readSyncedSha(sourceRefPath) {
  if (!fs.existsSync(sourceRefPath)) return null;
  const ref = fs.readFileSync(sourceRefPath, "utf-8").trim();
  const match = ref.match(/\(([0-9a-f]{7,})\)/);
  return match ? match[1].slice(0, 7) : null;
}

// Decides whether the existing on-disk sync is still valid. The sync is valid
// only when ALL of these hold:
//
//   1. src/content/docs/appkit/<channel>/.source-ref exists (docs were synced before)
//   2. src/components/doc-examples/registry.ts exists (examples were synced)
//   3. public/appkit-preview/<channel>/styles.css exists (styles compiled)
//   4. The recorded SHA matches the current upstream HEAD on APPKIT_BRANCH
//
// Item 4 is the important one: Vercel restores the build cache between
// deploys, so the marker files are always present even when upstream has new
// commits. Without an upstream check, the sync hook would forever skip and
// production would serve stale AppKit docs. If we cannot reach the remote
// (offline dev), we keep the cached docs and log a warning instead of failing.
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
    "public",
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

  const localSha = readSyncedSha(sourceRefPath);
  const upstreamSha = getUpstreamHeadSha();
  const ref = fs.readFileSync(sourceRefPath, "utf-8").trim();

  if (upstreamSha === null) {
    console.warn(
      `Could not reach ${APPKIT_REMOTE} to check for updates; using cached AppKit docs synced on ${ref}.`,
    );
    return true;
  }

  if (localSha !== upstreamSha) {
    console.log(
      `Cached AppKit docs are at ${localSha} but upstream ${APPKIT_BRANCH} is at ${upstreamSha}; re-syncing.`,
    );
    return false;
  }

  console.log(
    `AppKit docs are up to date with ${APPKIT_BRANCH} (${ref}). Skipping sync.`,
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
// Currently AppKit has no versioned_docs, but the upstream repository may add
// versioned documentation folders later.
//
// TODO: When AppKit starts publishing versioned docs:
// - Read docs/versions.json to determine the latest released version
// - Copy docs/versioned_docs/version-<latest>/ → src/content/docs/appkit/v<major>/ (instead of docs/docs/)
// - Copy docs/docs/ → src/content/docs/appkit/next/ (unreleased dev docs)
// - Copy remaining versioned_docs/version-*/ → src/content/docs/appkit/version-*/
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

function adaptExampleSourceForNext(filename, source) {
  if (filename !== "aspect-ratio.example.tsx") return source;

  return source
    .replace(
      'import { AspectRatio } from "@databricks/appkit-ui/react"',
      'import Image from "next/image"\nimport { AspectRatio } from "@databricks/appkit-ui/react"',
    )
    .replace(
      `      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Photo by Drew Beamer"
        className="h-full w-full rounded-md object-cover"
      />`,
      `      <Image
        src="/img/guides/ai-chat-app-preview-light.png"
        alt="AI Chat App preview"
        width={1600}
        height={900}
        className="h-full w-full rounded-md object-cover"
      />`,
    );
}

// Walks the cloned appkit tree for example files and writes them under
// src/components/doc-examples, preserving kebab-case filenames so the
// <DocExample name="..."> contract stays stable. The synced channel name
// (e.g. "v0") is embedded in the registry so doc-example.tsx can load the
// matching `/appkit-preview/<channel>/styles.css` stylesheet without
// re-deriving it from package.json.
function syncExamples(clonedRoot, syncedChannel) {
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
      const source = adaptExampleSourceForNext(
        entry.name,
        fs.readFileSync(src, "utf-8"),
      );
      fs.writeFileSync(dest, source, "utf-8");

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

  const registry = `// Auto-generated by scripts/sync-appkit-docs.mjs. Do not edit by hand.\n// Source files alongside this registry are vendored from the appkit main\n// branch, with DevHub's Next.js runtime adapters applied where needed.\nimport type { ComponentType } from "react";\n${imports}\n\ntype DocExampleEntry = { Component: ComponentType; source: string };\n\n// The AppKit channel directory the sync script wrote docs and styles into\n// (e.g. v0, v1). Kept in sync with @databricks/appkit-ui's installed major\n// version so DocExample can load the matching compiled stylesheet.\nexport const APPKIT_CHANNEL = ${JSON.stringify(syncedChannel)};\n\nexport const docExamples = {\n${entries},\n} as const satisfies Record<string, DocExampleEntry>;\n\nexport type DocExampleKey = keyof typeof docExamples;\n`;

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

  const destDir = path.join(repoRoot, "public", "appkit-preview", channel);
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
  const banner = `/* Synced from @databricks/appkit-ui@${version} (${channel}).\n * Source of truth: https://github.com/databricks/appkit\n * Compiled via @tailwindcss/postcss; do not edit by hand.\n * Regenerate via: pnpm sync:appkit-docs\n */\n`;
  fs.writeFileSync(destCss, banner + result.css, "utf-8");

  console.log(
    `Compiled @databricks/appkit-ui@${version} styles to ` +
      `${path.relative(repoRoot, destCss)} (${(result.css.length / 1024).toFixed(1)} KB).`,
  );
}

async function main() {
  const force = process.argv.includes("--force");

  const docsRoot = nextAppKitDocsRoot;
  const { channel, version } = readInstalledAppKitChannel();
  const channelDir = path.join(docsRoot, channel);

  // Skip if docs already exist (unless --force)
  if (!force && isAlreadySynced(channelDir, channel)) {
    normalizeSyncedDocs(docsRoot);
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
    normalizeSyncedDocs(docsRoot);

    syncExamples(tempDir, channel);
    await syncCompiledStyles(channel, version);

    console.log(
      `\nAppKit docs synced from ${APPKIT_BRANCH} (${sha}) into src/content/docs/appkit/${channel}/, styles @ ${version}.`,
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
