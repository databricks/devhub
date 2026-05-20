import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  getCookbookSlugs,
  readCookbookGoal,
  readCookbookIntro,
} from "../src/lib/content-markdown";
import { cookbooks } from "../src/lib/recipes/recipes";

type CookbooksGlobalData = {
  /** Raw `content/cookbooks/<slug>/goal.md` bodies keyed by cookbook id. Falls back to intro.md. */
  goalsBySlug: Record<string, string>;
  /** @deprecated Use goalsBySlug. Kept for backward compat during transition. */
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

      const goalsBySlug: Record<string, string> = {};
      const introsBySlug: Record<string, string> = {};
      for (const slug of contentSlugs) {
        const goal = readCookbookGoal(context.siteDir, slug);
        const intro = readCookbookIntro(context.siteDir, slug);
        const text = goal ?? intro;
        if (text) {
          goalsBySlug[slug] = text;
          introsBySlug[slug] = text;
        }
      }

      actions.setGlobalData({
        goalsBySlug,
        introsBySlug,
      } satisfies CookbooksGlobalData);
    },
  };
}
