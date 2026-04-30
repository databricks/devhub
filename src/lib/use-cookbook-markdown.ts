import { cookbooks, recipes, type Cookbook } from "@/lib/recipes/recipes";
import {
  useAllRecipeSections,
  useCookbookIntro,
} from "@/lib/use-raw-content-markdown";
import { composeCookbookMarkdown } from "@/lib/cookbook-composition";

type UseCookbookMarkdownResult = {
  cookbook: Cookbook;
  rawMarkdown: string;
};

/**
 * Resolves a cookbook by id and assembles its agent-ready markdown by joining
 * each child recipe's sections via `composeCookbookMarkdown`. Throws on
 * missing cookbook, recipe, or recipe sections so config typos surface at
 * page render time rather than producing silently empty exports.
 */
export function useCookbookMarkdown(
  cookbookId: string,
): UseCookbookMarkdownResult {
  const cookbook = cookbooks.find((c) => c.id === cookbookId);
  if (!cookbook) throw new Error(`Cookbook ${cookbookId} not found`);

  const sectionsBySlug = useAllRecipeSections();
  const intro = useCookbookIntro(cookbookId);

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
    intro,
    recipes: recipeInputs,
  });

  return { cookbook, rawMarkdown };
}
