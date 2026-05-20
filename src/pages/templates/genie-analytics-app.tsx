import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import GenieConversationalAnalyticsPrereqs from "@site/content/recipes/genie-conversational-analytics/prerequisites.md";
import GenieConversationalAnalyticsContent from "@site/content/recipes/genie-conversational-analytics/content.md";

export default function GenieAnalyticsAppPage(): ReactNode {
  const { cookbook, rawMarkdown, replitPrompt } = useCookbookMarkdown(
    "genie-analytics-app",
  );

  return (
    <CookbookDetail
      cookbook={cookbook}
      rawMarkdown={rawMarkdown}
      replitPrompt={replitPrompt}
    >
      <h2 id="prerequisites">Prerequisites</h2>
      <GenieConversationalAnalyticsPrereqs />
      <hr />
      <GenieConversationalAnalyticsContent />
    </CookbookDetail>
  );
}
