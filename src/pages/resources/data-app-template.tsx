import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";

const template = templates.find((t) => t.id === "data-app-template");

export default function DataAppTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template data-app-template not found");
  }
  return (
    <TemplateDetail template={template}>
      <DatabricksLocalBootstrap />
      <hr />
      <LakebaseDataPersistence />
    </TemplateDetail>
  );
}
