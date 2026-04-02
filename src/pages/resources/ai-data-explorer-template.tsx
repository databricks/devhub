import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { buildTemplateRawMarkdown } from "@/lib/template-content";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import ModelServingEndpointCreation from "@site/content/recipes/model-serving-endpoint-creation.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";
import GenieConversationalAnalytics from "@site/content/recipes/genie-conversational-analytics.md";

const template = templates.find((t) => t.id === "ai-data-explorer-template");

export default function AiDataExplorerTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template ai-data-explorer-template not found");
  }
  const rawMarkdown = buildTemplateRawMarkdown(template, rawBySlug);
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
      <hr />
      <GenieConversationalAnalytics />
    </TemplateDetail>
  );
}
