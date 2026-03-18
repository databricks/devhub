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
    `Resolved ${majorChannel} to latest AppKit tag ${resolvedTag}. Downloading docs...`,
  );
  let downloaded = await downloadTarball(tagUrl, archivePath);

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

  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log(`Updated major docs: ${path.relative(repoRoot, majorDir)}`);
  console.log("Removed deprecated current channel alias.");
  console.log("Done.");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
