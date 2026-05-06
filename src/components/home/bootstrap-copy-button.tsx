import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Clipboard, LoaderCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

async function fetchBootstrapPrompt(apiPath: string): Promise<string> {
  const response = await fetch(apiPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch markdown: ${response.status}`);
  }

  const bootstrapPrompt = await response.text();
  if (!bootstrapPrompt.trim()) {
    throw new Error("Bootstrap prompt markdown is empty");
  }

  return bootstrapPrompt;
}

type CopyState = "idle" | "copying" | "copied" | "error";
type BootstrapCopyButtonSize = "default" | "compact";

type BootstrapCopyButtonProps = {
  /** Analytics tag distinguishing call sites (e.g. "hero", "wizard"). */
  source: string;
  size?: BootstrapCopyButtonSize;
  className?: string;
};

/**
 * Wait this long before swapping the button label to the spinner. Most
 * fetch+clipboard round-trips finish well under 400ms, so showing a spinner
 * immediately would just produce a flicker between idle → copying → copied.
 */
const SPINNER_DELAY_MS = 400;

/**
 * Once the spinner is shown, keep it visible for at least this long before
 * transitioning to the success/error label. Without this guarantee a slow
 * response that finishes just after 400ms would still flicker.
 */
const SPINNER_MIN_VISIBLE_MS = 800;

const bootstrapCopyButtonBaseClassName =
  "rounded-full bg-db-lava font-medium text-white shadow-none transition-none hover:bg-db-lava active:bg-db-lava";

const bootstrapCopyButtonSizeClassNames: Record<
  BootstrapCopyButtonSize,
  string
> = {
  default: "h-12 px-7 text-[0.95rem]",
  compact: "h-10 px-5 text-sm",
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Visible button label for each state. All four are stacked in a single CSS
 * Grid cell so the button auto-sizes to the longest one and its width never
 * changes when the state flips. Inactive states use `visibility: hidden`
 * (which both reserves layout space *and* drops them from the accessibility
 * tree, so the button's accessible name remains the active label).
 */
function StateLabel({
  state,
  active,
  children,
}: {
  state: CopyState;
  active: CopyState;
  children: ReactNode;
}) {
  const isActive = state === active;
  return (
    <span
      aria-hidden={!isActive}
      className={cn(
        "col-start-1 row-start-1 inline-flex items-center justify-center gap-2 transition-opacity duration-150 ease-out",
        isActive ? "opacity-100" : "invisible opacity-0",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Copy-the-bootstrap-prompt button used on the home page hero and inside the
 * wizard step. Shares the same fetch → clipboard → animated state machine and
 * keeps the CTA styling consistent across landing-page placements.
 */
export function BootstrapCopyButton({
  source,
  size = "default",
  className,
}: BootstrapCopyButtonProps): ReactNode {
  const apiPath = useBaseUrl(getBootstrapPromptApiPath());
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spinnerDelayTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inFlightRef = useRef(false);

  useEffect(
    () => () => {
      clearTimeout(resetTimerRef.current);
      clearTimeout(spinnerDelayTimerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    let spinnerShownAt: number | null = null;
    clearTimeout(spinnerDelayTimerRef.current);
    spinnerDelayTimerRef.current = setTimeout(() => {
      spinnerShownAt = Date.now();
      setCopyState("copying");
    }, SPINNER_DELAY_MS);

    const settle = async (next: "copied" | "error") => {
      clearTimeout(spinnerDelayTimerRef.current);
      if (spinnerShownAt !== null) {
        const elapsed = Date.now() - spinnerShownAt;
        const remaining = SPINNER_MIN_VISIBLE_MS - elapsed;
        if (remaining > 0) await wait(remaining);
      }
      setCopyState(next);
    };

    try {
      const bootstrapPrompt = await fetchBootstrapPrompt(apiPath);
      const copied = await copyTextToClipboard(bootstrapPrompt);
      if (!copied) throw new Error("Clipboard copy failed");

      await settle("copied");
      track("copy_bootstrap_prompt", { source });
    } catch {
      await settle("error");
    } finally {
      inFlightRef.current = false;
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [apiPath, source]);

  return (
    <Button
      className={cn(
        bootstrapCopyButtonBaseClassName,
        bootstrapCopyButtonSizeClassNames[size],
        className,
      )}
      onClick={handleCopy}
      disabled={copyState === "copying"}
      title="Copies instructions you can paste into Cursor, Claude Code, Codex, or your favorite coding agent"
    >
      <span className="grid">
        <StateLabel state="idle" active={copyState}>
          <Clipboard className="h-4 w-4" />
          Copy prompt for your agent
        </StateLabel>
        <StateLabel state="copying" active={copyState}>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Copying…
        </StateLabel>
        <StateLabel state="copied" active={copyState}>
          <Check className="h-4 w-4" />
          Copied — now paste into your agent
        </StateLabel>
        <StateLabel state="error" active={copyState}>
          <AlertCircle className="h-4 w-4" />
          Failed to copy — try again
        </StateLabel>
      </span>
    </Button>
  );
}
