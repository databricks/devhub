import { useCallback, useEffect, useRef } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  buildTemplateAgentMarkdown,
  useAgentPromptParts,
} from "@/lib/copy-about-devhub";
import { absolutizeMarkdown } from "@/lib/copy-preamble";

/**
 * Discriminator for the "Copy as Markdown" / "Copy prompt" flows. Every
 * template-style copy (recipe, cookbook, example) wraps the body in the
 * shared composer; reference pages (docs, solutions) skip the preamble and
 * emit the raw content with frontmatter so they can be ingested as
 * follow-up references.
 */
type AgentMarkdownKind = "recipe" | "cookbook" | "example" | "doc" | "solution";

export type AgentMarkdownInput = {
  /** What the user is copying. Determines whether the preamble is included. */
  kind: AgentMarkdownKind;
  /** Pre-fetched markdown body. When omitted, `rawMarkdownUrl` is fetched on demand. */
  rawMarkdown?: string;
  /** URL to fetch the raw markdown from when `rawMarkdown` is not pre-supplied. */
  rawMarkdownUrl?: string;
  /** Extra markdown appended after the raw body (recipe / cookbook / doc / solution). */
  additionalMarkdown?: string;
  /**
   * For kind="example": a pre-composed example body that replaces the default
   * `frontmatter + raw + additional` body. The example detail page builds
   * this with `buildFullPrompt` because examples need their own ordered
   * `Get started` flow that frontmatter/raw can't express.
   */
  customTemplateBody?: string;
  title: string;
  description: string;
  permalink: string;
};

type UseAgentMarkdownResult = {
  /** Origin (browser) or build-time site URL (SSR). */
  baseUrl: string;
  /** Page URL with origin. */
  fullUrl: string;
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
    additionalMarkdown,
    customTemplateBody,
    title,
    description,
    permalink,
  } = input;

  const { siteConfig } = useDocusaurusContext();
  const buildSiteUrl = siteConfig.url.replace(/\/$/, "");
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : buildSiteUrl;
  const fullUrl = baseUrl + permalink;
  const parts = useAgentPromptParts();
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

  const ensureFetched = useCallback(async (): Promise<void> => {
    if (rawMarkdown || !rawMarkdownUrl || fetchedMarkdownRef.current) return;
    const res = await fetch(rawMarkdownUrl);
    fetchedMarkdownRef.current = res.ok ? await res.text() : "";
  }, [rawMarkdown, rawMarkdownUrl]);

  const buildAIMarkdown = useCallback((): string => {
    const siteOrigin = baseUrl || buildSiteUrl;
    const rawContent = rawMarkdown ?? fetchedMarkdownRef.current ?? "";
    const frontmatterBody = buildFrontmatterBody({
      title,
      description,
      fullUrl,
      rawContent,
      additionalMarkdown,
    });

    if (kind === "doc" || kind === "solution") {
      return absolutizeMarkdown(frontmatterBody, siteOrigin);
    }

    const templateBody =
      kind === "example" && customTemplateBody !== undefined
        ? customTemplateBody
        : frontmatterBody;

    return buildTemplateAgentMarkdown({
      parts,
      kind,
      templateName: title,
      templateUrl: fullUrl,
      templateBody,
      siteOrigin,
    });
  }, [
    kind,
    rawMarkdown,
    additionalMarkdown,
    customTemplateBody,
    parts,
    title,
    description,
    fullUrl,
    baseUrl,
    buildSiteUrl,
  ]);

  return { baseUrl, fullUrl, buildAIMarkdown, ensureFetched };
}

function buildFrontmatterBody(input: {
  title: string;
  description: string;
  fullUrl: string;
  rawContent: string;
  additionalMarkdown?: string;
}): string {
  const escapedTitle = input.title.replace(/"/g, '\\"');
  const escapedDescription = input.description.replace(/"/g, '\\"');
  let body = `---\ntitle: "${escapedTitle}"\nurl: ${input.fullUrl}\nsummary: "${escapedDescription}"\n---\n\n`;
  if (input.rawContent) body += `${input.rawContent}\n\n`;
  if (input.additionalMarkdown) body += `${input.additionalMarkdown}\n\n`;
  return body.trimEnd() + "\n";
}
