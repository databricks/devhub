import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates, recipes } from "@/lib/recipes/recipes";
import {
  useAllRecipeSections,
  useCookbookIntro,
} from "@/lib/use-raw-content-markdown";
import { composeCookbookMarkdown } from "@/lib/cookbook-composition";
import BootstrapPrereqs from "@site/content/recipes/databricks-local-bootstrap/prerequisites.md";
import BootstrapContent from "@site/content/recipes/databricks-local-bootstrap/content.md";
import GenieConversationalAnalyticsPrereqs from "@site/content/recipes/genie-conversational-analytics/prerequisites.md";
import GenieConversationalAnalyticsContent from "@site/content/recipes/genie-conversational-analytics/content.md";

const TEMPLATE_ID = "genie-analytics-app";

export default function GenieAnalyticsAppPage(): ReactNode {
  const template = templates.find((t) => t.id === TEMPLATE_ID);
  if (!template) throw new Error(`Template ${TEMPLATE_ID} not found`);

  const sectionsBySlug = useAllRecipeSections();
  const intro = useCookbookIntro(TEMPLATE_ID);

  const recipeInputs = template.recipeIds.map((id) => {
    const recipe = recipes.find((r) => r.id === id);
    const sections = sectionsBySlug[id];
    if (!recipe || !sections) {
      throw new Error(`Missing recipe or sections for "${id}"`);
    }
    return { id, name: recipe.name, sections };
  });

  const rawMarkdown = composeCookbookMarkdown({
    templateName: template.name,
    templateDescription: template.description,
    intro,
    recipes: recipeInputs,
  });

  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <h2 id="prerequisites">Prerequisites</h2>
      <BootstrapPrereqs />
      <GenieConversationalAnalyticsPrereqs />
      <hr />
      <BootstrapContent />
      <hr />
      <GenieConversationalAnalyticsContent />
    </TemplateDetail>
  );
}
