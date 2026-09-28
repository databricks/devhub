import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { resolve } from "path";

import {
  type ContentSectionFile,
  type ContentSections,
} from "./content-sections";

type ContentMarkdownSection = "recipes" | "examples";
type FolderContentSection = "recipes" | "examples";
type TemplateContentSection = "recipes" | "cookbooks" | "examples";

function markdownDirectory(
  rootDir: string,
  section: ContentMarkdownSection,
): string {
  return resolve(rootDir, "src", "content", section);
}

function getChildDirectorySlugsWithFile(
  directory: string,
  fileName: string,
): string[] {
  return readdirSync(directory)
    .filter((entry) => {
      const fullPath = resolve(directory, entry);
      if (!statSync(fullPath).isDirectory()) return false;
      return existsSync(resolve(fullPath, fileName));
    })
    .sort();
}

/**
 * Recipes and examples live in `src/content/<section>/<slug>/` folders.
 * A folder is published if it has goal.md.
 */
export function getContentSlugs(
  rootDir: string,
  section: FolderContentSection,
): string[] {
  return getChildDirectorySlugsWithFile(
    markdownDirectory(rootDir, section),
    "goal.md",
  );
}

export function hasContentSlug(
  rootDir: string,
  section: FolderContentSection,
  slug: string,
): boolean {
  return getContentSlugs(rootDir, section).includes(slug);
}

/** Read a single section file for a slug; returns undefined when an optional file is absent. */
function readContentSection(
  rootDir: string,
  section: FolderContentSection,
  slug: string,
  file: ContentSectionFile,
): string | undefined {
  const filePath = resolve(
    markdownDirectory(rootDir, section),
    slug,
    `${file}.md`,
  );
  if (!existsSync(filePath)) return undefined;
  return readFileSync(filePath, "utf-8");
}

function cookbookDirectory(rootDir: string): string {
  return resolve(rootDir, "src", "content", "cookbooks");
}

/** Returns the list of cookbook slugs published by `goal.md`. */
export function getCookbookSlugs(rootDir: string): string[] {
  const directory = cookbookDirectory(rootDir);
  if (!existsSync(directory)) return [];
  return getChildDirectorySlugsWithFile(directory, "goal.md");
}

/** Reads `src/content/cookbooks/<slug>/goal.md` if present. */
export function readCookbookGoal(
  rootDir: string,
  slug: string,
): string | undefined {
  const filePath = resolve(cookbookDirectory(rootDir), slug, "goal.md");
  if (!existsSync(filePath)) return undefined;
  return readFileSync(filePath, "utf-8");
}

type ReplitPromptTier = "recipes" | "examples" | "cookbooks";

/**
 * Reads `src/content/<tier>/<slug>/replit-prompt.md` if present, prepended with
 * the shared `src/content/replit-shared/preamble.md` separated by `---`. This
 * mirrors the "shared boilerplate + per-template body" composition that
 * `composeAgentPrompt` uses for the Copy prompt feature: each per-template
 * file holds only the unique task; universal routing, PAT fallback,
 * permission handling, style, and out-of-scope rules live in the preamble.
 *
 * Replit prompts are an opt-in export target, not a content section, so
 * they live next to `goal.md` but stay out of `ContentSections` /
 * `readContentSections`.
 *
 * Composition order:
 *   <preamble>
 *   ---
 *   <per-template task>
 */
export function readReplitPrompt(
  rootDir: string,
  tier: ReplitPromptTier,
  slug: string,
): string | undefined {
  const dir =
    tier === "cookbooks"
      ? cookbookDirectory(rootDir)
      : markdownDirectory(rootDir, tier);
  const perTemplatePath = resolve(dir, slug, "replit-prompt.md");
  if (!existsSync(perTemplatePath)) return undefined;

  const preamblePath = resolve(
    rootDir,
    "src",
    "content",
    "replit-shared",
    "preamble.md",
  );
  if (!existsSync(preamblePath)) {
    throw new Error(
      `Required shared file missing: ${preamblePath}. ` +
        `Every replit-prompt.md composes against this preamble; restore the file or remove the per-template prompts.`,
    );
  }
  const preamble = readFileSync(preamblePath, "utf-8").trimEnd();
  const perTemplate = readFileSync(perTemplatePath, "utf-8").trimEnd();
  return `${preamble}\n\n---\n\n${perTemplate}\n`;
}

export function getReplitTemplateIds(
  rootDir: string = process.cwd(),
): string[] {
  const templateSections: TemplateContentSection[] = [
    "cookbooks",
    "examples",
    "recipes",
  ];

  return templateSections
    .flatMap((section) => {
      const directory =
        section === "cookbooks"
          ? cookbookDirectory(rootDir)
          : markdownDirectory(rootDir, section);
      if (!existsSync(directory)) return [];
      return getChildDirectorySlugsWithFile(directory, "replit-prompt.md");
    })
    .sort();
}

/** Reads all present section files; throws when goal.md is missing. */
export function readContentSections(
  rootDir: string,
  section: FolderContentSection,
  slug: string,
): ContentSections {
  const goal = readContentSection(rootDir, section, slug, "goal");
  if (goal === undefined) {
    throw new Error(
      `Missing required goal.md for ${section} "${slug}" at src/content/${section}/${slug}/`,
    );
  }
  const prerequisites = readContentSection(
    rootDir,
    section,
    slug,
    "prerequisites",
  );
  const sections: ContentSections = { goal };
  if (prerequisites !== undefined) sections.prerequisites = prerequisites;
  return sections;
}
