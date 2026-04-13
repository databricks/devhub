import { ABOUT_DEVHUB_MARKDOWN_BODY } from "@/lib/about-devhub-generated";
import { substituteAboutDevhubLlmsUrl } from "@/lib/copy-preamble";

export function buildAboutDevhubForBrowserCopy(llmsUrl: string): string {
  return substituteAboutDevhubLlmsUrl(ABOUT_DEVHUB_MARKDOWN_BODY, llmsUrl);
}
