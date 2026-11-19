import { afterEach, describe, expect, test, vi } from "vitest";

import {
  filterPublished,
  type Cookbook,
  type Example,
  type Recipe,
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

  test("unlisted recipes are still included by filterPublished", () => {
    const unlisted: Recipe = {
      id: "unlisted-recipe",
      name: "Unlisted Recipe",
      description: "Hidden from /templates but still published",
      tags: ["test"],
      services: ["Lakebase"],
      unlisted: true,
    };
    const result = filterPublished([publishedRecipe, unlisted], false);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toContain("unlisted-recipe");
  });

  test("unlisted + draft recipe is excluded when includeDrafts is false", () => {
    const unlistedDraft: Recipe = {
      id: "unlisted-draft",
      name: "Unlisted Draft",
      description: "Both unlisted and draft",
      tags: [],
      services: [],
      unlisted: true,
      isDraft: true,
    };
    expect(filterPublished([unlistedDraft], false)).toHaveLength(0);
    expect(filterPublished([unlistedDraft], true)).toHaveLength(1);
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

describe("templates index in API markdown", () => {
  afterEach(() => {
    delete process.env.SHOW_DRAFTS;
    delete process.env.CI;
    vi.resetModules();
  });

  test("templates index includes published entries from every internal kind", async () => {
    const { getDetailMarkdown } =
      await import("../src/lib/agent-content-markdown");
    const markdown = getDetailMarkdown("templates", "");
    expect(markdown).toContain("# Templates");
    expect(markdown).not.toContain("## Cookbooks");
    expect(markdown).not.toContain("## Recipes");
    expect(markdown).not.toContain("## Examples");
    expect(markdown).not.toContain("/templates/hello-world-app.md");
    expect(markdown).toContain("/templates/ai-chat-app.md");
    expect(markdown).toContain(
      "/templates/set-up-your-local-dev-environment.md",
    );
    expect(markdown).toContain("/templates/agentic-support-console.md");
  });
});

describe("template markdown for draft slugs", () => {
  afterEach(() => {
    delete process.env.SHOW_DRAFTS;
    vi.resetModules();
  });

  test("does not serve a draft template's markdown when drafts are off", async () => {
    const { getDetailMarkdown } =
      await import("../src/lib/agent-content-markdown");
    expect(() =>
      getDetailMarkdown("templates", "zerobus-target-table"),
    ).toThrow('Template not found: "zerobus-target-table"');
  });

  test("serves a draft template's markdown when drafts are on", async () => {
    process.env.SHOW_DRAFTS = "true";
    const { getDetailMarkdown } =
      await import("../src/lib/agent-content-markdown");
    expect(getDetailMarkdown("templates", "zerobus-target-table")).toContain(
      "Zerobus Ingest writes into a table",
    );
  });
});

describe("template static params slugs", () => {
  afterEach(() => {
    delete process.env.SHOW_DRAFTS;
    vi.doUnmock("@/lib/recipes/recipes");
    vi.resetModules();
  });

  test("uses the published/draft filter for recipes, cookbooks, and examples", async () => {
    vi.doMock("@/lib/recipes/recipes", () => ({
      recipesInOrder: [
        { id: "published-recipe" },
        { id: "draft-recipe", isDraft: true },
      ],
      cookbooks: [
        { id: "published-cookbook" },
        { id: "draft-cookbook", isDraft: true },
      ],
      examples: [
        { id: "published-example" },
        { id: "draft-example", isDraft: true },
      ],
      filterPublished: <T extends { isDraft?: boolean }>(
        items: T[],
        includeDrafts: boolean,
      ) => (includeDrafts ? items : items.filter((item) => !item.isDraft)),
    }));

    const { getAllTemplateSlugs } = await import("../src/lib/template-content");

    expect(getAllTemplateSlugs()).toEqual([
      "published-cookbook",
      "published-example",
      "published-recipe",
    ]);

    process.env.SHOW_DRAFTS = "true";
    expect(getAllTemplateSlugs()).toEqual([
      "draft-cookbook",
      "draft-example",
      "draft-recipe",
      "published-cookbook",
      "published-example",
      "published-recipe",
    ]);
  });
});
