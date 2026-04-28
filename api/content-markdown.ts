import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { substituteAboutDevhubLlmsUrl } from "../src/lib/copy-preamble";
import { ABOUT_DEVHUB_SLUG } from "../src/lib/bootstrap-prompt";
import {
  hasContentSlug,
  hasSolutionSlug,
  joinContentSections,
  readContentSections,
  readCookbookIntro,
} from "../src/lib/content-markdown";
import { buildCookbookMarkdownDocument } from "../src/lib/cookbook-composition";
import { expandMdxImports } from "../src/lib/expand-mdx";
import {
  examples,
  filterPublished,
  recipes,
  recipesInOrder,
  cookbooks,
} from "../src/lib/recipes/recipes";
import { showDrafts, examplesEnabled } from "../src/lib/feature-flags-server";
import { solutions } from "../src/lib/solutions/solutions";

export type MarkdownSection =
  | "docs"
  | "recipes"
  | "solutions"
  | "examples"
  | "templates";

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
      return expandMdxImports(directContent, directPath);
    }

    const indexPath = resolve(docsDir, slug, `index${extension}`);
    const indexContent = readIfExists(indexPath);
    if (indexContent) {
      return expandMdxImports(indexContent, indexPath);
    }
  }

  throw new Error(`Doc page not found: "${slug}"`);
}

