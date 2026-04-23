import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, Check, Clipboard, LoaderCircle } from "lucide-react";
import Link from "@docusaurus/Link";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
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
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopyBootstrapPrompt = useCallback(async () => {
    setCopyState("copying");
    try {
      const bootstrapPrompt = await getBootstrapPrompt();
      const copied = await copyTextToClipboard(bootstrapPrompt);

      if (!copied) {
        throw new Error("Clipboard copy failed");
      }

      setCopyState("copied");
      track("copy_bootstrap_prompt", { source: "hero" });
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
            Build <span className="text-db-lava">agentic applications</span> in
            minutes, not months.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/60 md:text-lg dark:text-white/60">
            Copy the prompt into Cursor, Claude Code, Codex, or any coding agent
            — <br className="hidden md:inline" />
            it will walk you through building a complete app, step by step.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <Button
              className="h-12 rounded-full px-7 text-[0.95rem] font-medium shadow-[0_10px_30px_-10px_rgba(255,54,33,0.55)] transition-transform hover:-translate-y-0.5"
              onClick={handleCopyBootstrapPrompt}
              disabled={copyState === "copying"}
              title="Copies instructions you can paste into Cursor, Claude Code, Codex, or your favorite coding agent"
            >
              {copyState === "copying" ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Copying…
                </span>
              ) : copyState === "copied" ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Copied — now paste into your agent
                </span>
              ) : copyState === "error" ? (
                "Failed to copy — try again"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  Copy prompt for your agent
                </span>
              )}
            </Button>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("wizard-flow")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 bg-white/70 px-5 py-2 text-sm font-medium text-black/80 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-black/25 hover:text-black dark:border-white/15 dark:bg-white/8 dark:text-white/80 dark:hover:border-white/25 dark:hover:text-white"
              >
                How it works
                <ArrowRight className="h-4 w-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
              </button>
              <Link
                to="/resources"
                className="group inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/70 px-5 py-2 text-sm font-medium text-black/80 no-underline backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-black/25 hover:text-black dark:border-white/15 dark:bg-white/8 dark:text-white/80 dark:hover:border-white/25 dark:hover:text-white"
              >
                Browse templates
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-db-lava" />
    </section>
  );
}
