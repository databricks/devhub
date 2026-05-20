import { usePluginData } from "@docusaurus/useGlobalData";
import type { ContentSections } from "@/lib/content-sections";

type ContentEntriesGlobalData = {
  entryType: string;
  routeBasePath: string;
  slugs: string[];
  rawMarkdownBySlug: Record<string, string>;
  sectionsBySlug: Record<string, ContentSections>;
};

export function useRawRecipeMarkdown(slug: string): string | undefined {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "recipes",
  ) as ContentEntriesGlobalData;
  return data.rawMarkdownBySlug[slug];
}

export function useAllRecipeSections(): Record<string, ContentSections> {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "recipes",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug;
}

export function useRecipeSections(slug: string): ContentSections | undefined {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "recipes",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug[slug];
}

export function useRawSolutionMarkdown(slug: string): string | undefined {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "solutions",
  ) as ContentEntriesGlobalData;
  return data.rawMarkdownBySlug[slug];
}

type CookbooksGlobalData = {
  introsBySlug: Record<string, string>;
  replitPromptsBySlug: Record<string, string>;
};

export function useCookbookIntro(slug: string): string | undefined {
  const data = usePluginData(
    "docusaurus-plugin-cookbooks",
  ) as CookbooksGlobalData;
  return data.introsBySlug[slug];
}

export function useCookbookReplitPrompt(slug: string): string | undefined {
  const data = usePluginData(
    "docusaurus-plugin-cookbooks",
  ) as CookbooksGlobalData;
  return data.replitPromptsBySlug[slug];
}

export function useExampleSections(slug: string): ContentSections | undefined {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "examples",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug[slug];
}

export function useAllExampleSections(): Record<string, ContentSections> {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "examples",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug;
}

/**
 * IDs of every template (example, recipe, or cookbook) that ships a
 * `replit-prompt.md`. Used by the templates page to power the "Replit Apps"
 * filter without requiring authors to mirror that fact in `recipes.ts`.
 */
export function useReplitTemplateIds(): ReadonlySet<string> {
  const exampleSections = useAllExampleSections();
  const recipeSections = useAllRecipeSections();
  const cookbookData = usePluginData(
    "docusaurus-plugin-cookbooks",
  ) as CookbooksGlobalData;
  const ids = new Set<string>();
  for (const [slug, sections] of Object.entries(exampleSections)) {
    if (sections.replitPrompt) ids.add(slug);
  }
  for (const [slug, sections] of Object.entries(recipeSections)) {
    if (sections.replitPrompt) ids.add(slug);
  }
  for (const slug of Object.keys(cookbookData.replitPromptsBySlug)) {
    ids.add(slug);
  }
  return ids;
}
