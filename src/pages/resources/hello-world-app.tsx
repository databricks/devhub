import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";

const template = templates.find((t) => t.id === "hello-world-app");

export default function HelloWorldAppPage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template hello-world-app not found");
  }
  const rawMarkdown = template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
    </TemplateDetail>
  );
}
