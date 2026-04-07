import { readdirSync } from "fs";
import { resolve } from "path";

export type ContentMarkdownSection = "recipes" | "solutions" | "cookbooks";

function markdownDirectory(
  rootDir: string,
  section: ContentMarkdownSection,
): string {
  return resolve(rootDir, "content", section);
}

export function getMarkdownSlugs(
  rootDir: string,
  section: ContentMarkdownSection,
): string[] {
  const directory = markdownDirectory(rootDir, section);
  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.slice(0, -3))
    .sort();
}

export function hasMarkdownSlug(
  rootDir: string,
  section: ContentMarkdownSection,
  slug: string,
): boolean {
  return getMarkdownSlugs(rootDir, section).includes(slug);
}
