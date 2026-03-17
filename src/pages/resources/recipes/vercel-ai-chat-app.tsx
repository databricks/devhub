import type { ReactNode } from "react";
import { RecipeDetail } from "@/components/templates/recipe-detail";

export default function VercelAiChatAppRecipePage(): ReactNode {
  return <RecipeDetail recipeId="ai-chat-model-serving" />;
}
