import { describe, expect, test, afterEach, vi } from "vitest";
import {
  filterPublished,
  type Recipe,
  type Cookbook,
  type Example,
} from "../src/lib/recipes/recipes";

describe("filterPublished", () => {
  const draftRecipe: Recipe = {
    id: "draft-recipe",
    name: "Draft Recipe",
    description: "A draft recipe",
    tags: ["test"],
    services: ["Lakebase"],
    isDraft: true,
  };

  const publishedRecipe: Recipe = {
    id: "published-recipe",
    name: "Published Recipe",
    description: "A published recipe",
    tags: ["test"],
    services: ["Lakebase"],
  };

  const undefinedDraftRecipe: Recipe = {
    id: "undefined-draft",
    name: "No isDraft field",
    description: "Recipe without isDraft set",
    tags: ["test"],
    services: ["Lakebase"],
  };

  test("filters out draft items when includeDrafts is false", () => {
    const items = [draftRecipe, publishedRecipe, undefinedDraftRecipe];
    const result = filterPublished(items, false);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([
      "published-recipe",
      "undefined-draft",
    ]);
  });

  test("includes all items when includeDrafts is true", () => {
    const items = [draftRecipe, publishedRecipe, undefinedDraftRecipe];
    const result = filterPublished(items, true);
    expect(result).toHaveLength(3);
  });

  test("returns empty array when all items are drafts and includeDrafts is false", () => {
    const result = filterPublished([draftRecipe], false);
    expect(result).toHaveLength(0);
  });

  test("returns all items when none are drafts", () => {
    const items = [publishedRecipe, undefinedDraftRecipe];
    const result = filterPublished(items, false);
    expect(result).toHaveLength(2);
  });

  test("works with cookbooks", () => {
    const draft: Cookbook = {
      id: "draft-cb",
      name: "Draft Cookbook",
      description: "A draft",
      recipeIds: [],
      tags: [],
      services: [],
      isDraft: true,
    };
    const published: Cookbook = {
      id: "pub-cb",
      name: "Published",
      description: "Published",
      recipeIds: [],
      tags: [],
      services: [],
    };
    expect(filterPublished([draft, published], false)).toHaveLength(1);
    expect(filterPublished([draft, published], true)).toHaveLength(2);
  });
});

describe("templates index filters drafts from API markdown", () => {
  afterEach(() => {
    delete process.env.SHOW_DRAFTS;
    delete process.env.EXAMPLES_FEATURE;
    delete process.env.CI;
    vi.resetModules();
  });

  test("templates index includes non-draft entries", async () => {
    process.env.EXAMPLES_FEATURE = "true";
    const { getDetailMarkdown } = await import("../api/content-markdown");
    const markdown = getDetailMarkdown("templates", "");
    expect(markdown).toContain("## Cookbooks");
    expect(markdown).toContain("## Recipes");
    expect(markdown).toContain("## Examples");
  });

  test("templates index excludes examples when feature is disabled", async () => {
    delete process.env.EXAMPLES_FEATURE;
    process.env.CI = "true";
    const { getDetailMarkdown } = await import("../api/content-markdown");
    const markdown = getDetailMarkdown("templates", "");
    expect(markdown).toContain("## Cookbooks");
    expect(markdown).toContain("## Recipes");
    expect(markdown).not.toContain("## Examples");
  });
});
