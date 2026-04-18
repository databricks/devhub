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

for (const section of RESOURCE_SECTIONS) {
  const sectionDir = resolve(ROOT, "content", section);
  const entries = readdirSync(sectionDir);

  for (const entry of entries) {
    const entryPath = resolve(sectionDir, entry);
    const stats = statSync(entryPath);

    if (!stats.isDirectory()) {
      errors.push(
        `content/${section}/${entry} is not a directory. Flat files are not allowed. Move to content/${section}/${entry.replace(/\.md$/, "")}/content.md.`,
      );
      continue;
    }

    const files = readdirSync(entryPath);
    if (files.length === 0) {
      errors.push(`content/${section}/${entry}/ is empty. Add content.md.`);
      continue;
    }

    for (const file of files) {
      const childPath = resolve(entryPath, file);
      const childStats = statSync(childPath);
      if (!childStats.isFile()) {
        errors.push(
          `content/${section}/${entry}/${file} is a directory. Only markdown files are allowed.`,
        );
        continue;
      }
      if (!RESOURCE_ALLOWED_FILES.has(file)) {
        errors.push(
          `content/${section}/${entry}/${file} is not an allowed filename. Allowed: ${[...RESOURCE_ALLOWED_FILES].sort().join(", ")}.`,
        );
      }
    }

    if (!files.includes(RESOURCE_REQUIRED_FILE)) {
      errors.push(
        `content/${section}/${entry}/ is missing the required ${RESOURCE_REQUIRED_FILE}.`,
      );
    }
  }
}

const cookbooksDir = resolve(ROOT, "content", "cookbooks");
if (existsSync(cookbooksDir)) {
  for (const entry of readdirSync(cookbooksDir)) {
    const entryPath = resolve(cookbooksDir, entry);
    const stats = statSync(entryPath);

    if (!stats.isDirectory()) {
      errors.push(
        `content/cookbooks/${entry} is not a directory. Cookbook content lives under content/cookbooks/<template-id>/.`,
      );
      continue;
    }

    const files = readdirSync(entryPath);
    if (files.length === 0) {
      errors.push(
        `content/cookbooks/${entry}/ is empty. Add at least intro.md or remove the folder.`,
      );
      continue;
    }

    for (const file of files) {
      const childPath = resolve(entryPath, file);
      const childStats = statSync(childPath);
      if (!childStats.isFile()) {
        errors.push(
          `content/cookbooks/${entry}/${file} is a directory. Only markdown files are allowed.`,
        );
        continue;
      }
      if (!COOKBOOK_ALLOWED_FILES.has(file)) {
        errors.push(
          `content/cookbooks/${entry}/${file} is not an allowed filename. Allowed: ${[...COOKBOOK_ALLOWED_FILES].sort().join(", ")}.`,
        );
      }
    }
  }
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
