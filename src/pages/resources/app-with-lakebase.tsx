import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseCreateInstance from "@site/content/recipes/lakebase-create-instance.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";

const template = templates.find((t) => t.id === "app-with-lakebase");

export default function AppWithLakebasePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template app-with-lakebase not found");
  }
  const rawMarkdown = template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
      <hr />
      <LakebaseCreateInstance />
      <hr />
      <LakebaseDataPersistence />
    </TemplateDetail>
  );
}
