import { useCallback } from "react";
import { toast } from "sonner";
import {
  ClipboardCopyIcon,
  CodeIcon,
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
  useAgentMarkdown,
  type AgentMarkdownInput,
} from "@/lib/use-agent-markdown";

type AIExportMenuProps = AgentMarkdownInput & {
  disabled?: boolean;
  disabledTooltip?: string;
};

export function AIExportMenu({
  disabled = false,
  disabledTooltip = "select a template to copy",
  ...input
}: AIExportMenuProps) {
  const { baseUrl, fullUrl, buildAIMarkdown, ensureFetched } =
    useAgentMarkdown(input);
  const mcpUrl = baseUrl + "/api/mcp";

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await ensureFetched();
      await navigator.clipboard.writeText(buildAIMarkdown());
      toast.success("Markdown copied");
    } catch {
      toast.error("Failed to copy markdown");
    }
  }, [ensureFetched, buildAIMarkdown]);

  const handleViewRawMarkdown = useCallback(() => {
    const mdUrl = fullUrl.replace(/\/$/, "") + ".md";
    window.open(mdUrl, "_blank");
  }, [fullUrl]);

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
        <DropdownMenuItem onSelect={handleCopyMCP}>
          <ServerIcon />
          Connect to MCP Server
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
