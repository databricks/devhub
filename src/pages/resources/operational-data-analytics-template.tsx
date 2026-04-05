import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import UnityCatalogSetup from "@site/content/recipes/unity-catalog-setup.md";
import LakebaseCreateInstance from "@site/content/recipes/lakebase-create-instance.md";
import LakebaseChangeDataFeedAutoscaling from "@site/content/recipes/lakebase-change-data-feed-autoscaling.md";
import SyncTablesAutoscaling from "@site/content/recipes/sync-tables-autoscaling.md";
import MedallionArchitectureFromCdc from "@site/content/recipes/medallion-architecture-from-cdc.md";

const template = templates.find(
  (t) => t.id === "operational-data-analytics-template",
);

export default function OperationalDataAnalyticsTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template operational-data-analytics-template not found");
  }
  const rawMarkdown = template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
      <hr />
      <UnityCatalogSetup />
      <hr />
      <LakebaseCreateInstance />
      <hr />
      <LakebaseChangeDataFeedAutoscaling />
      <hr />
      <SyncTablesAutoscaling />
      <hr />
      <MedallionArchitectureFromCdc />
    </TemplateDetail>
  );
}
