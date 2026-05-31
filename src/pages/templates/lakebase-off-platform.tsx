import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/lakebase-off-platform/goal.md";

export default function LakebaseOffPlatformPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown(
    "lakebase-off-platform",
  );

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
    </CookbookDetail>
  );
}
