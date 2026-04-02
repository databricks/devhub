import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { buildTemplateRawMarkdown } from "@/lib/template-content";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import FoundationModelsApi from "@site/content/recipes/foundation-models-api.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";

const template = templates.find((t) => t.id === "ai-chat-app-template");

export default function AiChatAppTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template ai-chat-app-template not found");
  }
  const rawMarkdown = buildTemplateRawMarkdown(template, rawBySlug);
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
      <hr />
      <FoundationModelsApi />
      <hr />
      <AiChatModelServing />
      <hr />
      <LakebaseDataPersistence />
      <hr />
      <LakebaseChatPersistence />
    </TemplateDetail>
  );
}
