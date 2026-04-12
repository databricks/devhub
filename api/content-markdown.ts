import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { hasMarkdownSlug } from "../src/lib/content-markdown";
import { buildCopyPreamble } from "../src/lib/copy-preamble";
import { expandMdxImports } from "../src/lib/expand-mdx";
import {
  examples,
  recipes,
  recipesInOrder,
  templates,
} from "../src/lib/recipes/recipes";
import { solutions } from "../src/lib/solutions/solutions";

export type MarkdownSection =
  | "docs"
  | "recipes"
  | "solutions"
  | "examples"
  | "templates"
  | "resources";

function recipeMarkdownPath(recipeId: string): string {
  return `content/recipes/${recipeId}.md`;
}

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

function readExampleMarkdown(rootDir: string, slug: string): string {
  if (!hasMarkdownSlug(rootDir, "examples", slug)) {
    throw new Error(`Example page not found: "${slug}"`);
  }

  const contentPath = resolve(rootDir, "content", "examples", `${slug}.md`);
  const content = readIfExists(contentPath);
  if (!content) {
    throw new Error(
      `Example markdown source missing for "${slug}" at content/examples/${slug}.md`,
    );
  }

  const example = examples.find((e) => e.id === slug);
  const lines: string[] = [];
  if (example) {
    lines.push(content.trim(), "");
    if (example.initCommand) {
      lines.push(
        "## Quick start",
        "",
        "```bash",
        example.initCommand,
        "```",
        "",
      );
    }
    if (example.githubPath) {
      lines.push(
        `[View source on GitHub](https://github.com/databricks/devhub/tree/main/${example.githubPath})`,
        "",
      );
    }
    const includedResources = [
      ...example.templateIds.map((id) => templates.find((t) => t.id === id)),
      ...example.recipeIds.map((id) => recipes.find((r) => r.id === id)),
    ].filter(Boolean);
    if (includedResources.length > 0) {
      lines.push("## Included Resources", "");
      for (const resource of includedResources) {
        lines.push(
          `- [${resource.name}](/resources/${resource.id}.md): ${resource.description}`,
        );
      }
      lines.push("");
    }
    return lines.join("\n");
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
    if (!recipe) {
      throw new Error(`Recipe not found: "${recipeId}"`);
    }
    if (!hasMarkdownSlug(rootDir, "recipes", recipeId)) {
      throw new Error(`Recipe page not found: "${recipeId}"`);
    }

    const recipePath = recipeMarkdownPath(recipeId);
    const absoluteRecipePath = resolve(rootDir, recipePath);
    const recipeContent = readIfExists(absoluteRecipePath);
    if (!recipeContent) {
      throw new Error(
        `Recipe markdown missing for "${recipeId}" at ${recipePath}`,
      );
    }

    lines.push(recipeContent.trim());
    lines.push("");
  }

  return lines.join("\n");
}

function readResourceMarkdown(rootDir: string, slug: string): string {
  if (hasMarkdownSlug(rootDir, "recipes", slug)) {
    return readRecipeMarkdown(rootDir, slug);
  }
  if (hasMarkdownSlug(rootDir, "examples", slug)) {
    return readExampleMarkdown(rootDir, slug);
  }
  const template = templates.find((t) => t.id === slug);
  if (template) {
    return readTemplateMarkdown(rootDir, slug);
  }
  throw new Error(`Resource page not found: "${slug}"`);
}

/** Markdown index served at /resources.md — lists all templates, recipes, and examples. */
function readResourcesIndex(): string {
  const lines: string[] = [
    "# Resources",
    "",
    "Guides and examples for building on Databricks.",
    "",
  ];

  if (templates.length > 0) {
    lines.push("## Guides", "");
    for (const t of templates) {
      lines.push(`- [${t.name}](/resources/${t.id}.md): ${t.description}`);
    }
    lines.push("");
  }

  if (recipesInOrder.length > 0) {
    lines.push("## Recipes", "");
    for (const r of recipesInOrder) {
      lines.push(`- [${r.name}](/resources/${r.id}.md): ${r.description}`);
    }
    lines.push("");
  }

  if (examples.length > 0) {
    lines.push("## Examples", "");
    for (const e of examples) {
      lines.push(`- [${e.name}](/resources/${e.id}.md): ${e.description}`);
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

  // Empty slug → serve the section index page (e.g., /resources.md, /solutions.md)
  if (!slug || slug.trim() === "") {
    if (section === "resources") return readResourcesIndex();
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
    case "resources":
      return readResourceMarkdown(rootDir, slug);
    default:
      throw new Error(`Unsupported section: "${section}"`);
  }
}

export function prependLlmsReference(markdown: string, host: string): string {
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const llmsUrl = `${protocol}://${host}/llms.txt`;
  return `${buildCopyPreamble(llmsUrl)}\n\n${markdown.trimEnd()}\n`;
}
