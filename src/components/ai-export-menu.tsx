import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ClipboardCopyIcon,
  CodeIcon,
  ExternalLinkIcon,
  ServerIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type AIExportMenuProps = {
  rawMarkdown?: string;
  rawMarkdownUrl?: string;
  /** Extra markdown appended after the main content (e.g. code snippets, links). */
  additionalMarkdown?: string;
  /**
   * When set, Copy Markdown / Send to ChatGPT / Open in Claude use exactly
   * `about-devhub + --- + this string`, ignoring frontmatter and raw/additional
   * markdown (e.g. example pages align with the Get started "Copy prompt" button).
   */
  agentBodyAfterAbout?: string;
  title: string;
  description: string;
  permalink: string;
  disabled?: boolean;
  disabledTooltip?: string;
};

export function AIExportMenu({
  rawMarkdown,
  rawMarkdownUrl,
  additionalMarkdown,
  agentBodyAfterAbout,
  title,
  description,
  permalink,
  disabled = false,
  disabledTooltip = "select recipe to copy",
}: AIExportMenuProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = baseUrl + permalink;
  const mcpUrl = baseUrl + "/api/mcp";
  const aboutDevhubBody = useAboutDevhubBody();
  const fetchedMarkdownRef = useRef<string | null>(null);

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

  const handleCopyMarkdown = useCallback(() => {
    if (rawMarkdownUrl && !rawMarkdown && !fetchedMarkdownRef.current) {
      fetch(rawMarkdownUrl)
        .then((res) => (res.ok ? res.text() : ""))
        .then((text) => {
          fetchedMarkdownRef.current = text;
          const md = buildAIMarkdown();
          return navigator.clipboard.writeText(md);
        })
        .then(() => toast.success("Markdown copied"))
        .catch(() => toast.error("Failed to copy markdown"));
      return;
    }
    const md = buildAIMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      toast.success("Markdown copied");
    });
  }, [rawMarkdown, rawMarkdownUrl, buildAIMarkdown]);

  const handleViewRawMarkdown = useCallback(() => {
    const mdUrl = fullUrl.replace(/\/$/, "") + ".md";
    window.open(mdUrl, "_blank");
  }, [fullUrl]);

  const handleSendToChatGPT = useCallback(() => {
    const md = buildAIMarkdown();
    const encoded = encodeURIComponent(
      `Read this documentation and help me with it:\n\n${md}`,
    );
    window.open(`https://chatgpt.com/?q=${encoded}`, "_blank");
  }, [buildAIMarkdown]);

  const handleSendToClaude = useCallback(() => {
    const md = buildAIMarkdown();
    const encoded = encodeURIComponent(md);
    window.open(`https://claude.ai/new?q=${encoded}`, "_blank");
  }, [buildAIMarkdown]);

  const handleCopyMCP = useCallback(() => {
    const mcpConfig = JSON.stringify(
      {
        mcpServers: {
          "databricks-devhub": { url: mcpUrl },
        },
      },
      null,
      2,
    );
    navigator.clipboard.writeText(mcpConfig).then(() => {
      toast.success("MCP config copied");
    });
  }, [mcpUrl]);

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button variant="outline" size="sm" disabled>
                Copy as
                <ChevronDownIcon />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{disabledTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Copy as
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleCopyMarkdown}>
            <ClipboardCopyIcon />
            Copy Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleViewRawMarkdown}>
            <CodeIcon />
            View Raw Markdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleSendToChatGPT}>
            <ExternalLinkIcon />
            Send to ChatGPT
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleSendToClaude}>
            <ExternalLinkIcon />
            Open in Claude
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleCopyMCP}>
          <ServerIcon />
          Connect to MCP Server
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
