import { goalOnly, type ContentSections } from "./content-sections";

export type CookbookRecipeInput = {
  id: string;
  name: string;
  sections: ContentSections;
};

type CookbookCompositionInput = {
  cookbookName: string;
  cookbookDescription: string;
  goal?: string;
  intro?: string;
  recipes: CookbookRecipeInput[];
};

/**
 * Composes a cookbook from its constituent recipes.
 *
 * Cookbook goal/intro → each recipe's goal under a
 * "## Component: <Name>" heading.
 */
export function composeCookbookMarkdown(
  input: CookbookCompositionInput,
): string {
  const introText = input.goal ?? input.intro;
  const { recipes } = input;
  const parts: string[] = [];

  if (introText && introText.trim()) {
    parts.push(introText.trim());
  }

  for (const recipe of recipes) {
    const recipeGoal = goalOnly(recipe.sections);
    if (recipeGoal.trim()) {
      parts.push(`## Component: ${recipe.name}\n\n${recipeGoal.trim()}`);
    }
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
