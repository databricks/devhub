import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  composeAgentPrompt,
  type AgentPromptKind,
  type AgentPromptParts,
} from "../src/lib/copy-preamble";
import { ABOUT_DEVHUB_SLUG } from "../src/lib/bootstrap-prompt";
import {
  hasContentSlug,
  hasSolutionSlug,
  readContentSections,
  readCookbookGoal,
  readCookbookIntro,
} from "../src/lib/content-markdown";
import { goalOnly } from "../src/lib/content-sections";
import { buildCookbookMarkdownDocument } from "../src/lib/cookbook-composition";
import { expandMdxImports } from "../src/lib/expand-mdx";
import {
  examples,
  filterPublished,
  recipes,
  recipesInOrder,
  cookbooks,
} from "../src/lib/recipes/recipes";
import { showDrafts } from "../src/lib/feature-flags-server";
import {
  solutions,
  isLinkedSolution,
  isNativeSolution,
  type NativeSolution,
} from "../src/lib/solutions/solutions";
import { getAuthor } from "../src/lib/solutions/authors";
import { resolveSiteUrl } from "../src/lib/site-url";

export type MarkdownSection =
  | "docs"
  | "recipes"
  | "solutions"
  | "examples"
  | "templates";

/**
 * Recipe injected into every agent-prompt copy as the "Verify your local
 * Databricks dev environment" block. Must always be the smallest viable
 * prerequisite for downstream DevHub work — currently CLI install + auth.
 */
const LOCAL_BOOTSTRAP_SLUG = "set-up-your-local-dev-environment";

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

function readSolutionMarkdown(
  rootDir: string,
  slug: string,
  siteOrigin: string,
): string {
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

  const native = solutions.find(
    (entry): entry is NativeSolution =>
      entry.id === slug && isNativeSolution(entry),
  );
  if (!native) {
    return content;
  }
  return prependSolutionFrontmatter(content, native, siteOrigin);
}

const FRONTMATTER_PATTERN = /^---\n[\s\S]*?\n---\n?/;

/**
 * Builds the solution markdown payload by prepending a frontmatter block
 * derived entirely from `solutions.ts`. Any frontmatter that may still be
 * present in the source `.md` file is stripped first so the registry stays
 * the single source of truth for solution metadata.
 *
 * The `url` field is emitted as an absolute URL using the resolved site
 * origin, so the frontmatter is portable when the markdown is fetched and
 * pasted into an agent context outside the originating host.
 */
