import { goalOnly, type ContentSections } from "@/lib/content-sections";

export type CookbookRecipeInput = {
  id: string;
  name: string;
  sections: ContentSections;
};

export type CookbookCompositionMode = "agent" | "human";

type CookbookCompositionInput = {
  cookbookName: string;
  cookbookDescription: string;
  goal?: string;
  intro?: string;
  recipes: CookbookRecipeInput[];
  mode?: CookbookCompositionMode;
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
 * Composes a cookbook from its constituent recipes.
 *
 * mode="human" (default): intro/goal → combined Prerequisites → all recipe
 * content bodies → optional combined Deployment.
 *
 * mode="agent": cookbook goal/intro → each recipe's goal under a
 * "## Component: <Name>" heading. No prerequisites, content bodies, or deployment.
 */
export function composeCookbookMarkdown(
  input: CookbookCompositionInput,
): string {
  const mode = input.mode ?? "human";
  const introText = input.goal ?? input.intro;
  const { recipes } = input;
  const parts: string[] = [];

  if (introText && introText.trim()) {
    parts.push(introText.trim());
  }

  if (mode === "agent") {
    for (const recipe of recipes) {
      const recipeGoal = goalOnly(recipe.sections);
      if (recipeGoal.trim()) {
        parts.push(
          `${heading(2, `Component: ${recipe.name}`)}\n\n${recipeGoal.trim()}`,
        );
      }
    }
    return parts.join("\n\n");
  }

  const prereqBlocks = recipes
    .map(demoteRecipePrereqs)
    .filter((block): block is string => Boolean(block));
  if (prereqBlocks.length > 0) {
    parts.push([heading(2, "Prerequisites"), "", ...prereqBlocks].join("\n\n"));
  }

  const contentBlocks = recipes
    .map((recipe) => recipe.sections.content?.trim())
    .filter((block): block is string => Boolean(block));
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
 * shape expected by `/templates/<template>.md` consumers.
 */
export function buildCookbookMarkdownDocument(
  input: CookbookCompositionInput,
): string {
  const body = composeCookbookMarkdown(input);
  const escape = (value: string) => value.replace(/"/g, '\\"');

  const header = [
    "---",
    `title: "${escape(input.cookbookName)}"`,
    `summary: "${escape(input.cookbookDescription)}"`,
    "---",
    "",
    `# ${input.cookbookName}`,
    "",
    input.cookbookDescription,
    "",
  ].join("\n");

  return body ? `${header}\n${body}\n` : `${header}\n`;
}
