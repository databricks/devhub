import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "./_recipes/databricks-local-bootstrap.mdx";

const template = templates.find((t) => t.id === "base-app-template");

export default function BaseAppTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template base-app-template not found");
  }
  return (
    <TemplateDetail template={template}>
      <DatabricksLocalBootstrap />
    </TemplateDetail>
  );
}
