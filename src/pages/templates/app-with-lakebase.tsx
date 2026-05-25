import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/app-with-lakebase/goal.md";

export default function AppWithLakebasePage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("app-with-lakebase");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
    </CookbookDetail>
  );
}
