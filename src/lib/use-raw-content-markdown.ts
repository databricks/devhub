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

export function useAllRawRecipeMarkdown(): Record<string, string> {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "recipes",
  ) as ContentEntriesGlobalData;
  return data.rawMarkdownBySlug;
}

export function useRecipeSections(slug: string): ContentSections | undefined {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "recipes",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug[slug];
}

export function useAllRecipeSections(): Record<string, ContentSections> {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "recipes",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug;
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
};

export function useCookbookIntro(slug: string): string | undefined {
  const data = usePluginData(
    "docusaurus-plugin-cookbooks",
  ) as CookbooksGlobalData;
  return data.introsBySlug[slug];
}

export function useRawExampleMarkdown(slug: string): string {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "examples",
  ) as ContentEntriesGlobalData;
  return data.rawMarkdownBySlug[slug] ?? "";
}

export function useExampleSections(slug: string): ContentSections | undefined {
  const data = usePluginData(
    "docusaurus-plugin-content-entries",
    "examples",
  ) as ContentEntriesGlobalData;
  return data.sectionsBySlug[slug];
}
