import {
  cookbooks,
  examples,
  filterPublished,
  recipesInOrder,
} from "@/lib/recipes/recipes";
import type { TemplateItem } from "@/components/templates/template-card";

export function buildTemplateItems(includeDrafts: boolean): TemplateItem[] {
  const publishedExamples = filterPublished(examples, includeDrafts).filter(
    (e) => !e.unlisted,
  );
  const publishedCookbooks = filterPublished(cookbooks, includeDrafts);
  const publishedRecipes = filterPublished(
    recipesInOrder,
    includeDrafts,
  ).filter((r) => !r.unlisted);

  const exampleItems: TemplateItem[] = publishedExamples.map((e) => ({
    kind: "example",
    data: e,
  }));
  const cookbookItems: TemplateItem[] = publishedCookbooks.map((c) => ({
    kind: "cookbook",
    data: c,
  }));
  const recipeItems: TemplateItem[] = publishedRecipes.map((r) => ({
    kind: "recipe",
    data: r,
  }));

  return [...cookbookItems, ...recipeItems, ...exampleItems];
}

export function filterZerobusTemplateItems(
  items: TemplateItem[],
): TemplateItem[] {
  return items.filter((item) => item.data.services.includes("Zerobus Ingest"));
}
