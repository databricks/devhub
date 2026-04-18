#!/usr/bin/env node
// Renders an HTML file into a 1920x1080 PNG suitable for a DevHub resource
// preview image. Drives headless Chromium via Playwright (already a dev dep).
//
// Usage:
//   node scripts/render-resource-image.mjs --input <html> --output <png>
//   node scripts/render-resource-image.mjs --input ./tmp.html --output ./static/img/examples/foo-light.png
//
// The input HTML is expected to render a 1920x1080 canvas into <body>. The
// renderer sets the viewport to 1920x1080 and captures the viewport (not full
// page) so the image is always exactly 16:9 at the right size.

import { chromium } from "playwright";
import { resolve, isAbsolute } from "node:path";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") args.input = argv[++i];
    else if (arg === "--output" || arg === "-o") args.output = argv[++i];
    else if (arg === "--width" || arg === "-w") args.width = Number(argv[++i]);
    else if (arg === "--height" || arg === "-h")
      args.height = Number(argv[++i]);
  }
  return args;
}

const { input, output, width = 1920, height = 1080 } = parseArgs(process.argv);
if (!input || !output) {
  console.error(
    "Usage: render-resource-image.mjs --input <html> --output <png> [--width 1920] [--height 1080]",
  );
  process.exit(2);
}

const inputPath = isAbsolute(input) ? input : resolve(process.cwd(), input);
const outputPath = isAbsolute(output) ? output : resolve(process.cwd(), output);

if (!existsSync(inputPath)) {
  console.error(`Input HTML not found: ${inputPath}`);
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const url = pathToFileURL(inputPath).toString();
await page.goto(url, { waitUntil: "networkidle" });
// Give any web-font/CSS transitions a tick to settle.
await page.waitForTimeout(100);
await page.screenshot({
  path: outputPath,
  type: "png",
  clip: { x: 0, y: 0, width, height },
});
await browser.close();

console.log(`rendered ${outputPath} (${width}x${height})`);