function prependSolutionFrontmatter(
  content: string,
  solution: NativeSolution,
  siteOrigin: string,
): string {
  const stripped = content.replace(FRONTMATTER_PATTERN, "").trimStart();
  const origin = siteOrigin.replace(/\/$/, "");
  const escapedTitle = solution.title.replace(/"/g, '\\"');
  const escapedSummary = solution.description.replace(/"/g, '\\"');
  const authorBlock = solution.authors
    .map((id) => {
      const author = getAuthor(id);
      return [`  - name: ${author.name}`, `    role: ${author.role}`].join(
        "\n",
      );
    })
    .join("\n");

  const frontmatter = [
    "---",
    `title: "${escapedTitle}"`,
    `url: ${origin}/solutions/${solution.id}`,
    `summary: "${escapedSummary}"`,
    `publishedAt: ${solution.publishedAt}`,
    `authors:`,
    authorBlock,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${stripped}`;
}

function readRecipeMarkdown(rootDir: string, slug: string): string {
  if (!hasContentSlug(rootDir, "recipes", slug)) {
    throw new Error(`Recipe page not found: "${slug}"`);
  }
  return goalOnly(readContentSections(rootDir, "recipes", slug));
}

function readExampleMarkdown(rootDir: string, slug: string): string {
  if (!hasContentSlug(rootDir, "examples", slug)) {
    throw new Error(`Example page not found: "${slug}"`);
  }

  const content = goalOnly(readContentSections(rootDir, "examples", slug));

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
      `[View source on GitHub](https://github.com/databricks/devhub/tree/main/${example.githubPath}/template)`,
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

  const goal = readCookbookGoal(rootDir, slug);
  return buildCookbookMarkdownDocument({
    cookbookName: cookbook.name,
    cookbookDescription: cookbook.description,
    goal,
    intro: goal ? undefined : readCookbookIntro(rootDir, slug),
    recipes: recipeInputs,
    mode: "agent",
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

/** Markdown index served at /templates.md — lists every template in one flat catalog. */
function readTemplatesIndex(): string {
  const includeDrafts = showDrafts();
  const publishedCookbooks = filterPublished(cookbooks, includeDrafts);
  const publishedRecipes = filterPublished(recipesInOrder, includeDrafts);
  const publishedExamples = filterPublished(examples, includeDrafts);

  const allTemplates = [
    ...publishedCookbooks,
    ...publishedRecipes,
    ...publishedExamples,
  ];

  const lines: string[] = [
    "# Templates",
    "",
    "Opinionated, copy-pasteable templates for building on Databricks.",
    "",
  ];

  for (const t of allTemplates) {
    lines.push(`- [${t.name}](/templates/${t.id}.md): ${t.description}`);
  }
  lines.push("");

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
    const target = isLinkedSolution(s) ? s.url : `/solutions/${s.id}.md`;
    const suffix = isLinkedSolution(s) ? ` (${s.source})` : "";
    lines.push(`- [${s.title}](${target}): ${s.description}${suffix}`);
  }
  lines.push("");

  return lines.join("\n");
}

export function getDetailMarkdown(
  section: MarkdownSection,
  rawSlug: string,
  rootDir = process.cwd(),
  siteOrigin: string = resolveSiteUrl(),
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
      return readSolutionMarkdown(rootDir, slug, siteOrigin);
    case "examples":
      return readExampleMarkdown(rootDir, slug);
    case "templates":
      return readTemplateMarkdown(rootDir, slug);
    default:
      throw new Error(`Unsupported section: "${section}"`);
  }
}

/** Reads all preamble blocks from disk for the server-side composer. */
export function loadAgentPromptParts(
  rootDir: string = process.cwd(),
): AgentPromptParts {
  const readContent = (slug: string): string =>
    readFileSync(resolve(rootDir, "content", `${slug}.md`), "utf-8");
  return {
    about: readContent(ABOUT_DEVHUB_SLUG),
    guidelines: readContent("dev-guidelines"),
    intentHero: readContent("intent-hero"),
    intentRecipe: readContent("intent-recipe"),
    intentCookbook: readContent("intent-cookbook"),
    intentExample: readContent("intent-example"),
    localBootstrap: goalOnly(
      readContentSections(rootDir, "recipes", LOCAL_BOOTSTRAP_SLUG),
    ),
  };
}

/**
 * Resolves the agent-prompt kind for a section + slug combination. Returns
 * undefined for sections/slugs that should _not_ be wrapped (docs, solutions,
 * empty-slug index pages).
 */
export function resolveTemplateKind(
  section: MarkdownSection,
  slug: string,
  rootDir: string = process.cwd(),
): {
  kind: Exclude<AgentPromptKind, "hero">;
  templateName: string;
  templatePath: string;
} | null {
  if (!slug) return null;

  if (section === "recipes" && hasContentSlug(rootDir, "recipes", slug)) {
    const recipe = recipes.find((r) => r.id === slug);
    if (recipe) {
      return {
        kind: "recipe",
        templateName: recipe.name,
        templatePath: `/templates/${slug}`,
      };
    }
  }

  if (section === "examples" && hasContentSlug(rootDir, "examples", slug)) {
    const example = examples.find((e) => e.id === slug);
    if (example) {
      return {
        kind: "example",
        templateName: example.name,
        templatePath: `/templates/${slug}`,
      };
    }
  }

  if (section === "templates") {
    const recipe = recipes.find((r) => r.id === slug);
    if (recipe) {
      return {
        kind: "recipe",
        templateName: recipe.name,
        templatePath: `/templates/${slug}`,
      };
    }
    const cookbook = cookbooks.find((c) => c.id === slug);
    if (cookbook) {
      return {
        kind: "cookbook",
        templateName: cookbook.name,
        templatePath: `/templates/${slug}`,
      };
    }
    const example = examples.find((e) => e.id === slug);
    if (example) {
      return {
        kind: "example",
        templateName: example.name,
        templatePath: `/templates/${slug}`,
      };
    }
  }

  return null;
}

/**
 * Wraps a template body in the full agent prompt (about + guidelines + intent
 * + local-bootstrap + body). Used by `api/markdown.ts` to serve `.md` URLs and
 * `api/bootstrap-prompt.ts` reuses the same shared composer.
 *
 * `siteOrigin` accepts either a bare host (`localhost:3001`), a host with port
 * (`developers.databricks.com`), or a full origin (`https://developers.databricks.com`).
 */
export function composeTemplateAgentPrompt(input: {
  body: string;
  section: MarkdownSection;
  slug: string;
  siteOrigin: string;
  rootDir?: string;
}): string {
  const rootDir = input.rootDir ?? process.cwd();
  const resolved = resolveTemplateKind(input.section, input.slug, rootDir);
  if (!resolved) {
    throw new Error(
      `composeTemplateAgentPrompt: no template kind for section="${input.section}" slug="${input.slug}".`,
    );
  }
  const origin = normalizeOrigin(input.siteOrigin);
  return composeAgentPrompt({
    parts: loadAgentPromptParts(rootDir),
    kind: resolved.kind,
    siteOrigin: origin,
    templateName: resolved.templateName,
    templateUrl: `${origin}${resolved.templatePath}`,
    templateBody: input.body,
  });
}

function normalizeOrigin(siteUrlOrHost: string): string {
  const trimmed = siteUrlOrHost.replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const protocol = trimmed.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${trimmed}`;
}
