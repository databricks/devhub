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
import UnityCatalogSetupPrereqs from "@site/content/recipes/unity-catalog-setup/prerequisites.md";
import UnityCatalogSetupContent from "@site/content/recipes/unity-catalog-setup/content.md";
import LakebaseCreateInstancePrereqs from "@site/content/recipes/lakebase-create-instance/prerequisites.md";
import LakebaseCreateInstanceContent from "@site/content/recipes/lakebase-create-instance/content.md";
import LakebaseChangeDataFeedAutoscalingPrereqs from "@site/content/recipes/lakebase-change-data-feed-autoscaling/prerequisites.md";
import LakebaseChangeDataFeedAutoscalingContent from "@site/content/recipes/lakebase-change-data-feed-autoscaling/content.md";
import SyncTablesAutoscalingPrereqs from "@site/content/recipes/sync-tables-autoscaling/prerequisites.md";
import SyncTablesAutoscalingContent from "@site/content/recipes/sync-tables-autoscaling/content.md";
import MedallionArchitectureFromCdcPrereqs from "@site/content/recipes/medallion-architecture-from-cdc/prerequisites.md";
import MedallionArchitectureFromCdcContent from "@site/content/recipes/medallion-architecture-from-cdc/content.md";

const TEMPLATE_ID = "operational-data-analytics";

export default function OperationalDataAnalyticsPage(): ReactNode {
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
      <UnityCatalogSetupPrereqs />
      <LakebaseCreateInstancePrereqs />
      <LakebaseChangeDataFeedAutoscalingPrereqs />
      <SyncTablesAutoscalingPrereqs />
      <MedallionArchitectureFromCdcPrereqs />
      <hr />
      <BootstrapContent />
      <hr />
      <UnityCatalogSetupContent />
      <hr />
      <LakebaseCreateInstanceContent />
      <hr />
      <LakebaseChangeDataFeedAutoscalingContent />
      <hr />
      <SyncTablesAutoscalingContent />
      <hr />
      <MedallionArchitectureFromCdcContent />
    </TemplateDetail>
  );
}
