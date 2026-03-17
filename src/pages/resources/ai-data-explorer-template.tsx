import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import AiChatModelServing from "@site/content/recipes/vercel-ai-chat-app.md";
import GenieConversationalAnalytics from "@site/content/recipes/genie-conversational-analytics.md";

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
