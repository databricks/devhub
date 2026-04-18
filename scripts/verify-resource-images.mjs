#!/usr/bin/env node
// Verifies every raster image under static/img/guides/ and static/img/examples/
// meets the DevHub resource-image contract so cards + detail pages render
// consistently.
//
// Contract:
//   - Aspect ratio: 16:9 (width / height = 1.7778, tolerance ±2%)
//   - Minimum resolution: 1600 x 900 px
//   - File types: .png, .jpg, .jpeg, .webp (rasters checked)
//                 .svg is exempt (vector)
//
// Run locally:      npm run verify:images
// Runs on:          pre-commit
// Fix by:           re-export screenshots at 1600x900 (or any exact 16:9).

import { readdir, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "image-size";
import { readFile } from "node:fs/promises";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const ROOTS = [
  join(REPO_ROOT, "static/img/guides"),
  join(REPO_ROOT, "static/img/examples"),
];

const TARGET_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.02;
const MIN_WIDTH = 1600;
const MIN_HEIGHT = 900;
const RASTER_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const VECTOR_EXTS = new Set([".svg"]);

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

function verifyRaster(bytes, absPath) {
  const { width, height } = imageSize(bytes);
  if (!width || !height) {
    return [
      `Could not read dimensions for ${relative(REPO_ROOT, absPath)}. ` +
        `Re-export as PNG or JPEG and try again.`,
    ];
  }
  const actualRatio = width / height;
  const ratioDelta = Math.abs(actualRatio - TARGET_RATIO) / TARGET_RATIO;
  const errors = [];
  if (ratioDelta > RATIO_TOLERANCE) {
    errors.push(
      `${relative(REPO_ROOT, absPath)}: wrong aspect ratio.\n` +
        `    expected: 16:9 (${TARGET_RATIO.toFixed(3)}:1), tolerance ±${(
          RATIO_TOLERANCE * 100
        ).toFixed(0)}%\n` +
        `    actual:   ${formatRatio(width, height)}\n` +
        `    fix:      re-export this screenshot at 1600x900 (or any exact 16:9 size).`,
    );
  }
  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    errors.push(
      `${relative(REPO_ROOT, absPath)}: below minimum resolution.\n` +
        `    expected: ≥ ${MIN_WIDTH}x${MIN_HEIGHT}\n` +
        `    actual:   ${width}x${height}\n` +
        `    fix:      re-export at higher resolution (recommended: 1920x1080).`,
    );
  }
  return errors;
}

const allFiles = [];
for (const root of ROOTS) {
  allFiles.push(...(await walk(root)));
}

if (allFiles.length === 0) {
  console.log(
    `verify:images — no files under static/img/guides/ or static/img/examples/, skipping.`,
  );
  process.exit(0);
}

const errors = [];
let checked = 0;
let skipped = 0;

for (const file of allFiles) {
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
  const fileErrors = verifyRaster(bytes, file);
  if (fileErrors.length === 0) {
    checked++;
  } else {
    errors.push(...fileErrors);
  }
}

if (errors.length > 0) {
  console.error(
    `\nverify:images — ${errors.length} issue(s) in static/img/guides/ or static/img/examples/:\n`,
  );
  for (const e of errors) console.error(`  ✗ ${e}\n`);
  console.error(
    `Requirements: 16:9 aspect ratio (±2%), minimum ${MIN_WIDTH}x${MIN_HEIGHT}px.\n` +
      `See CONTRIBUTING.md (Image Requirements) for details.\n`,
  );
  process.exit(1);
}

console.log(
  `verify:images — ${checked} raster image(s) pass 16:9 / ≥${MIN_WIDTH}x${MIN_HEIGHT}` +
    (skipped ? ` (${skipped} SVG(s) skipped as vector)` : "") +
    `.`,
);
