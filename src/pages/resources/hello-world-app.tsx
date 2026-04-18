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

const TEMPLATE_ID = "hello-world-app";

export default function HelloWorldAppPage(): ReactNode {
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
      <hr />
      <BootstrapContent />
    </TemplateDetail>
  );
}
