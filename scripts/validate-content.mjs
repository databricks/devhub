#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

if (!existsSync(resolve(ROOT, "content"))) {
  console.error(
    `No content/ directory found in ${ROOT}. Run validate-content from the DevHub repo root or pass a path.`,
  );
  process.exit(1);
}

const RESOURCE_ALLOWED_FILES = new Set([
  "content.md",
  "prerequisites.md",
  "deployment.md",
]);
const RESOURCE_REQUIRED_FILE = "content.md";
const RESOURCE_SECTIONS = /** @type {const} */ (["recipes", "examples"]);

const COOKBOOK_ALLOWED_FILES = new Set(["intro.md"]);

/** @type {string[]} */
const errors = [];

/**
 * Validate every entry in a content section folder. Each entry must be a
 * directory whose direct children are markdown files from `allowedFiles`,
 * with `requiredFile` present when set.
 *
 * @param {object} opts
 * @param {string} opts.sectionPath  e.g. "content/recipes" — used in error messages
 * @param {string} opts.sectionDir   absolute filesystem path to the section
 * @param {Set<string>} opts.allowedFiles  whitelist of allowed direct-child filenames
 * @param {string=} opts.requiredFile  filename that must be present (omit for none)
 * @param {string} opts.emptyHint  trailing instruction appended to the "is empty" error
 * @param {string} opts.flatHint   trailing instruction appended to the "is not a directory" error
 */
function validateContentFolder({
  sectionPath,
  sectionDir,
  allowedFiles,
  requiredFile,
  emptyHint,
  flatHint,
}) {
  for (const entry of readdirSync(sectionDir)) {
    const entryPath = resolve(sectionDir, entry);
    const stats = statSync(entryPath);

    if (!stats.isDirectory()) {
      errors.push(`${sectionPath}/${entry} is not a directory. ${flatHint}`);
      continue;
    }

    const files = readdirSync(entryPath);
    if (files.length === 0) {
      errors.push(`${sectionPath}/${entry}/ is empty. ${emptyHint}`);
      continue;
    }

    for (const file of files) {
      const childPath = resolve(entryPath, file);
      if (!statSync(childPath).isFile()) {
        errors.push(
          `${sectionPath}/${entry}/${file} is a directory. Only markdown files are allowed.`,
        );
        continue;
      }
      if (!allowedFiles.has(file)) {
        errors.push(
          `${sectionPath}/${entry}/${file} is not an allowed filename. Allowed: ${[...allowedFiles].sort().join(", ")}.`,
        );
      }
    }

    if (requiredFile && !files.includes(requiredFile)) {
      errors.push(
        `${sectionPath}/${entry}/ is missing the required ${requiredFile}.`,
      );
    }
  }
}

for (const section of RESOURCE_SECTIONS) {
  validateContentFolder({
    sectionPath: `content/${section}`,
    sectionDir: resolve(ROOT, "content", section),
    allowedFiles: RESOURCE_ALLOWED_FILES,
    requiredFile: RESOURCE_REQUIRED_FILE,
    emptyHint: "Add content.md.",
    flatHint: `Flat files are not allowed. Move to content/${section}/<slug>/content.md.`,
  });
}

const cookbooksDir = resolve(ROOT, "content", "cookbooks");
if (existsSync(cookbooksDir)) {
  validateContentFolder({
    sectionPath: "content/cookbooks",
    sectionDir: cookbooksDir,
    allowedFiles: COOKBOOK_ALLOWED_FILES,
    emptyHint: "Add at least intro.md or remove the folder.",
    flatHint: "Cookbook content lives under content/cookbooks/<template-id>/.",
  });
}

if (errors.length > 0) {
  console.error("Content folder validation failed:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(
    `\n${errors.length} error(s). See .agents/skills/author-recipes-and-cookbooks for the expected layout.`,
  );
  process.exit(1);
}

console.log(
  `Content folder validation passed (${[...RESOURCE_SECTIONS.map((s) => `content/${s}/`), "content/cookbooks/"].join(", ")}).`,
);
