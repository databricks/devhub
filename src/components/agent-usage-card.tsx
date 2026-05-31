import type { ReactNode } from "react";
import { Bot } from "lucide-react";
import {
  CopyPromptButton,
  type CopyPromptButtonProps,
} from "@/components/copy-prompt-button";

type AgentUsageCardProps = Omit<CopyPromptButtonProps, "className" | "label">;

export function AgentUsageCard(props: AgentUsageCardProps): ReactNode {
  return (
    <div className="rounded-lg border border-border/80 bg-card">
      <div className="border-b border-border/60 px-5 py-3">
        <p className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Bot className="h-5 w-5" />
          Use with your coding agent
        </p>
      </div>
      <div className="flex flex-col gap-3 px-5 py-5">
        <ol className="space-y-1 text-[13px] leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1.</span> Copy the
            prompt below
          </li>
          <li>
            <span className="font-medium text-foreground">2.</span> Paste into
            Cursor, Claude Code, Codex, or any coding agent
          </li>
          <li>
            <span className="font-medium text-foreground">3.</span> Your agent
            builds it — asking questions along the way so the result is exactly
            what you want
          </li>
        </ol>
        <div>
          <CopyPromptButton
            {...props}
            label="Copy prompt"
            className="h-10 px-6"
          />
        </div>
      </div>
    </div>
  );
}
