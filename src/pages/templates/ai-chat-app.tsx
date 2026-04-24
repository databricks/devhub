import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/templates/template-detail";
import { cookbooks, recipes } from "@/lib/recipes/recipes";
import {
  useAllRecipeSections,
  useCookbookIntro,
} from "@/lib/use-raw-content-markdown";
import { composeCookbookMarkdown } from "@/lib/cookbook-composition";
import Intro from "@site/content/cookbooks/ai-chat-app/intro.md";
import BootstrapPrereqs from "@site/content/recipes/databricks-local-bootstrap/prerequisites.md";
import BootstrapContent from "@site/content/recipes/databricks-local-bootstrap/content.md";
import FoundationModelsApiPrereqs from "@site/content/recipes/foundation-models-api/prerequisites.md";
import FoundationModelsApiContent from "@site/content/recipes/foundation-models-api/content.md";
import AiChatModelServingPrereqs from "@site/content/recipes/ai-chat-model-serving/prerequisites.md";
import AiChatModelServingContent from "@site/content/recipes/ai-chat-model-serving/content.md";
import LakebaseCreateInstancePrereqs from "@site/content/recipes/lakebase-create-instance/prerequisites.md";
import LakebaseCreateInstanceContent from "@site/content/recipes/lakebase-create-instance/content.md";
import LakebaseDataPersistencePrereqs from "@site/content/recipes/lakebase-data-persistence/prerequisites.md";
import LakebaseDataPersistenceContent from "@site/content/recipes/lakebase-data-persistence/content.md";
import LakebaseChatPersistencePrereqs from "@site/content/recipes/lakebase-chat-persistence/prerequisites.md";
import LakebaseChatPersistenceContent from "@site/content/recipes/lakebase-chat-persistence/content.md";

const COOKBOOK_ID = "ai-chat-app";

export default function AiChatAppPage(): ReactNode {
  const cookbook = cookbooks.find((t) => t.id === COOKBOOK_ID);
  if (!cookbook) throw new Error(`Cookbook ${COOKBOOK_ID} not found`);

  const sectionsBySlug = useAllRecipeSections();
  const intro = useCookbookIntro(COOKBOOK_ID);

  const recipeInputs = cookbook.recipeIds.map((id) => {
    const recipe = recipes.find((r) => r.id === id);
    const sections = sectionsBySlug[id];
    if (!recipe || !sections) {
      throw new Error(`Missing recipe or sections for "${id}"`);
    }
    return { id, name: recipe.name, sections };
  });

  const rawMarkdown = composeCookbookMarkdown({
    cookbookName: cookbook.name,
    cookbookDescription: cookbook.description,
    intro,
    recipes: recipeInputs,
  });

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Intro />
      <h2 id="prerequisites">Prerequisites</h2>
      <BootstrapPrereqs />
      <FoundationModelsApiPrereqs />
      <AiChatModelServingPrereqs />
      <LakebaseCreateInstancePrereqs />
      <LakebaseDataPersistencePrereqs />
      <LakebaseChatPersistencePrereqs />
      <hr />
      <BootstrapContent />
      <hr />
      <FoundationModelsApiContent />
      <hr />
      <AiChatModelServingContent />
      <hr />
      <LakebaseCreateInstanceContent />
      <hr />
      <LakebaseDataPersistenceContent />
      <hr />
      <LakebaseChatPersistenceContent />
    </CookbookDetail>
  );
}
