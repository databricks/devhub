import { readFileSync } from "fs";
import { resolve } from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { getMarkdownSlugs } from "../src/lib/content-markdown";
import { recipes } from "../src/lib/recipes/recipes";
import { solutions } from "../src/lib/solutions/solutions";

type EntryType = "recipe" | "solution";

type ContentEntriesPluginOptions = {
  id: string;
  entryType?: EntryType;
  routeBasePath?: string;
  contentSection: "recipes" | "solutions" | "cookbooks";
};

function createRouteModuleSource(entryType: EntryType, slug: string): string {
  if (entryType === "recipe") {
    return `import type { ReactNode } from "react";
import { RecipeDetail } from "@/components/templates/recipe-detail";
import EntryContent from "@site/content/recipes/${slug}.md";

export default function RecipeEntryPage(): ReactNode {
  return (
    <RecipeDetail recipeId="${slug}">
      <EntryContent />
    </RecipeDetail>
  );
}
`;
  }

  return `import type { ReactNode } from "react";
import { SolutionDetail } from "@/components/solutions/solution-detail";
import EntryContent from "@site/content/solutions/${slug}.md";

export default function SolutionEntryPage(): ReactNode {
  return (
    <SolutionDetail solutionId="${slug}">
      <EntryContent />
    </SolutionDetail>
  );
}
`;
}

function getRegistrySlugs(entryType: EntryType): string[] {
  if (entryType === "recipe") {
    return recipes.map((recipe) => recipe.id).sort();
  }
  return solutions.map((solution) => solution.id).sort();
}

function assertSlugParity(
  entryType: EntryType,
  contentSlugs: string[],
  registrySlugs: string[],
): void {
  const onlyInContent = contentSlugs.filter(
    (slug) => !registrySlugs.includes(slug),
  );
  const onlyInRegistry = registrySlugs.filter(
    (slug) => !contentSlugs.includes(slug),
  );

  if (onlyInContent.length === 0 && onlyInRegistry.length === 0) {
    return;
  }

  const sections: string[] = [];
  if (onlyInContent.length > 0) {
    sections.push(`only in markdown: ${onlyInContent.join(", ")}`);
  }
  if (onlyInRegistry.length > 0) {
    sections.push(`only in registry: ${onlyInRegistry.join(", ")}`);
  }

  throw new Error(
    `Slug mismatch for ${entryType} entries (${sections.join(
      " | ",
    )}). Keep content markdown and registry metadata in sync.`,
  );
}

export default function contentEntriesPlugin(
  context: LoadContext,
  options: ContentEntriesPluginOptions,
): Plugin<void> {
  return {
    name: "docusaurus-plugin-content-entries",
    async contentLoaded({ actions }) {
      const { addRoute, createData, setGlobalData } = actions;
      const contentSlugs = getMarkdownSlugs(
        context.siteDir,
        options.contentSection,
      );

      if (options.entryType && options.routeBasePath) {
        const registrySlugs = getRegistrySlugs(options.entryType);
        assertSlugParity(options.entryType, contentSlugs, registrySlugs);
      }

      const rawMarkdownBySlug: Record<string, string> = {};
      for (const slug of contentSlugs) {
        const filePath = resolve(
          context.siteDir,
          "content",
          options.contentSection,
          `${slug}.md`,
        );
        rawMarkdownBySlug[slug] = readFileSync(filePath, "utf-8");
      }

      setGlobalData({
        slugs: contentSlugs,
        rawMarkdownBySlug,
      });

      if (options.entryType && options.routeBasePath) {
        for (const slug of contentSlugs) {
          const modulePath = await createData(
            `${options.id}-${slug}-route.tsx`,
            createRouteModuleSource(options.entryType, slug),
          );

          addRoute({
            path: `${options.routeBasePath}/${slug}`,
            component: modulePath,
            exact: true,
          });
        }
      }
    },
  };
}
