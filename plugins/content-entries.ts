import { readFileSync } from "fs";
import { resolve } from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  getContentSlugs,
  getSolutionSlugs,
  joinContentSections,
  readContentSections,
  type ContentSections,
} from "../src/lib/content-markdown";
import {
  recipes,
  examples,
  cookbooks,
  filterPublished,
} from "../src/lib/recipes/recipes";
import { showDrafts, examplesEnabled } from "../src/lib/feature-flags-server";
import { solutions } from "../src/lib/solutions/solutions";

function assertNoDuplicateSlugs(): void {
  const all: Array<{ id: string; type: string }> = [
    ...examples.map((e) => ({ id: e.id, type: "example" })),
    ...cookbooks.map((c) => ({ id: c.id, type: "cookbook" })),
    ...recipes.map((r) => ({ id: r.id, type: "recipe" })),
  ];
  const seen = new Map<string, string>();
  for (const { id, type } of all) {
    const existing = seen.get(id);
    if (existing) {
      throw new Error(
        `Duplicate slug "${id}" used by both ${existing} and ${type}. All content entries must have unique slugs.`,
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

function createFolderRouteModuleSource(
  entryType: "recipe" | "example",
  slug: string,
  sections: ContentSections,
): string {
  const section = entryType === "recipe" ? "recipes" : "examples";
  const hasPrereqs = sections.prerequisites !== undefined;
  const hasDeploy = sections.deployment !== undefined;

  const imports: string[] = [
    `import Content from "@site/content/${section}/${slug}/content.md";`,
  ];
  if (hasPrereqs) {
    imports.push(
      `import Prerequisites from "@site/content/${section}/${slug}/prerequisites.md";`,
    );
  }
  if (hasDeploy) {
    imports.push(
      `import Deployment from "@site/content/${section}/${slug}/deployment.md";`,
    );
  }

  const prereqsBlock = hasPrereqs
    ? '      <h2 id="prerequisites">Prerequisites</h2>\n      <Prerequisites />'
    : null;
  const deployBlock = hasDeploy
    ? '      <h2 id="deployment">Deployment</h2>\n      <Deployment />'
    : null;

  const children = [prereqsBlock, "      <Content />", deployBlock]
    .filter(Boolean)
    .join("\n");

  if (entryType === "recipe") {
    return `import type { ReactNode } from "react";
import { RecipeDetail } from "@/components/cookbooks/recipe-detail";
${imports.join("\n")}

export default function RecipeEntryPage(): ReactNode {
  return (
    <RecipeDetail recipeId="${slug}">
${children}
    </RecipeDetail>
  );
}
`;
  }

  return `import type { ReactNode } from "react";
import { ExampleDetail } from "@/components/examples/example-detail";
import { examples } from "@/lib/recipes/recipes";
${imports.join("\n")}

const example = examples.find((e) => e.id === "${slug}");

export default function ExampleEntryPage(): ReactNode {
  if (!example) throw new Error("Example ${slug} not found");
  return (
    <ExampleDetail example={example}>
${children}
    </ExampleDetail>
  );
}
`;
}

function createSolutionRouteModuleSource(slug: string): string {
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

      const folderSection: "recipes" | "examples" | null =
        options.entryType === "recipe"
          ? "recipes"
          : options.entryType === "example"
            ? "examples"
            : null;

      const contentSlugs = folderSection
        ? getContentSlugs(context.siteDir, folderSection)
        : getSolutionSlugs(context.siteDir);
      assertSlugParity(options.entryType, contentSlugs);

      const publishedSlugs = getRegistrySlugs(options.entryType);

      const sectionsBySlug: Record<string, ContentSections> = {};
      const rawMarkdownBySlug: Record<string, string> = {};

      for (const slug of publishedSlugs) {
        if (folderSection) {
          const sections = readContentSections(
            context.siteDir,
            folderSection,
            slug,
          );
          sectionsBySlug[slug] = sections;
          rawMarkdownBySlug[slug] = joinContentSections(sections);
        } else {
          const filePath = resolve(
            context.siteDir,
            "content",
            options.contentSection,
            `${slug}.md`,
          );
          rawMarkdownBySlug[slug] = readFileSync(filePath, "utf-8");
        }
      }

      setGlobalData({
        entryType: options.entryType,
        routeBasePath: options.routeBasePath,
        slugs: publishedSlugs,
        rawMarkdownBySlug,
        sectionsBySlug,
      });

      for (const slug of publishedSlugs) {
        const source =
          options.entryType === "recipe" || options.entryType === "example"
            ? createFolderRouteModuleSource(
                options.entryType,
                slug,
                sectionsBySlug[slug],
              )
            : createSolutionRouteModuleSource(slug);

        const modulePath = await createData(
          `${options.id}-${slug}-route.tsx`,
          source,
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
