import { useCallback, useEffect, useRef } from "react";

import { absolutizeMarkdown } from "@/lib/copy-preamble";
import { useSiteContext } from "@/lib/site-context";

/**
 * Discriminator for the "Copy as Markdown" / "Copy prompt" flows. Every
 * template-style copy (recipe, cookbook, example) wraps the body in the
 * shared composer; reference pages (docs) skip the preamble and
 * emit the raw content with frontmatter so they can be ingested as
 * follow-up references.
 */
type AgentMarkdownKind = "recipe" | "cookbook" | "example" | "doc";

export type AgentMarkdownInput = {
  /** What the user is copying. Determines whether the preamble is included. */
  kind: AgentMarkdownKind;
  /** Pre-fetched markdown body. When omitted, `rawMarkdownUrl` is fetched on demand. */
  rawMarkdown?: string;
  /** URL to fetch the raw markdown from when `rawMarkdown` is not pre-supplied. */
  rawMarkdownUrl?: string;
  /** Server-composed agent prompt. Template detail pages pass this to avoid client fallback prompt parts. */
  prebuiltAgentMarkdown?: string;
  title: string;
  description: string;
  permalink: string;
};

type UseAgentMarkdownResult = {
  /** Origin (browser) or build-time site URL (SSR). */
  baseUrl: string;
  /** Page URL with origin. */
  fullUrl: string;
  /** Pretty raw markdown URL for pages served by the markdown rewrites. */
  markdownUrl: string;
  /** MCP endpoint URL on the same origin as the current page. */
  mcpUrl: string;
  /** Build the final agent-ready markdown string. Safe to call after fetch resolves. */
  buildAIMarkdown: () => string;
  /** Ensure rawMarkdownUrl is fetched before reading; resolves once content is available. */
  ensureFetched: () => Promise<void>;
};

export function useAgentMarkdown(
  input: AgentMarkdownInput,
): UseAgentMarkdownResult {
  const {
    kind,
    rawMarkdown,
    rawMarkdownUrl,
    prebuiltAgentMarkdown,
    title,
    description,
    permalink,
  } = input;

  const { siteConfig } = useSiteContext();
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : siteConfig.url;
  const siteRelativePermalink = permalink.startsWith("/")
    ? permalink
    : `/${permalink}`;
  const fullUrl = baseUrl + siteRelativePermalink;
  const markdownUrl = `${fullUrl.replace(/\/$/, "")}.md`;
  const mcpUrl = `${baseUrl}/api/mcp`;
  const fetchMarkdownUrl = rawMarkdownUrl;
  const fetchedMarkdownRef = useRef<string | null>(null);

  useEffect(() => {
    if (rawMarkdown || !fetchMarkdownUrl) return;
    fetch(fetchMarkdownUrl)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        fetchedMarkdownRef.current = text;
      })
      .catch(() => {});
  }, [rawMarkdown, fetchMarkdownUrl]);

  const ensureFetched = useCallback(async (): Promise<void> => {
    if (rawMarkdown || !fetchMarkdownUrl || fetchedMarkdownRef.current) return;
    const res = await fetch(fetchMarkdownUrl);
    fetchedMarkdownRef.current = res.ok ? await res.text() : "";
  }, [rawMarkdown, fetchMarkdownUrl]);

  const buildAIMarkdown = useCallback((): string => {
    const siteOrigin = baseUrl || siteConfig.url;
    if (prebuiltAgentMarkdown !== undefined) {
      return absolutizeMarkdown(prebuiltAgentMarkdown, siteOrigin);
    }

    const rawContent = rawMarkdown ?? fetchedMarkdownRef.current ?? "";
    const frontmatterBody = buildFrontmatterBody({
      title,
      description,
      fullUrl,
      rawContent,
    });

    if (kind === "doc") {
      return absolutizeMarkdown(frontmatterBody, siteOrigin);
    }

    throw new Error(
      `useAgentMarkdown: kind="${kind}" requires prebuiltAgentMarkdown from the server.`,
    );
  }, [
    kind,
    rawMarkdown,
    prebuiltAgentMarkdown,
    title,
    description,
    fullUrl,
    baseUrl,
    siteConfig.url,
  ]);

  return {
    baseUrl,
    fullUrl,
    markdownUrl,
    mcpUrl,
    buildAIMarkdown,
    ensureFetched,
  };
}

function buildFrontmatterBody(input: {
  title: string;
  description: string;
  fullUrl: string;
  rawContent: string;
}): string {
  const escapedTitle = input.title.replace(/"/g, '\\"');
  const escapedDescription = input.description.replace(/"/g, '\\"');
  let body = `---\ntitle: "${escapedTitle}"\nurl: ${input.fullUrl}\nsummary: "${escapedDescription}"\n---\n\n`;
  if (input.rawContent) body += `${input.rawContent}\n\n`;
  return body.trimEnd() + "\n";
}
