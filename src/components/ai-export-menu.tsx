import { useCallback } from "react";
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

type AIExportMenuProps = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  description: string;
  permalink: string;
  disabled?: boolean;
  disabledTooltip?: string;
};

export function AIExportMenu({
  contentRef,
  title,
  description,
  permalink,
  disabled = false,
  disabledTooltip = "select recipe to copy",
}: AIExportMenuProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = baseUrl + permalink;
  const mcpUrl = baseUrl + "/api/mcp";

  const buildAIMarkdown = useCallback((): string => {
    const rawContent = contentRef.current?.innerText?.trim() ?? "";
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedDescription = description.replace(/"/g, '\\"');

    let md = `---\ntitle: "${escapedTitle}"\nurl: ${fullUrl}\nsummary: "${escapedDescription}"\n---\n\n`;
    if (rawContent) md += `${rawContent}\n\n`;
    md += `---\nFull documentation: ${baseUrl}/llms.txt\n`;
    return md;
  }, [contentRef, title, description, fullUrl, baseUrl]);

  const handleCopyMarkdown = useCallback(() => {
    const md = buildAIMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      toast.success("Markdown copied");
    });
  }, [buildAIMarkdown]);

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
