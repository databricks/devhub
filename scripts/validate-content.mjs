#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const ROOT = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

if (!existsSync(resolve(ROOT, "content"))) {
  console.error(
    `No content/ directory found in ${ROOT}. Run validate-content from the DevHub repo root or pass a path.`,
  );
  process.exit(1);
}

const RESOURCE_ALLOWED_FILES = new Set(["goal.md", "prerequisites.md"]);
/** A folder must have at least one of these to be published. */
const RESOURCE_REQUIRED_FILES = ["goal.md"];
const RESOURCE_SECTIONS = /** @type {const} */ (["recipes", "examples"]);

const COOKBOOK_ALLOWED_FILES = new Set(["goal.md", "intro.md"]);

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
 * @param {string[]=} opts.requiredFiles  at least one of these must be present (omit for none)
 * @param {string} opts.emptyHint  trailing instruction appended to the "is empty" error
 * @param {string} opts.flatHint   trailing instruction appended to the "is not a directory" error
 */
function validateContentFolder({
  sectionPath,
  sectionDir,
  allowedFiles,
  requiredFiles,
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

    if (
      requiredFiles &&
      requiredFiles.length > 0 &&
      !requiredFiles.some((f) => files.includes(f))
    ) {
      errors.push(
        `${sectionPath}/${entry}/ is missing a required file. Need at least one of: ${requiredFiles.join(", ")}.`,
      );
    }
  }
}

for (const section of RESOURCE_SECTIONS) {
  validateContentFolder({
    sectionPath: `content/${section}`,
    sectionDir: resolve(ROOT, "content", section),
    allowedFiles: RESOURCE_ALLOWED_FILES,
    requiredFiles: RESOURCE_REQUIRED_FILES,
    emptyHint: "Add goal.md.",
    flatHint: `Flat files are not allowed. Move to content/${section}/<slug>/goal.md.`,
  });
}

/**
 * Solutions are flat markdown files at content/solutions/<slug>.md. Their H1
 * (title) is injected by the SolutionDetail component from the registry, so
 * the markdown body must NOT start with — or contain — a `# ` ATX heading.
 * Section headings start at `##` (and may go deeper). Setext-style underlines
 * (`====` / `----`) are also rejected to keep the rule mechanical.
 */
const solutionsDir = resolve(ROOT, "content", "solutions");
if (existsSync(solutionsDir)) {
  for (const entry of readdirSync(solutionsDir)) {
    if (!entry.endsWith(".md")) continue;
    const filePath = resolve(solutionsDir, entry);
    if (!statSync(filePath).isFile()) continue;
    const fileLabel = `content/solutions/${entry}`;
    const source = readFileSync(filePath, "utf-8");
    const body = stripFencedCodeBlocks(stripFrontmatter(source));
    const lines = body.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^# (?!#)/.test(line)) {
        errors.push(
          `${fileLabel}:${i + 1}: solution markdown must not contain an H1 heading. ` +
            `The page title is rendered from the registry; start sections at "## ".`,
        );
      }
      const next = lines[i + 1];
      if (line.trim() && next && /^=+\s*$/.test(next)) {
        errors.push(
          `${fileLabel}:${i + 2}: solution markdown must not contain a setext H1 (\`===\` underline). ` +
            `The page title is rendered from the registry; start sections at "## ".`,
        );
      }
    }
  }
}

const cookbooksDir = resolve(ROOT, "content", "cookbooks");
if (existsSync(cookbooksDir)) {
  validateContentFolder({
    sectionPath: "content/cookbooks",
    sectionDir: cookbooksDir,
    allowedFiles: COOKBOOK_ALLOWED_FILES,
    emptyHint: "Add goal.md or intro.md, or remove the folder.",
    flatHint: "Cookbook content lives under content/cookbooks/<template-id>/.",
  });
}

