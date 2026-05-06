export type DevhubMcpCommandVariant = "global" | "project" | "cursor";

export function buildDevhubMcpCommand(
  siteUrl: string,
  variant: DevhubMcpCommandVariant,
): string {
  const baseCommand = `npx add-mcp ${siteUrl}/api/mcp --name devhub-docs`;
  if (variant === "global") return `${baseCommand} -g`;
  if (variant === "cursor") return `${baseCommand} -g -a cursor`;
  return baseCommand;
}
