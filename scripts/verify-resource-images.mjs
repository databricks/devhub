#!/usr/bin/env node
// Verifies raster images under static/img/{guides,examples,solutions}/ meet
// the DevHub image-format contracts so cards + detail pages render
// consistently.
//
// Two contracts:
//
//   guides/, examples/  (recipes, cookbooks, examples — DevHub-authored)
//     - Aspect ratio: 16:9 (1.778:1, tolerance ±2%)
//     - Minimum:      1600x900 px
//     - Fix:          re-export screenshots at 1600x900 (or any exact 16:9).
//
//   solutions/          (linked-article previews — Open Graph images)
//     - Aspect ratio: 1.91:1 (Open Graph standard, tolerance ±2%)
//     - Minimum:      1200x628 px
//     - Fix:          re-export at 1200x628 or higher (keep 1.91:1).
//
// Both contracts skip .svg files (vector exempt).
//
// Run locally:      npm run verify:images
// Runs on:          pre-commit

import { readdir, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "image-size";
import { readFile } from "node:fs/promises";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));

const RASTER_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const VECTOR_EXTS = new Set([".svg"]);

const RATIO_TOLERANCE = 0.02;

const FORMATS = [
  {
    name: "16:9 (recipes/examples/cookbooks)",
    roots: [
      join(REPO_ROOT, "static/img/guides"),
      join(REPO_ROOT, "static/img/examples"),
    ],
    targetRatio: 16 / 9,
    minWidth: 1600,
    minHeight: 900,
    ratioLabel: "16:9 (1.778:1)",
    fixHint: "re-export this screenshot at 1600x900 (or any exact 16:9 size).",
  },
  {
    name: "1.91:1 (linked solutions / Open Graph)",
    roots: [join(REPO_ROOT, "static/img/solutions")],
    targetRatio: 1200 / 628,
    minWidth: 1200,
    minHeight: 628,
    ratioLabel: "1.91:1 (Open Graph)",
    fixHint:
      "use the source article's Open Graph image (1.91:1, ≥1200x628). " +
      "Crop with sips if needed: sips --cropToHeightWidth <h> <w> <file>.",
  },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function formatRatio(w, h) {
  return `${(w / h).toFixed(3)}:1 (${w}x${h})`;
}

function verifyRaster(bytes, absPath, format) {
  const { width, height } = imageSize(bytes);
  if (!width || !height) {
    return [
      `Could not read dimensions for ${relative(REPO_ROOT, absPath)}. ` +
        `Re-export as PNG or JPEG and try again.`,
    ];
  }
  const actualRatio = width / height;
  const ratioDelta =
    Math.abs(actualRatio - format.targetRatio) / format.targetRatio;
  const errors = [];
  if (ratioDelta > RATIO_TOLERANCE) {
    errors.push(
      `${relative(REPO_ROOT, absPath)}: wrong aspect ratio.\n` +
        `    expected: ${format.ratioLabel}, tolerance ±${(
          RATIO_TOLERANCE * 100
        ).toFixed(0)}%\n` +
        `    actual:   ${formatRatio(width, height)}\n` +
        `    fix:      ${format.fixHint}`,
    );
  }
  if (width < format.minWidth || height < format.minHeight) {
    errors.push(
      `${relative(REPO_ROOT, absPath)}: below minimum resolution.\n` +
        `    expected: ≥ ${format.minWidth}x${format.minHeight}\n` +
        `    actual:   ${width}x${height}\n` +
        `    fix:      ${format.fixHint}`,
    );
  }
  return errors;
}

let totalFiles = 0;
const errors = [];
let checked = 0;
let skipped = 0;

for (const format of FORMATS) {
  for (const root of format.roots) {
    const files = await walk(root);
    totalFiles += files.length;
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (VECTOR_EXTS.has(ext)) {
        skipped++;
        continue;
      }
      if (!RASTER_EXTS.has(ext)) {
        continue;
      }
      const info = await stat(file);
      if (!info.isFile() || info.size === 0) continue;
      const bytes = await readFile(file);
      const fileErrors = verifyRaster(bytes, file, format);
      if (fileErrors.length === 0) {
        checked++;
      } else {
        errors.push(...fileErrors);
      }
    }
  }
}

if (totalFiles === 0) {
  console.log(
    `verify:images — no files under static/img/{guides,examples,solutions}/, skipping.`,
  );
  process.exit(0);
}

if (errors.length > 0) {
  console.error(
    `\nverify:images — ${errors.length} issue(s) in static/img/{guides,examples,solutions}/:\n`,
  );
  for (const e of errors) console.error(`  ✗ ${e}\n`);
  console.error(
    `Requirements:\n` +
      `  - guides/, examples/   16:9 (±2%), ≥1600x900\n` +
      `  - solutions/           1.91:1 (±2%), ≥1200x628 (Open Graph)\n` +
      `See CONTRIBUTING.md (Image Requirements) for details.\n`,
  );
  process.exit(1);
}

console.log(
  `verify:images — ${checked} raster image(s) pass format checks` +
    (skipped ? ` (${skipped} SVG(s) skipped as vector)` : "") +
    `.`,
);
