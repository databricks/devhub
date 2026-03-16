import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";

const template = templates.find((t) => t.id === "ai-data-explorer-template");

export default function AiDataExplorerTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template ai-data-explorer-template not found");
  }
  return <TemplateDetail template={template} />;
}
