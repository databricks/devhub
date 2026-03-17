import type { ComponentType } from "react";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import ModelServingEndpointCreation from "@site/content/recipes/model-serving-endpoint-creation.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";
import GenieConversationalAnalytics from "@site/content/recipes/genie-conversational-analytics.md";
import SqlAnalyticsDashboard from "@site/content/recipes/sql-analytics-dashboard.md";

export type RecipeContentComponent = ComponentType;

export const recipeContentById: Record<string, RecipeContentComponent> = {
  "databricks-local-bootstrap": DatabricksLocalBootstrap,
  "lakebase-data-persistence": LakebaseDataPersistence,
  "model-serving-endpoint-creation": ModelServingEndpointCreation,
  "ai-chat-model-serving": AiChatModelServing,
  "lakebase-chat-persistence": LakebaseChatPersistence,
  "genie-conversational-analytics": GenieConversationalAnalytics,
  "sql-analytics-dashboard": SqlAnalyticsDashboard,
};
