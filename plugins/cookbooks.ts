import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  getCookbookSlugs,
  readCookbookIntro,
} from "../src/lib/content-markdown";
import { cookbooks } from "../src/lib/recipes/recipes";

export type CookbooksGlobalData = {
  /** Raw `content/cookbooks/<slug>/intro.md` bodies keyed by cookbook id. */
  introsBySlug: Record<string, string>;
};

function assertCookbookSlugParity(contentSlugs: string[]): void {
  const cookbookIds = cookbooks.map((c) => c.id);
  const unknown = contentSlugs.filter((slug) => !cookbookIds.includes(slug));
  if (unknown.length > 0) {
    throw new Error(
      `content/cookbooks/ contains folders that do not match any cookbook id: ${unknown.join(", ")}. Rename the folder or add the cookbook to src/lib/recipes/recipes.ts.`,
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
