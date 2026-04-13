/** As written in content/about-devhub.md; substituted when copying for another host. */
export const ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL =
  "https://dev.databricks.com/llms.txt";

export function substituteAboutDevhubLlmsUrl(
  markdown: string,
  llmsUrl: string,
): string {
  return markdown.replaceAll(ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL, llmsUrl);
}
