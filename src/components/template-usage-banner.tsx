import type { ComponentProps } from "react";
import { useCallback, useRef } from "react";
import { ArrowDown, Bot, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyPromptButton } from "@/components/copy-prompt-button";

type CopyPromptProps = ComponentProps<typeof CopyPromptButton>;

export function TemplateUsageBanner(copyPromptProps: CopyPromptProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  const handleScrollToContent = useCallback(() => {
    const next = bannerRef.current?.nextElementSibling as HTMLElement | null;
    if (!next) return;
    const navbarHeight = 60;
    const padding = 24;
    const y =
      next.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight -
      padding;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <div
      ref={bannerRef}
      className="mb-8 rounded-lg border border-border/80 bg-card"
    >
      <div className="border-b border-border/60 px-5 py-3">
        <p className="m-0 flex items-center gap-2 text-base font-semibold text-card-foreground">
          <Info className="h-5 w-5 text-muted-foreground" />
          Two ways to use this template
        </p>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
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
              agent builds the app — it asks questions along the way so the
              result is exactly what you want
            </li>
          </ol>
          <div className="mt-auto pt-1">
            <CopyPromptButton {...copyPromptProps} />
          </div>
        </div>

        <div className="flex items-stretch justify-center">
          <div className="flex w-full items-center gap-3 px-5 sm:w-auto sm:flex-col sm:py-5 sm:px-0">
            <div className="h-px flex-1 bg-border/60 sm:h-auto sm:w-px" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border/60 sm:h-auto sm:w-px" />
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <BookOpen className="h-4 w-4 text-db-lava" />
            Read step-by-step
          </div>
          <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
            Follow the steps below to set things up manually, at your own pace.
          </p>
          <div className="mt-auto pt-1">
            <Button variant="outline" size="sm" onClick={handleScrollToContent}>
              <ArrowDown className="h-4 w-4" />
              Read below
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
