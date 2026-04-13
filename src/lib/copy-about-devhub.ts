import { ABOUT_DEVHUB_MARKDOWN_BODY } from "@/lib/about-devhub-generated";
import { substituteAboutDevhubLlmsUrl } from "@/lib/copy-preamble";

export function buildAboutDevhubForBrowserCopy(llmsUrl: string): string {
  return substituteAboutDevhubLlmsUrl(ABOUT_DEVHUB_MARKDOWN_BODY, llmsUrl);
}

/** About DevHub block, horizontal rule, then the rest (same shape as API copy exports). */
export function buildMarkdownWithAboutDevhubLeadIn(
  llmsUrl: string,
  bodyAfterSeparator: string,
): string {
  return `${buildAboutDevhubForBrowserCopy(llmsUrl).trimEnd()}\n\n---\n\n${bodyAfterSeparator}`;
}
