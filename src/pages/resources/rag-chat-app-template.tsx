import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import {
  buildTemplateRawMarkdown,
  getTemplateContentBlocks,
} from "@/lib/template-content";
import { TemplateBlockRenderer } from "@/components/templates/template-blocks";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import FoundationModelsApi from "@site/content/recipes/foundation-models-api.md";
import EmbeddingsGeneration from "@site/content/recipes/embeddings-generation.md";
import LakebasePgvector from "@site/content/recipes/lakebase-pgvector.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";
import RagChatIntegration from "@site/content/recipes/rag-chat-integration.md";

const template = templates.find((t) => t.id === "rag-chat-app-template");
const blocks = getTemplateContentBlocks("rag-chat-app-template");

const recipeComponents: Record<string, React.ComponentType> = {
  "databricks-local-bootstrap": DatabricksLocalBootstrap,
  "lakebase-data-persistence": LakebaseDataPersistence,
  "foundation-models-api": FoundationModelsApi,
  "embeddings-generation": EmbeddingsGeneration,
  "lakebase-pgvector": LakebasePgvector,
  "ai-chat-model-serving": AiChatModelServing,
  "lakebase-chat-persistence": LakebaseChatPersistence,
  "rag-chat-integration": RagChatIntegration,
};

export default function RagChatAppTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template rag-chat-app-template not found");
  }
  const rawMarkdown = buildTemplateRawMarkdown(template, rawBySlug);
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      {blocks ? (
        <TemplateBlockRenderer
          blocks={blocks}
          recipeComponents={recipeComponents}
        />
      ) : (
        <>
          <DatabricksLocalBootstrap />
          <hr />
          <LakebaseDataPersistence />
          <hr />
          <FoundationModelsApi />
          <hr />
          <EmbeddingsGeneration />
          <hr />
          <LakebasePgvector />
          <hr />
          <AiChatModelServing />
          <hr />
          <LakebaseChatPersistence />
          <hr />
          <RagChatIntegration />
        </>
      )}
    </TemplateDetail>
  );
}
