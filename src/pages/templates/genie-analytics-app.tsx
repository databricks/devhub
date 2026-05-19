import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/genie-analytics-app/goal.md";
import GenieConversationalAnalyticsPrereqs from "@site/content/recipes/genie-conversational-analytics/prerequisites.md";
import GenieConversationalAnalyticsContent from "@site/content/recipes/genie-conversational-analytics/content.md";

export default function GenieAnalyticsAppPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("genie-analytics-app");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
      <h2 id="prerequisites">Prerequisites</h2>
      <GenieConversationalAnalyticsPrereqs />
      <hr />
      <GenieConversationalAnalyticsContent />
    </CookbookDetail>
  );
}
