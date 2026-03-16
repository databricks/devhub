import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "./_recipes/databricks-local-bootstrap.mdx";
import LakebaseDataPersistence from "./_recipes/lakebase-data-persistence.mdx";
import AiChatModelServing from "./_recipes/ai-chat-model-serving.mdx";
import GenieConversationalAnalytics from "./_recipes/genie-conversational-analytics.mdx";

const template = templates.find((t) => t.id === "ai-data-explorer-template");

export default function AiDataExplorerTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template ai-data-explorer-template not found");
  }
  return (
    <TemplateDetail template={template}>
      <DatabricksLocalBootstrap />
      <hr />
      <LakebaseDataPersistence />
      <hr />
      <AiChatModelServing />
      <hr />
      <GenieConversationalAnalytics />
    </TemplateDetail>
  );
}
