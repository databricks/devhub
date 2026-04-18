import { usePluginData } from "@docusaurus/useGlobalData";
import type { AboutDevhubGlobalData } from "../../plugins/about-devhub";
import { substituteAboutDevhubLlmsUrl } from "@/lib/copy-preamble";

/** Reads the About DevHub markdown body from build-time plugin global data. */
export function useAboutDevhubBody(): string {
  const data = usePluginData(
    "docusaurus-plugin-about-devhub",
  ) as AboutDevhubGlobalData;
  return data.markdown;
}

/** Pure: substitutes the canonical llms.txt URL with the caller's origin. */
export function buildAboutDevhubForBrowserCopy(
  aboutBody: string,
  llmsUrl: string,
): string {
  return substituteAboutDevhubLlmsUrl(aboutBody, llmsUrl);
}

/** About DevHub block, horizontal rule, then the rest (same shape as API copy exports). */
export function buildMarkdownWithAboutDevhubLeadIn(
  aboutBody: string,
  llmsUrl: string,
  bodyAfterSeparator: string,
): string {
  return `${buildAboutDevhubForBrowserCopy(aboutBody, llmsUrl).trimEnd()}\n\n---\n\n${bodyAfterSeparator}`;
}
