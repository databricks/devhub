import { readFileSync } from "fs";
import { resolve } from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { ABOUT_DEVHUB_SLUG } from "../src/lib/bootstrap-prompt";

export type AboutDevhubGlobalData = {
  markdown: string;
};

export default function aboutDevhubPlugin(context: LoadContext): Plugin<void> {
  return {
    name: "docusaurus-plugin-about-devhub",
    async contentLoaded({ actions }) {
      const filePath = resolve(
        context.siteDir,
        "content",
        `${ABOUT_DEVHUB_SLUG}.md`,
      );
      const markdown = readFileSync(filePath, "utf-8");
      actions.setGlobalData({ markdown } satisfies AboutDevhubGlobalData);
    },
  };
}
