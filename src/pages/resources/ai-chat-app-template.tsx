import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import ModelServingEndpointCreation from "@site/content/recipes/model-serving-endpoint-creation.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";

const template = templates.find((t) => t.id === "ai-chat-app-template");

export default function AiChatAppTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template ai-chat-app-template not found");
  }
  const rawMarkdown = template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
      <hr />
      <LakebaseDataPersistence />
      <hr />
      <ModelServingEndpointCreation />
      <hr />
      <AiChatModelServing />
      <hr />
      <LakebaseChatPersistence />
    </TemplateDetail>
  );
}
