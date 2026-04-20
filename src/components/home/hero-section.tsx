import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, Check, Clipboard, LoaderCircle } from "lucide-react";
import Link from "@docusaurus/Link";
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
          <p className="mb-5 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-black/55 dark:text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-db-lava" />
            Databricks Developer Hub
          </p>
          <h1 className="text-5xl leading-[1.08] font-medium tracking-tight md:text-7xl">
            Ship your first Databricks app in&nbsp;minutes, not months.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/60 md:text-lg dark:text-white/60">
            Your company&apos;s data already lives in Databricks. Turn it into
            production apps and AI agents with{" "}
            <span className="text-black dark:text-white">Lakebase</span>,{" "}
            <span className="text-black dark:text-white">Databricks Apps</span>,
            and <span className="text-black dark:text-white">Agent Bricks</span>{" "}
            — guided by a wizard prompt you paste into your coding agent.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <Button
              className="h-12 rounded-full px-7 text-[0.95rem] font-medium shadow-[0_10px_30px_-10px_rgba(255,54,33,0.55)] transition-transform hover:-translate-y-0.5"
              onClick={handleCopyBootstrapPrompt}
              disabled={copyState === "copying"}
              title="Copies a guided setup prompt you can paste into Cursor, Claude Code, or Codex"
            >
              {copyState === "copying" ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Copying…
                </span>
              ) : copyState === "copied" ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Copied — paste it in your coding agent
                </span>
              ) : copyState === "error" ? (
                "Failed to copy — try again"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  Copy wizard prompt
                </span>
              )}
            </Button>
            <p className="text-xs text-black/45 dark:text-white/45">
              Works with Cursor, Claude Code, and Codex.{" "}
              <Link
                to="/docs/start-here"
                className="text-black/70 underline decoration-black/20 underline-offset-2 hover:text-black hover:decoration-black/40 dark:text-white/70 dark:decoration-white/20 dark:hover:text-white dark:hover:decoration-white/40"
              >
                Prefer the docs?
              </Link>
            </p>
          </div>

          <a
            href="#wizard-flow"
            aria-label="See what happens after you copy the prompt"
            className="group mt-12 inline-flex flex-col items-center gap-1 text-[11px] font-medium tracking-[0.14em] uppercase text-black/45 no-underline transition-colors hover:text-black dark:text-white/45 dark:hover:text-white"
          >
            <span>What happens next</span>
            <ArrowRight className="h-4 w-4 rotate-90 animate-[bounce_1.6s_ease-in-out_infinite] transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
      <div className="h-3 w-full bg-db-lava" />
    </section>
  );
}
