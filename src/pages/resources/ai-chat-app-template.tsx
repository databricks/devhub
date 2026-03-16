import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "./_recipes/databricks-local-bootstrap.mdx";
import AiChatModelServing from "./_recipes/ai-chat-model-serving.mdx";

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
