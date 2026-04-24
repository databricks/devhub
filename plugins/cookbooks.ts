import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  getCookbookSlugs,
  readCookbookIntro,
} from "../src/lib/content-markdown";
import { cookbooks } from "../src/lib/recipes/recipes";

export type CookbooksGlobalData = {
  /** Raw `content/cookbooks/<slug>/intro.md` bodies keyed by template id. */
  introsBySlug: Record<string, string>;
};

function assertCookbookSlugParity(contentSlugs: string[]): void {
  const templateIds = cookbooks.map((t) => t.id);
  const unknown = contentSlugs.filter((slug) => !templateIds.includes(slug));
  if (unknown.length > 0) {
    throw new Error(
      `content/cookbooks/ contains folders that do not match any template id: ${unknown.join(", ")}. Rename the folder or add the template to src/lib/recipes/recipes.ts.`,
    );
  }
}

export default function cookbooksPlugin(context: LoadContext): Plugin<void> {
  return {
    name: "docusaurus-plugin-cookbooks",
    async contentLoaded({ actions }) {
      const contentSlugs = getCookbookSlugs(context.siteDir);
      assertCookbookSlugParity(contentSlugs);

      const introsBySlug: Record<string, string> = {};
      for (const slug of contentSlugs) {
        const intro = readCookbookIntro(context.siteDir, slug);
        if (intro) {
          introsBySlug[slug] = intro;
        }
      }

      actions.setGlobalData({ introsBySlug } satisfies CookbooksGlobalData);
    },
  };
}
