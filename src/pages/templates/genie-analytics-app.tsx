import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { cookbooks, recipes } from "@/lib/recipes/recipes";
import {
  useAllRecipeSections,
  useCookbookIntro,
} from "@/lib/use-raw-content-markdown";
import { composeCookbookMarkdown } from "@/lib/cookbook-composition";
import BootstrapPrereqs from "@site/content/recipes/databricks-local-bootstrap/prerequisites.md";
import BootstrapContent from "@site/content/recipes/databricks-local-bootstrap/content.md";
import GenieConversationalAnalyticsPrereqs from "@site/content/recipes/genie-conversational-analytics/prerequisites.md";
import GenieConversationalAnalyticsContent from "@site/content/recipes/genie-conversational-analytics/content.md";

const COOKBOOK_ID = "genie-analytics-app";

export default function GenieAnalyticsAppPage(): ReactNode {
  const cookbook = cookbooks.find((t) => t.id === COOKBOOK_ID);
  if (!cookbook) throw new Error(`Cookbook ${COOKBOOK_ID} not found`);

  const sectionsBySlug = useAllRecipeSections();
  const intro = useCookbookIntro(COOKBOOK_ID);

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

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <h2 id="prerequisites">Prerequisites</h2>
      <BootstrapPrereqs />
      <GenieConversationalAnalyticsPrereqs />
      <hr />
      <BootstrapContent />
      <hr />
      <GenieConversationalAnalyticsContent />
    </CookbookDetail>
  );
}
