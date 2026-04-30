import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
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

export default function AiChatAppPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("ai-chat-app");

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
