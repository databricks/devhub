import type { ComponentProps } from "react";
import { Bot } from "lucide-react";
import { CopyPromptButton } from "@/components/copy-prompt-button";

type CopyPromptProps = ComponentProps<typeof CopyPromptButton>;

export function TemplateUsageBanner(copyPromptProps: CopyPromptProps) {
  return (
    <div className="mb-8 rounded-lg border border-border/80 bg-card">
      <div className="flex flex-col gap-3 px-5 py-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <Bot className="h-4 w-4 text-db-lava" />
          Use with your coding agent
        </div>
        <ol className="m-0 list-none space-y-1 p-0 text-[13px] leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-card-foreground">1.</span> Click
            "Copy prompt" below
          </li>
          <li>
            <span className="font-medium text-card-foreground">2.</span> Paste
            into Cursor, Claude Code, Codex, or any coding agent
          </li>
          <li>
            <span className="font-medium text-card-foreground">3.</span> Your
            agent builds the app — it asks questions along the way so the result
            is exactly what you want
          </li>
        </ol>
        <div className="pt-1">
          <CopyPromptButton {...copyPromptProps} />
        </div>
      </div>
    </div>
  );
}
