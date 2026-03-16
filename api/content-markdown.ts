import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { recipes, templates } from "../src/lib/recipes/recipes";
import { solutions } from "../src/lib/solutions/solutions";

export type MarkdownSection = "docs" | "solutions" | "templates";

const RECIPE_MARKDOWN_PATH_BY_ID: Record<string, string> = {
  "databricks-local-bootstrap":
    "src/pages/resources/_recipes/databricks-local-bootstrap.mdx",
  "vercel-ai-chat-app": "src/pages/resources/_recipes/ai-chat-model-serving.mdx",
  "lakebase-data-persistence":
    "src/pages/resources/_recipes/lakebase-data-persistence.mdx",
  "genie-conversational-analytics":
    "src/pages/resources/_recipes/genie-conversational-analytics.mdx",
  "sql-analytics-dashboard":
    "src/pages/resources/_recipes/sql-analytics-dashboard.mdx",
};

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
  const solutionExists = solutions.some((solution) => solution.id === slug);
  if (!solutionExists) {
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

function readTemplateMarkdown(rootDir: string, slug: string): string {
  const template = templates.find((entry) => entry.id === slug);
  if (!template) {
    throw new Error(`Template page not found: "${slug}"`);
  }

  const lines: string[] = [
    "---",
    `title: "${template.name.replace(/"/g, '\\"')}"`,
    `url: /resources/${template.id}`,
    `summary: "${template.description.replace(/"/g, '\\"')}"`,
    "---",
    "",
    `# ${template.name}`,
    "",
    template.description,
    "",
  ];

  for (const recipeId of template.recipeIds) {
    const recipe = recipes.find((entry) => entry.id === recipeId);
    const recipePath = RECIPE_MARKDOWN_PATH_BY_ID[recipeId];
    if (!recipe || !recipePath) {
      throw new Error(`Template recipe mapping missing for "${recipeId}"`);
    }

    const absoluteRecipePath = resolve(rootDir, recipePath);
    const recipeContent = readIfExists(absoluteRecipePath);
    if (!recipeContent) {
      throw new Error(
        `Template recipe markdown missing for "${recipeId}" at ${recipePath}`,
      );
    }

    lines.push(`## ${recipe.name}`);
    lines.push("");
    lines.push(recipeContent.trim());
    lines.push("");
  }

  return lines.join("\n");
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
    case "solutions":
      return readSolutionMarkdown(rootDir, slug);
    case "templates":
      return readTemplateMarkdown(rootDir, slug);
    default:
      throw new Error(`Unsupported section: "${section}"`);
  }
}
