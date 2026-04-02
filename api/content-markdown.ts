import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { hasMarkdownSlug } from "../src/lib/content-markdown";
import { recipes, templates } from "../src/lib/recipes/recipes";
import {
  buildTemplateMarkdownDocument,
  collectTemplateRecipeIds,
} from "../src/lib/template-content";

export type MarkdownSection = "docs" | "recipes" | "solutions" | "templates";

function validateSlug(slug: string): void {
  if (!slug || slug.trim() === "") {
    throw new Error("Missing slug");
  }
  if (slug.includes("..")) {
    throw new Error('Invalid slug: path traversal ("..") is not allowed');
  }
  if (slug.includes("://")) {
    throw new Error("Invalid slug: absolute URLs are not allowed");
  }
  if (slug.startsWith("/")) {
    throw new Error('Invalid slug: slug must not start with "/"');
  }
}

function normalizeSlug(rawSlug: string): string {
  const trimmed = rawSlug.trim();
  return trimmed.endsWith(".md") ? trimmed.slice(0, -3) : trimmed;
}

function readIfExists(filePath: string): string | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }
  return readFileSync(filePath, "utf-8");
}

function readDocsMarkdown(rootDir: string, slug: string): string {
  const docsDir = resolve(rootDir, "docs");
  const extensions = [".md", ".mdx"];
  for (const extension of extensions) {
    const directPath = resolve(docsDir, `${slug}${extension}`);
    const directContent = readIfExists(directPath);
    if (directContent) {
      return directContent;
    }

    const indexPath = resolve(docsDir, slug, `index${extension}`);
    const indexContent = readIfExists(indexPath);
    if (indexContent) {
      return indexContent;
    }
  }

  throw new Error(`Doc page not found: "${slug}"`);
}

function readSolutionMarkdown(rootDir: string, slug: string): string {
  if (!hasMarkdownSlug(rootDir, "solutions", slug)) {
    throw new Error(`Solution page not found: "${slug}"`);
  }

  const contentPath = resolve(rootDir, "content", "solutions", `${slug}.md`);
  const content = readIfExists(contentPath);
  if (!content) {
    throw new Error(
      `Solution markdown source missing for "${slug}" at content/solutions/${slug}.md`,
    );
  }
  return content;
}

function readRecipeMarkdown(rootDir: string, slug: string): string {
  if (!hasMarkdownSlug(rootDir, "recipes", slug)) {
    throw new Error(`Recipe page not found: "${slug}"`);
  }

  const contentPath = resolve(rootDir, "content", "recipes", `${slug}.md`);
  const content = readIfExists(contentPath);
  if (!content) {
    throw new Error(
      `Recipe markdown source missing for "${slug}" at content/recipes/${slug}.md`,
    );
  }
  return content;
}

function readTemplateMarkdown(rootDir: string, slug: string): string {
  const template = templates.find((entry) => entry.id === slug);
  if (!template) {
    throw new Error(`Template page not found: "${slug}"`);
  }

  const rawBySlug = Object.fromEntries(
    collectTemplateRecipeIds(template).map((recipeId) => {
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (!recipe) {
        throw new Error(`Recipe not found: "${recipeId}"`);
      }

      return [recipeId, readRecipeMarkdown(rootDir, recipeId)];
    }),
  );

  return buildTemplateMarkdownDocument(template, rawBySlug);
}

export function getDetailMarkdown(
  section: MarkdownSection,
  rawSlug: string,
  rootDir = process.cwd(),
): string {
  const slug = normalizeSlug(rawSlug);
  validateSlug(slug);

  switch (section) {
    case "docs":
      return readDocsMarkdown(rootDir, slug);
    case "recipes":
      return readRecipeMarkdown(rootDir, slug);
    case "solutions":
      return readSolutionMarkdown(rootDir, slug);
    case "templates":
      return readTemplateMarkdown(rootDir, slug);
    default:
      throw new Error(`Unsupported section: "${section}"`);
  }
}
