import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import AiChatModelServing from "@site/content/recipes/vercel-ai-chat-app.md";

const template = templates.find((t) => t.id === "ai-chat-app-template");

export default function AiChatAppTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template ai-chat-app-template not found");
  }
  return (
    <TemplateDetail template={template}>
      <DatabricksLocalBootstrap />
      <hr />
      <AiChatModelServing />
    </TemplateDetail>
  );
}
