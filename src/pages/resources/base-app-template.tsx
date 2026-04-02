import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { buildTemplateRawMarkdown } from "@/lib/template-content";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";

const template = templates.find((t) => t.id === "base-app-template");

export default function BaseAppTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template base-app-template not found");
  }
  const rawMarkdown = buildTemplateRawMarkdown(template, rawBySlug);
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
    </TemplateDetail>
  );
}
