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

const COOKBOOK_ID = "operational-data-analytics";

export default function OperationalDataAnalyticsPage(): ReactNode {
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
    </CookbookDetail>
  );
}
