import { readFileSync } from "fs";
import { resolve } from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { getMarkdownSlugs } from "../src/lib/content-markdown";
import {
  recipes,
  examples,
  templates,
  filterPublished,
} from "../src/lib/recipes/recipes";
import { showDrafts, examplesEnabled } from "../src/lib/feature-flags-server";
import { solutions } from "../src/lib/solutions/solutions";

function assertNoDuplicateSlugs(): void {
  const all: Array<{ id: string; type: string }> = [
    ...examples.map((e) => ({ id: e.id, type: "example" })),
    ...templates.map((t) => ({ id: t.id, type: "template" })),
    ...recipes.map((r) => ({ id: r.id, type: "recipe" })),
  ];
  const seen = new Map<string, string>();
  for (const { id, type } of all) {
    const existing = seen.get(id);
    if (existing) {
      throw new Error(
        `Duplicate slug "${id}" used by both ${existing} and ${type}. All resources must have unique slugs.`,
      );
    }
    seen.set(id, type);
  }
}

type EntryType = "recipe" | "solution" | "example";

type ContentEntriesPluginOptions = {
  id: "recipes" | "solutions" | "examples";
  entryType: EntryType;
  routeBasePath: string;
  contentSection: "recipes" | "solutions" | "examples";
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

  if (entryType === "solution") {
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

  return `import type { ReactNode } from "react";
import { ExampleDetail } from "@/components/examples/example-detail";
import { examples } from "@/lib/recipes/recipes";
import { useRawExampleMarkdown } from "@/lib/use-raw-content-markdown";
import EntryContent from "@site/content/examples/${slug}.md";

const example = examples.find((e) => e.id === "${slug}");

export default function ExampleEntryPage(): ReactNode {
  const rawMarkdown = useRawExampleMarkdown("${slug}");
  if (!example) throw new Error("Example ${slug} not found");
  return (
    <ExampleDetail example={example} rawMarkdown={rawMarkdown}>
      <EntryContent />
    </ExampleDetail>
  );
}
`;
}

function getRegistrySlugs(entryType: EntryType): string[] {
  const includeDrafts = showDrafts();
  if (entryType === "recipe") {
    return filterPublished(recipes, includeDrafts)
      .map((recipe) => recipe.id)
      .sort();
  }
  if (entryType === "example") {
    if (!examplesEnabled()) return [];
    return filterPublished(examples, includeDrafts)
      .map((example) => example.id)
      .sort();
  }
  return solutions.map((solution) => solution.id).sort();
}

function getAllRegistrySlugs(entryType: EntryType): string[] {
  if (entryType === "recipe") {
    return recipes.map((recipe) => recipe.id).sort();
  }
  if (entryType === "example") {
    return examples.map((example) => example.id).sort();
  }
  return solutions.map((solution) => solution.id).sort();
}

function assertSlugParity(entryType: EntryType, contentSlugs: string[]): void {
  const allSlugs = getAllRegistrySlugs(entryType);

  const onlyInContent = contentSlugs.filter((slug) => !allSlugs.includes(slug));
  const onlyInRegistry = allSlugs.filter(
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
    `Slug mismatch for ${entryType} entries (${sections.join(" | ")}). Keep content markdown and registry metadata in sync.`,
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
      assertNoDuplicateSlugs();
      const contentSlugs = getMarkdownSlugs(
        context.siteDir,
        options.contentSection,
      );
      assertSlugParity(options.entryType, contentSlugs);

      const publishedSlugs = getRegistrySlugs(options.entryType);

      const rawMarkdownBySlug: Record<string, string> = {};
      for (const slug of publishedSlugs) {
        const filePath = resolve(
          context.siteDir,
          "content",
          options.contentSection,
          `${slug}.md`,
        );
        rawMarkdownBySlug[slug] = readFileSync(filePath, "utf-8");
      }

      setGlobalData({
        entryType: options.entryType,
        routeBasePath: options.routeBasePath,
        slugs: publishedSlugs,
        rawMarkdownBySlug,
      });

      for (const slug of publishedSlugs) {
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
    },
  };
}
