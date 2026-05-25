import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/genie-analytics-app/goal.md";

export default function GenieAnalyticsAppPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("genie-analytics-app");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
    </CookbookDetail>
  );
}
