import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/ai-chat-app/goal.md";

export default function AiChatAppPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("ai-chat-app");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
    </CookbookDetail>
  );
}
