import { readFileSync } from "fs";
import { resolve } from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { ABOUT_DEVHUB_SLUG } from "../src/lib/bootstrap-prompt";
import { goalOnly } from "../src/lib/content-sections";
import { readContentSections } from "../src/lib/content-markdown";
import type { AgentPromptParts } from "../src/lib/copy-preamble";

/**
 * Build-time global data consumed by the browser-side composer in
 * `src/lib/use-agent-markdown.ts`. Mirrors the shape of `AgentPromptParts`
 * from copy-preamble.ts so the composer is shape-identical on the server
 * (Vercel functions) and the browser (Docusaurus components).
 */
export type AboutDevhubGlobalData = {
  parts: AgentPromptParts;
  /**
   * Legacy field — the old plugin only exposed `markdown` (the about-devhub
   * body). Kept for any downstream consumer; new code should read `parts`.
   */
  markdown: string;
};

/** Mirrors api/content-markdown.ts so the browser-side composer ships the same recipe. */
const LOCAL_BOOTSTRAP_SLUG = "set-up-your-local-dev-environment";

function readMarkdownFile(siteDir: string, slug: string): string {
  return readFileSync(resolve(siteDir, "content", `${slug}.md`), "utf-8");
}

function readLocalBootstrap(siteDir: string): string {
  return goalOnly(
    readContentSections(siteDir, "recipes", LOCAL_BOOTSTRAP_SLUG),
  );
}

export default function aboutDevhubPlugin(context: LoadContext): Plugin<void> {
  return {
    name: "docusaurus-plugin-about-devhub",
    async contentLoaded({ actions }) {
      const { siteDir } = context;
      const about = readMarkdownFile(siteDir, ABOUT_DEVHUB_SLUG);
      const parts: AgentPromptParts = {
        about,
        guidelines: readMarkdownFile(siteDir, "dev-guidelines"),
        intentHero: readMarkdownFile(siteDir, "intent-hero"),
        intentRecipe: readMarkdownFile(siteDir, "intent-recipe"),
        intentCookbook: readMarkdownFile(siteDir, "intent-cookbook"),
        intentExample: readMarkdownFile(siteDir, "intent-example"),
        localBootstrap: readLocalBootstrap(siteDir),
      };
      actions.setGlobalData({
        parts,
        markdown: about,
      } satisfies AboutDevhubGlobalData);
    },
  };
}
