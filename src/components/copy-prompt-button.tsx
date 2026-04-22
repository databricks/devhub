import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { toast } from "sonner";
import { Check, Clipboard, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildAboutDevhubForBrowserCopy,
  buildMarkdownWithAboutDevhubLeadIn,
  useAboutDevhubBody,
} from "@/lib/copy-about-devhub";

type CopyPromptButtonProps = {
  rawMarkdown?: string;
  rawMarkdownUrl?: string;
  additionalMarkdown?: string;
  agentBodyAfterAbout?: string;
  title: string;
  description: string;
  permalink: string;
  disabled?: boolean;
  disabledTooltip?: string;
};

export function CopyPromptButton({
  rawMarkdown,
  rawMarkdownUrl,
  additionalMarkdown,
  agentBodyAfterAbout,
  title,
  description,
  permalink,
  disabled = false,
  disabledTooltip = "select recipe to copy",
}: CopyPromptButtonProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = baseUrl + permalink;
  const aboutDevhubBody = useAboutDevhubBody();
  const fetchedMarkdownRef = useRef<string | null>(null);
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (rawMarkdown || !rawMarkdownUrl) return;
    fetch(rawMarkdownUrl)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        fetchedMarkdownRef.current = text;
      })
      .catch(() => {});
  }, [rawMarkdown, rawMarkdownUrl]);

  const resolveContent = useCallback((): string => {
    if (rawMarkdown) return rawMarkdown;
    if (fetchedMarkdownRef.current) return fetchedMarkdownRef.current;
    return "";
  }, [rawMarkdown]);

  const buildAIMarkdown = useCallback((): string => {
    const originForCopy = baseUrl || "https://dev.databricks.com";
    const llmsUrl = `${originForCopy}/llms.txt`;

    if (agentBodyAfterAbout !== undefined) {
      return buildMarkdownWithAboutDevhubLeadIn(
        aboutDevhubBody,
        llmsUrl,
        agentBodyAfterAbout,
      );
    }

    const rawContent = resolveContent();
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedDescription = description.replace(/"/g, '\\"');

    const about = buildAboutDevhubForBrowserCopy(aboutDevhubBody, llmsUrl);
    let md = `${about}\n\n`;
    md += `---\ntitle: "${escapedTitle}"\nurl: ${fullUrl}\nsummary: "${escapedDescription}"\n---\n\n`;
    if (rawContent) md += `${rawContent}\n\n`;
    if (additionalMarkdown) md += `${additionalMarkdown}\n\n`;
    return md;
  }, [
    agentBodyAfterAbout,
    aboutDevhubBody,
    resolveContent,
    additionalMarkdown,
    title,
    description,
    fullUrl,
    baseUrl,
  ]);

  const handleCopy = useCallback(async () => {
    setCopyState("copying");
    try {
      if (rawMarkdownUrl && !rawMarkdown && !fetchedMarkdownRef.current) {
        const res = await fetch(rawMarkdownUrl);
        fetchedMarkdownRef.current = res.ok ? await res.text() : "";
      }
      const md = buildAIMarkdown();
      await navigator.clipboard.writeText(md);
      setCopyState("copied");
      track("copy_prompt", { title, permalink });
      toast.success("Prompt copied");
    } catch {
      setCopyState("error");
      toast.error("Failed to copy prompt");
    } finally {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [rawMarkdown, rawMarkdownUrl, buildAIMarkdown]);

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button size="sm" disabled>
                <Clipboard className="h-4 w-4" />
                Copy prompt
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{disabledTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button size="sm" onClick={handleCopy} disabled={copyState === "copying"}>
      {copyState === "copying" ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Copying…
        </>
      ) : copyState === "copied" ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : copyState === "error" ? (
        "Try again"
      ) : (
        <>
          <Clipboard className="h-4 w-4" />
          Copy prompt
        </>
      )}
    </Button>
  );
}
