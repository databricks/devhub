import { useCallback } from "react";
import { toast } from "sonner";
import {
  ClipboardCopyIcon,
  CodeIcon,
  ExternalLinkIcon,
  LinkIcon,
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

type AIExportMenuProps = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  description: string;
  permalink: string;
};

export function AIExportMenu({
  contentRef,
  title,
  description,
  permalink,
}: AIExportMenuProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = baseUrl + permalink;
  const mcpUrl = baseUrl + "/api/mcp";

  const buildAIMarkdown = useCallback((): string => {
    const rawContent =
      contentRef.current?.innerText?.replace(/\s+/g, " ").trim() ?? "";
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
      toast.success("AI-optimized markdown copied to clipboard");
    });
  }, [buildAIMarkdown]);

  const handleViewRawMarkdown = useCallback(() => {
    const md = buildAIMarkdown();
    const win = window.open("", "_blank");
    if (win) {
      win.document.open();
      win.document.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title || "Markdown"} — Raw</title><style>body{margin:2rem;font-family:'SF Mono',Menlo,Monaco,'Courier New',monospace;font-size:14px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;background:#1a2332;color:#e0e0e0;}::selection{background:#ff3621;color:#fff;}</style></head><body>${md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body></html>`,
      );
      win.document.close();
    }
  }, [buildAIMarkdown, title]);

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
      toast.success(
        "MCP config copied. Paste into Claude Desktop, Cursor, Windsurf, etc.",
      );
    });
  }, [mcpUrl]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success("Link copied to clipboard");
    });
  }, [fullUrl]);

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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleCopyLink}>
            <LinkIcon />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <ExternalLinkIcon />
              Open in new tab
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
