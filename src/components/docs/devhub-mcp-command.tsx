import CodeBlock from "@theme/CodeBlock";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  buildDevhubMcpCommand,
  type DevhubMcpCommandVariant,
} from "@/lib/devhub-mcp-command";
import { siteUrlFromConfig } from "@/lib/site-url";

export function DevhubMcpCommand({
  variant,
}: {
  variant: DevhubMcpCommandVariant;
}) {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteUrlFromConfig(siteConfig.url, siteConfig.baseUrl);
  return (
    <CodeBlock language="bash">
      {buildDevhubMcpCommand(siteUrl, variant)}
    </CodeBlock>
  );
}
