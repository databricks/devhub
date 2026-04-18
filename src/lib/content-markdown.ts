import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import {
  REQUIRED_CONTENT_SECTION_FILE,
  type ContentSectionFile,
  type ContentSections,
} from "./content-sections";

export {
  CONTENT_SECTION_FILES,
  REQUIRED_CONTENT_SECTION_FILE,
  joinContentSections,
} from "./content-sections";
export type { ContentSectionFile, ContentSections } from "./content-sections";

export type ContentMarkdownSection = "recipes" | "solutions" | "examples";
export type FolderContentSection = "recipes" | "examples";

function markdownDirectory(
  rootDir: string,
  section: ContentMarkdownSection,
): string {
  return resolve(rootDir, "content", section);
}

/** Solutions are still single flat `.md` files. */
export function getSolutionSlugs(rootDir: string): string[] {
  const directory = markdownDirectory(rootDir, "solutions");
  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.slice(0, -3))
    .sort();
}

export function hasSolutionSlug(rootDir: string, slug: string): boolean {
  return getSolutionSlugs(rootDir).includes(slug);
}

/** Recipes and examples live in `content/<section>/<slug>/` folders with a required content.md. */
export function getContentSlugs(
  rootDir: string,
  section: FolderContentSection,
): string[] {
  const directory = markdownDirectory(rootDir, section);
  return readdirSync(directory)
    .filter((entry) => {
      const fullPath = resolve(directory, entry);
      if (!statSync(fullPath).isDirectory()) return false;
      return existsSync(
        resolve(fullPath, `${REQUIRED_CONTENT_SECTION_FILE}.md`),
      );
    })
    .sort();
}

export function hasContentSlug(
  rootDir: string,
  section: FolderContentSection,
  slug: string,
): boolean {
  return getContentSlugs(rootDir, section).includes(slug);
}

/** Read a single section file for a slug; returns undefined when an optional file is absent. */
export function readContentSection(
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

/** Cookbooks only accept an optional intro.md today; folders with other files are rejected by the validator. */
export const COOKBOOK_FILES = ["intro"] as const;
export type CookbookFile = (typeof COOKBOOK_FILES)[number];

function cookbookDirectory(rootDir: string): string {
  return resolve(rootDir, "content", "cookbooks");
}

/** Returns the list of cookbook slugs that have at least one file in their folder. */
export function getCookbookSlugs(rootDir: string): string[] {
  const directory = cookbookDirectory(rootDir);
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((entry) => {
      const fullPath = resolve(directory, entry);
      if (!statSync(fullPath).isDirectory()) return false;
      return readdirSync(fullPath).some((name) => name.endsWith(".md"));
    })
    .sort();
}

/** Reads `content/cookbooks/<slug>/intro.md` if present. */
export function readCookbookIntro(
  rootDir: string,
  slug: string,
): string | undefined {
  const filePath = resolve(cookbookDirectory(rootDir), slug, "intro.md");
  if (!existsSync(filePath)) return undefined;
  return readFileSync(filePath, "utf-8");
}

/** Reads all present section files; throws when the required content.md is missing. */
export function readContentSections(
  rootDir: string,
  section: FolderContentSection,
  slug: string,
): ContentSections {
  const content = readContentSection(rootDir, section, slug, "content");
  if (content === undefined) {
    throw new Error(
      `Missing required content.md for ${section} "${slug}" at content/${section}/${slug}/content.md`,
    );
  }
  const prerequisites = readContentSection(
    rootDir,
    section,
    slug,
    "prerequisites",
  );
  const deployment = readContentSection(rootDir, section, slug, "deployment");
  const sections: ContentSections = { content };
  if (prerequisites !== undefined) sections.prerequisites = prerequisites;
  if (deployment !== undefined) sections.deployment = deployment;
  return sections;
}