function readSolutionMarkdown(rootDir: string, slug: string): string {
  if (!hasSolutionSlug(rootDir, slug)) {
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
  if (!hasContentSlug(rootDir, "recipes", slug)) {
    throw new Error(`Recipe page not found: "${slug}"`);
  }
  return joinContentSections(readContentSections(rootDir, "recipes", slug));
}

function readExampleMarkdown(rootDir: string, slug: string): string {
  if (!hasContentSlug(rootDir, "examples", slug)) {
    throw new Error(`Example page not found: "${slug}"`);
  }

  const content = joinContentSections(
    readContentSections(rootDir, "examples", slug),
  );

  const example = examples.find((e) => e.id === slug);
  if (!example) {
    return content;
  }

  const lines: string[] = [content.trim(), ""];
  if (example.initCommand) {
    lines.push("## Quick start", "", "```bash", example.initCommand, "```", "");
  }
  if (example.githubPath) {
    lines.push(
      `[View source on GitHub](https://github.com/databricks/devhub/tree/main/${example.githubPath})`,
      "",
    );
  }
  const includedTemplates = [
    ...example.cookbookIds.map((id) => cookbooks.find((c) => c.id === id)),
    ...example.recipeIds.map((id) => recipes.find((r) => r.id === id)),
  ].filter(Boolean);
  if (includedTemplates.length > 0) {
    lines.push("## Included Templates", "");
    for (const t of includedTemplates) {
      lines.push(`- [${t.name}](/templates/${t.id}.md): ${t.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function readCookbookMarkdown(rootDir: string, slug: string): string {
  const cookbook = cookbooks.find((entry) => entry.id === slug);
  if (!cookbook) {
    throw new Error(`Cookbook not found: "${slug}"`);
  }

  const recipeInputs = cookbook.recipeIds.map((recipeId) => {
    const recipe = recipes.find((entry) => entry.id === recipeId);
    if (!recipe) {
      throw new Error(`Recipe not found: "${recipeId}"`);
    }
    if (!hasContentSlug(rootDir, "recipes", recipeId)) {
      throw new Error(`Recipe page not found: "${recipeId}"`);
    }
    return {
      id: recipe.id,
      name: recipe.name,
      sections: readContentSections(rootDir, "recipes", recipeId),
    };
  });

  return buildCookbookMarkdownDocument({
    cookbookName: cookbook.name,
    cookbookDescription: cookbook.description,
    intro: readCookbookIntro(rootDir, slug),
    recipes: recipeInputs,
  });
}

function readTemplateMarkdown(rootDir: string, slug: string): string {
  if (hasContentSlug(rootDir, "recipes", slug)) {
    return readRecipeMarkdown(rootDir, slug);
  }
  if (hasContentSlug(rootDir, "examples", slug)) {
    return readExampleMarkdown(rootDir, slug);
  }
  const cookbook = cookbooks.find((c) => c.id === slug);
  if (cookbook) {
    return readCookbookMarkdown(rootDir, slug);
  }
  throw new Error(`Template not found: "${slug}"`);
}

/** Markdown index served at /templates.md — lists all cookbooks, recipes, and examples. */
function readTemplatesIndex(): string {
  const includeDrafts = showDrafts();
  const includeExamples = examplesEnabled();
  const publishedCookbooks = filterPublished(cookbooks, includeDrafts);
  const publishedRecipes = filterPublished(recipesInOrder, includeDrafts);
  const publishedExamples = includeExamples
    ? filterPublished(examples, includeDrafts)
    : [];

  const lines: string[] = [
    "# Templates",
    "",
    "Templates for building on Databricks.",
    "",
  ];

  if (publishedCookbooks.length > 0) {
    lines.push("## Cookbooks", "");
    for (const t of publishedCookbooks) {
      lines.push(`- [${t.name}](/templates/${t.id}.md): ${t.description}`);
    }
    lines.push("");
  }

  if (publishedRecipes.length > 0) {
    lines.push("## Recipes", "");
    for (const r of publishedRecipes) {
      lines.push(`- [${r.name}](/templates/${r.id}.md): ${r.description}`);
    }
    lines.push("");
  }

  if (publishedExamples.length > 0) {
    lines.push("## Examples", "");
    for (const e of publishedExamples) {
      lines.push(`- [${e.name}](/templates/${e.id}.md): ${e.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Markdown index served at /solutions.md — lists all solutions. */
function readSolutionsIndex(): string {
  const lines: string[] = [
    "# Solutions",
    "",
    "Databricks use-case solutions built on Lakebase, Agent Bricks, and Databricks Apps.",
    "",
  ];

  for (const s of solutions) {
    lines.push(`- [${s.title}](/solutions/${s.id}.md): ${s.description}`);
  }
  lines.push("");

  return lines.join("\n");
}

export function getDetailMarkdown(
  section: MarkdownSection,
  rawSlug: string,
  rootDir = process.cwd(),
): string {
  const slug = normalizeSlug(rawSlug);

  // Empty slug → serve the section index page (e.g., /templates.md, /solutions.md)
  if (!slug || slug.trim() === "") {
    if (section === "templates") return readTemplatesIndex();
    if (section === "solutions") return readSolutionsIndex();
    throw new Error("Missing slug");
  }

  validateSlug(slug);

  switch (section) {
    case "docs":
      return readDocsMarkdown(rootDir, slug);
    case "recipes":
      return readRecipeMarkdown(rootDir, slug);
    case "solutions":
      return readSolutionMarkdown(rootDir, slug);
    case "examples":
      return readExampleMarkdown(rootDir, slug);
    case "templates":
      return readTemplateMarkdown(rootDir, slug);
    default:
      throw new Error(`Unsupported section: "${section}"`);
  }
}

export function readAboutDevhubBody(rootDir: string = process.cwd()): string {
  const filePath = resolve(rootDir, "content", `${ABOUT_DEVHUB_SLUG}.md`);
  return readFileSync(filePath, "utf-8");
}

/**
 * Prepends the About DevHub block (with llms.txt URL substituted to point at
 * the caller's site origin) to a markdown body. Accepts either a bare host
 * (`localhost:3001`) or a full origin (`https://dev.databricks.com`) for
 * backwards-compatibility with existing tests.
 */
export function prependLlmsReference(
  markdown: string,
  siteUrlOrHost: string,
): string {
  const llmsUrl = toLlmsUrl(siteUrlOrHost);
  const about = substituteAboutDevhubLlmsUrl(
    readAboutDevhubBody(process.cwd()),
    llmsUrl,
  );
  return `${about.trimEnd()}\n\n${markdown.trimEnd()}\n`;
}

function toLlmsUrl(siteUrlOrHost: string): string {
  if (/^https?:\/\//i.test(siteUrlOrHost)) {
    return `${siteUrlOrHost.replace(/\/$/, "")}/llms.txt`;
  }
  const protocol = siteUrlOrHost.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${siteUrlOrHost}/llms.txt`;
}
