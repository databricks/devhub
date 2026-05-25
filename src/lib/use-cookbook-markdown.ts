import { cookbooks, recipes, type Cookbook } from "@/lib/recipes/recipes";
import {
  useAllRecipeSections,
  useCookbookGoal,
} from "@/lib/use-raw-content-markdown";
import { composeCookbookMarkdown } from "@/lib/cookbook-composition";

type UseCookbookMarkdownResult = {
  cookbook: Cookbook;
  rawMarkdown: string;
};

/**
 * Resolves a cookbook by id and assembles its agent-ready markdown using
 * goal-only mode: the cookbook's goal.md + each recipe's goal.md as
 * labeled components. Skills handle implementation.
 */
export function useCookbookMarkdown(
  cookbookId: string,
): UseCookbookMarkdownResult {
  const cookbook = cookbooks.find((c) => c.id === cookbookId);
  if (!cookbook) throw new Error(`Cookbook ${cookbookId} not found`);

  const sectionsBySlug = useAllRecipeSections();
  const goal = useCookbookGoal(cookbookId);

  const recipeInputs = cookbook.recipeIds.map((id) => {
    const recipe = recipes.find((r) => r.id === id);
    const sections = sectionsBySlug[id];
    if (!recipe || !sections) {
      throw new Error(`Missing recipe or sections for "${id}"`);
    }
    return { id, name: recipe.name, sections };
  });

  const rawMarkdown = composeCookbookMarkdown({
    cookbookName: cookbook.name,
    cookbookDescription: cookbook.description,
    goal,
    recipes: recipeInputs,
  });

  return { cookbook, rawMarkdown };
}
