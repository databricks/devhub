import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import BootstrapPrereqs from "@site/content/recipes/databricks-local-bootstrap/prerequisites.md";
import BootstrapContent from "@site/content/recipes/databricks-local-bootstrap/content.md";
import GenieConversationalAnalyticsPrereqs from "@site/content/recipes/genie-conversational-analytics/prerequisites.md";
import GenieConversationalAnalyticsContent from "@site/content/recipes/genie-conversational-analytics/content.md";

export default function GenieAnalyticsAppPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("genie-analytics-app");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <h2 id="prerequisites">Prerequisites</h2>
      <BootstrapPrereqs />
      <GenieConversationalAnalyticsPrereqs />
      <hr />
      <BootstrapContent />
      <hr />
      <GenieConversationalAnalyticsContent />
    </CookbookDetail>
  );
}
