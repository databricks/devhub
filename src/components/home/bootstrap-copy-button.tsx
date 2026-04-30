import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clipboard, LoaderCircle } from "lucide-react";
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
  if (typeof window === "undefined") return false;

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

async function fetchBootstrapPrompt(): Promise<string> {
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

type BootstrapCopyButtonProps = {
  /** Analytics tag distinguishing call sites (e.g. "hero", "wizard"). */
  source: string;
  className?: string;
};

/**
 * Copy-the-bootstrap-prompt button used on the home page hero and inside the
 * wizard step. Shares the same fetch → clipboard → animated state machine; the
 * visual differences live entirely in `className`.
 */
export function BootstrapCopyButton({
  source,
  className,
}: BootstrapCopyButtonProps): ReactNode {
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    setCopyState("copying");
    try {
      const bootstrapPrompt = await fetchBootstrapPrompt();
      const copied = await copyTextToClipboard(bootstrapPrompt);
      if (!copied) throw new Error("Clipboard copy failed");

      setCopyState("copied");
      track("copy_bootstrap_prompt", { source });
    } catch {
      setCopyState("error");
    } finally {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [source]);

  return (
    <Button
      className={className}
      onClick={handleCopy}
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
  );
}
