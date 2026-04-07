import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import FoundationModelsApi from "@site/content/recipes/foundation-models-api.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseCreateInstance from "@site/content/recipes/lakebase-create-instance.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";

const template = templates.find((t) => t.id === "ai-chat-app");

export default function AiChatAppPage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template ai-chat-app not found");
  }
  const rawMarkdown = template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <DatabricksLocalBootstrap />
      <hr />
      <FoundationModelsApi />
      <hr />
      <AiChatModelServing />
      <hr />
      <LakebaseCreateInstance />
      <hr />
      <LakebaseDataPersistence />
      <hr />
      <LakebaseChatPersistence />
    </TemplateDetail>
  );
}
