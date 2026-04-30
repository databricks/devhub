import { useCallback, useEffect, useRef } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  buildAboutDevhubForBrowserCopy,
  buildMarkdownWithAboutDevhubLeadIn,
  useAboutDevhubBody,
} from "@/lib/copy-about-devhub";

export type AgentMarkdownInput = {
  rawMarkdown?: string;
  rawMarkdownUrl?: string;
  additionalMarkdown?: string;
  /**
   * When set, the result is `about-devhub + --- + this string`,
   * ignoring frontmatter and rawMarkdown/additionalMarkdown.
   */
  agentBodyAfterAbout?: string;
  /**
   * When true, the About DevHub preamble is omitted (used for reference doc
   * pages where the preamble is already part of the linking resource).
   */
  omitAboutDevhubPreamble?: boolean;
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
    rawMarkdown,
    rawMarkdownUrl,
    additionalMarkdown,
    agentBodyAfterAbout,
    omitAboutDevhubPreamble = false,
    title,
    description,
    permalink,
  } = input;

  const { siteConfig } = useDocusaurusContext();
  const buildSiteUrl = siteConfig.url.replace(/\/$/, "");
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : buildSiteUrl;
  const fullUrl = baseUrl + permalink;
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

  const ensureFetched = useCallback(async (): Promise<void> => {
    if (rawMarkdown || !rawMarkdownUrl || fetchedMarkdownRef.current) return;
    const res = await fetch(rawMarkdownUrl);
    fetchedMarkdownRef.current = res.ok ? await res.text() : "";
  }, [rawMarkdown, rawMarkdownUrl]);

  const buildAIMarkdown = useCallback((): string => {
    const originForCopy = baseUrl || buildSiteUrl;
    const llmsUrl = `${originForCopy}/llms.txt`;

    if (agentBodyAfterAbout !== undefined) {
      return buildMarkdownWithAboutDevhubLeadIn(
        aboutDevhubBody,
        llmsUrl,
        agentBodyAfterAbout,
      );
    }

    const rawContent = rawMarkdown ?? fetchedMarkdownRef.current ?? "";
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedDescription = description.replace(/"/g, '\\"');

    let md = "";
    if (!omitAboutDevhubPreamble) {
      md += `${buildAboutDevhubForBrowserCopy(aboutDevhubBody, llmsUrl)}\n\n`;
    }
    md += `---\ntitle: "${escapedTitle}"\nurl: ${fullUrl}\nsummary: "${escapedDescription}"\n---\n\n`;
    if (rawContent) md += `${rawContent}\n\n`;
    if (additionalMarkdown) md += `${additionalMarkdown}\n\n`;
    return md;
  }, [
    rawMarkdown,
    additionalMarkdown,
    agentBodyAfterAbout,
    aboutDevhubBody,
    omitAboutDevhubPreamble,
    title,
    description,
    fullUrl,
    baseUrl,
    buildSiteUrl,
  ]);

  return { baseUrl, fullUrl, buildAIMarkdown, ensureFetched };
}
