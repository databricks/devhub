import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "./_recipes/databricks-local-bootstrap.mdx";
import LakebaseDataPersistence from "./_recipes/lakebase-data-persistence.mdx";

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