/**
 * Walks every markdown / MDX file under one of the content roots and
 * accumulates absolute-DevHub-link offenders. Authors must use root-relative
 * paths (`/templates/...`, `/docs/...`, `/solutions/...`) inside markdown
 * link, autolink, and reference-definition syntax. The runtime helper
 * `absolutizeMarkdown` (src/lib/copy-preamble.ts) rewrites them to the
 * caller's origin when a page is served, so the same file works in
 * `localhost:3001`, preview deployments, and production.
 *
 * Bare textual URLs in prose and any URL inside a fenced code block are
 * deliberately allowed:
 *   - Bare prose URLs (e.g. "Website: https://developers.databricks.com",
 *     "fetch https://developers.databricks.com/llms.txt") are agent fetch
 *     directives that `rewriteOrigin` handles via canonical-origin
 *     substitution.
 *   - Code-block URLs (e.g. `npx add-mcp https://developers.databricks.com/api/mcp`)
 *     are install commands and must remain canonical.
 */
const FORBIDDEN_LINK_PATH = /(templates|docs|solutions)/;

function stripFencedCodeBlocks(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

function findAbsoluteDevhubOffenders(filePath, source) {
  const offenders = [];
  const body = stripFencedCodeBlocks(stripFrontmatter(source));

  const inlineLink =
    /\]\((https:\/\/developers\.databricks\.com\/([^)\s]*))(?:\s+"[^"]*")?\)/g;
  for (const match of body.matchAll(inlineLink)) {
    const [, fullUrl, path] = match;
    if (FORBIDDEN_LINK_PATH.test(path)) {
      offenders.push({
        kind: "markdown link",
        url: fullUrl,
        suggestion: `/${path}`,
      });
    }
  }

  const autolink = /<(https:\/\/developers\.databricks\.com\/([^>\s]*))>/g;
  for (const match of body.matchAll(autolink)) {
    const [, fullUrl, path] = match;
    if (FORBIDDEN_LINK_PATH.test(path)) {
      offenders.push({
        kind: "autolink",
        url: fullUrl,
        suggestion: `</${path}>`,
      });
    }
  }

  const referenceDef =
    /^\[[^\]]+\]:\s+(https:\/\/developers\.databricks\.com\/(\S*))/gm;
  for (const match of body.matchAll(referenceDef)) {
    const [, fullUrl, path] = match;
    if (FORBIDDEN_LINK_PATH.test(path)) {
      offenders.push({
        kind: "reference definition",
        url: fullUrl,
        suggestion: `/${path}`,
      });
    }
  }

  return offenders.map(
    (offender) =>
      `${filePath}: absolute DevHub ${offender.kind} "${offender.url}" — use root-relative "${offender.suggestion}" instead. absolutizeMarkdown will rewrite it to the caller's origin at serve/copy time.`,
  );
}

function* walkMarkdownFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdownFiles(full);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
    ) {
      yield full;
    }
  }
}

const LINK_VALIDATION_ROOTS = ["content", "docs"];

for (const dirName of LINK_VALIDATION_ROOTS) {
  const dir = resolve(ROOT, dirName);
  if (!existsSync(dir)) continue;
  for (const file of walkMarkdownFiles(dir)) {
    const source = readFileSync(file, "utf-8");
    const fileLabel = relative(ROOT, file);
    for (const offender of findAbsoluteDevhubOffenders(fileLabel, source)) {
      errors.push(offender);
    }
  }
}

if (errors.length > 0) {
  console.error("Content validation failed:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(
    `\n${errors.length} error(s). See .agents/skills/author-recipes-and-cookbooks/SKILL.md (the "Link Style" and folder-layout sections) for the expected conventions.`,
  );
  process.exit(1);
}

console.log(
  `Content validation passed (folder layout: ${[...RESOURCE_SECTIONS.map((s) => `content/${s}/`), "content/cookbooks/"].join(", ")}; ` +
    `solutions H1 audit: content/solutions/; ` +
    `absolute-DevHub link audit: ${LINK_VALIDATION_ROOTS.map((d) => `${d}/`).join(", ")}).`,
);
