import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/operational-data-analytics/goal.md";

export default function OperationalDataAnalyticsPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown(
    "operational-data-analytics",
  );

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
    </CookbookDetail>
  );
}
