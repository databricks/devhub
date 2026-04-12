import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/code/copy-button";
import { getBootstrapPromptApiPath } from "@/lib/bootstrap-prompt";

function fallbackCopyTextToClipboard(text: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";
  document.body.append(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textArea.remove();
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy copy.
    }
  }

  return fallbackCopyTextToClipboard(text);
}

async function getBootstrapPrompt(): Promise<string> {
  const response = await fetch(getBootstrapPromptApiPath());
  if (!response.ok) {
    throw new Error(`Failed to fetch markdown: ${response.status}`);
  }

  const bootstrapPrompt = await response.text();
  if (!bootstrapPrompt.trim()) {
    throw new Error("Bootstrap prompt markdown is empty");
  }

  return bootstrapPrompt;
}

export function HeroSection(): ReactNode {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopyBootstrapPrompt = useCallback(async () => {
    try {
      const bootstrapPrompt = await getBootstrapPrompt();
      const copied = await copyTextToClipboard(bootstrapPrompt);

      if (!copied) {
        throw new Error("Clipboard copy failed");
      }

      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
    }
  }, []);

  return (
    <section className="relative bg-db-oat-medium text-black dark:bg-black dark:text-white">
      <div className="container px-4 py-20 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-5xl leading-[1.08] font-medium tracking-tight md:text-7xl">
            Build agentic applications in minutes, not months.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-black/60 dark:text-white/60">
            Lakebase for your data. Agent Bricks for your AI. Databricks Apps
            for your deployment. One platform, production-ready.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex h-11 items-stretch overflow-hidden rounded-full border border-black/22 bg-white pl-4 font-mono text-sm text-black dark:border-white/24 dark:bg-white/6 dark:text-white">
              <code className="m-0 flex items-center bg-transparent p-0 pr-2 text-inherit">
                $ databricks apps init
              </code>
              <CopyButton
                text="databricks apps init"
                label="Copy command"
                variant="segment"
                className="!h-full !w-11 !rounded-none !rounded-r-full !border-l !border-black/16 !bg-transparent !text-black hover:!bg-black/10 hover:!text-black dark:!border-white/18 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/16 dark:hover:!text-white"
              />
            </div>
            <span className="text-sm text-black/35 dark:text-white/35">or</span>
            <Button
              className="h-11 rounded-full px-6 font-medium"
              onClick={handleCopyBootstrapPrompt}
              title="Copies a setup guide you can paste into Cursor, Claude Code, or Codex"
            >
              {copyState === "copied" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Copied
                </span>
              ) : copyState === "error" ? (
                "Failed to copy"
              ) : (
                "Copy Prompt"
              )}
            </Button>
          </div>
          <p className="mt-4 text-xs text-black/40 dark:text-white/40">
            Run the CLI command yourself, or copy a step-by-step guide for your
            AI coding agent.
          </p>
        </div>
      </div>
      <div className="h-3 w-full bg-db-lava" />
    </section>
  );
}
