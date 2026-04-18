import type { ContentSections } from "@/lib/content-sections";

export type CookbookRecipeInput = {
  id: string;
  name: string;
  sections: ContentSections;
};

export type CookbookCompositionInput = {
  templateName: string;
  templateDescription: string;
  intro?: string;
  recipes: CookbookRecipeInput[];
};

/** Strips a leading `## Prerequisites` heading (and any blank line that follows) from a prereqs body. */
export function stripPrerequisitesHeading(body: string): string {
  return body.replace(/^\s*##\s+Prerequisites\s*\n+/, "").trim();
}

function heading(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}`;
}

function demoteRecipePrereqs(recipe: CookbookRecipeInput): string | undefined {
  if (!recipe.sections.prerequisites) return undefined;
  const body = stripPrerequisitesHeading(recipe.sections.prerequisites);
  return `${heading(3, recipe.name)}\n\n${body}`;
}

function wrapRecipeDeployment(recipe: CookbookRecipeInput): string | undefined {
  if (!recipe.sections.deployment) return undefined;
  return `${heading(3, recipe.name)}\n\n${recipe.sections.deployment.trim()}`;
}

/**
 * Reshuffles a cookbook into: intro → combined Prerequisites → all recipe content bodies →
 * optional combined Deployment. Recipe content.md bodies keep their own `## <Recipe>` title
 * so they land as peer sections; prereqs are demoted to H3 under one shared H2.
 */
export function composeCookbookMarkdown(
  input: CookbookCompositionInput,
): string {
  const { intro, recipes } = input;
  const parts: string[] = [];

  if (intro && intro.trim()) {
    parts.push(intro.trim());
  }

  const prereqBlocks = recipes
    .map(demoteRecipePrereqs)
    .filter((block): block is string => Boolean(block));
  if (prereqBlocks.length > 0) {
    parts.push([heading(2, "Prerequisites"), "", ...prereqBlocks].join("\n\n"));
  }

  const contentBlocks = recipes
    .map((recipe) => recipe.sections.content.trim())
    .filter((block) => Boolean(block));
  if (contentBlocks.length > 0) {
    parts.push(contentBlocks.join("\n\n---\n\n"));
  }

  const deploymentBlocks = recipes
    .map(wrapRecipeDeployment)
    .filter((block): block is string => Boolean(block));
  if (deploymentBlocks.length > 0) {
    parts.push(
      [heading(2, "Deployment"), "", ...deploymentBlocks].join("\n\n"),
    );
  }

  return parts.join("\n\n");
}

/**
 * Wraps the composed body with YAML frontmatter + title block, matching the API markdown
 * shape expected by `/resources/<template>.md` consumers.
 */
export function buildCookbookMarkdownDocument(
  input: CookbookCompositionInput,
): string {
  const body = composeCookbookMarkdown(input);
  const escape = (value: string) => value.replace(/"/g, '\\"');

  const header = [
    "---",
    `title: "${escape(input.templateName)}"`,
    `summary: "${escape(input.templateDescription)}"`,
    "---",
    "",
    `# ${input.templateName}`,
    "",
    input.templateDescription,
    "",
  ].join("\n");

  return body ? `${header}\n${body}\n` : `${header}\n`;
}
