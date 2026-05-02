import { describe, expect, test } from "vitest";
import {
  filterTemplates,
  matchesTemplateFilter,
  recipesInOrder,
  cookbooks,
  examples,
  type Recipe,
  type Service,
} from "../src/lib/recipes/recipes";

const lakebasePostgresRecipe: Recipe = {
  id: "lakebase-thing",
  name: "Lakebase Thing",
  description: "Persist data in Lakebase Postgres",
  tags: ["Lakebase", "Postgres"],
  services: ["Lakebase Postgres"],
};

const appkitRecipe: Recipe = {
  id: "spin-up",
  name: "Spin Up an App",
  description: "Scaffold a fresh Databricks App",
  tags: ["Databricks CLI", "AppKit", "Setup"],
  services: ["Databricks Apps"],
};

const genieRecipe: Recipe = {
  id: "genie-multi",
  name: "Genie Multi Space",
  description: "Add a Genie space selector",
  tags: ["Genie", "Conversational Analytics"],
  services: ["Genie"],
};

describe("matchesTemplateFilter", () => {
  test("returns true when filter is empty", () => {
    expect(matchesTemplateFilter(lakebasePostgresRecipe, {})).toBe(true);
  });

  test("matches term in name", () => {
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, {
        searchQuery: "lakebase",
      }),
    ).toBe(true);
  });

  test("matches term in description case-insensitively", () => {
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, { searchQuery: "PERSIST" }),
    ).toBe(true);
  });

  test("matches term that only appears in tags", () => {
    expect(matchesTemplateFilter(appkitRecipe, { searchQuery: "appkit" })).toBe(
      true,
    );
    expect(matchesTemplateFilter(appkitRecipe, { searchQuery: "setup" })).toBe(
      true,
    );
  });

  test("matches term that only appears in services", () => {
    expect(matchesTemplateFilter(genieRecipe, { searchQuery: "genie" })).toBe(
      true,
    );
  });

  test("trims and lowercases the query", () => {
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, {
        searchQuery: "  Lakebase  ",
      }),
    ).toBe(true);
  });

  test("returns false when query has no match anywhere", () => {
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, { searchQuery: "xyzzy" }),
    ).toBe(false);
  });

  test("respects selectedServices filter", () => {
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, {
        selectedServices: new Set(["Databricks Apps"]),
      }),
    ).toBe(false);
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, {
        selectedServices: new Set(["Lakebase Postgres"]),
      }),
    ).toBe(true);
  });

  test("multiple selected services AND together (item must have every selected service)", () => {
    const lakebaseApp: Recipe = {
      id: "lakebase-app",
      name: "Lakebase App",
      description: "An app on Lakebase",
      tags: [],
      services: ["Lakebase Postgres", "Databricks Apps"],
    };
    const lakebaseOnly: Recipe = {
      id: "lakebase-only",
      name: "Lakebase Only",
      description: "Standalone Lakebase",
      tags: [],
      services: ["Lakebase Postgres"],
    };

    const both = new Set<Service>(["Lakebase Postgres", "Databricks Apps"]);
    expect(matchesTemplateFilter(lakebaseApp, { selectedServices: both })).toBe(
      true,
    );
    expect(
      matchesTemplateFilter(lakebaseOnly, { selectedServices: both }),
    ).toBe(false);
  });

  test("respects activeTags filter", () => {
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, {
        activeTags: new Set(["AppKit"]),
      }),
    ).toBe(false);
    expect(
      matchesTemplateFilter(lakebasePostgresRecipe, {
        activeTags: new Set(["Postgres"]),
      }),
    ).toBe(true);
  });

  test("multiple active tags AND together", () => {
    const item: Recipe = {
      id: "x",
      name: "X",
      description: "x",
      tags: ["Lakebase", "Postgres", "Setup"],
      services: ["Lakebase Postgres"],
    };
    expect(
      matchesTemplateFilter(item, {
        activeTags: new Set(["Lakebase", "Postgres"]),
      }),
    ).toBe(true);
    expect(
      matchesTemplateFilter(item, {
        activeTags: new Set(["Lakebase", "AppKit"]),
      }),
    ).toBe(false);
  });

  test("combines search query with service filter (AND)", () => {
    expect(
      matchesTemplateFilter(genieRecipe, {
        searchQuery: "genie",
        selectedServices: new Set(["Lakebase Postgres"]),
      }),
    ).toBe(false);
    expect(
      matchesTemplateFilter(genieRecipe, {
        searchQuery: "genie",
        selectedServices: new Set(["Genie"]),
      }),
    ).toBe(true);
  });
});

describe("filterTemplates against real recipe data", () => {
  test("'lakebase' surfaces every recipe tagged or named with Lakebase", () => {
    const matched = filterTemplates(recipesInOrder, {
      searchQuery: "lakebase",
    });
    const expected = recipesInOrder.filter(
      (r) =>
        r.name.toLowerCase().includes("lakebase") ||
        r.description.toLowerCase().includes("lakebase") ||
        r.tags.some((t) => t.toLowerCase().includes("lakebase")) ||
        r.services.some((s) => s.toLowerCase().includes("lakebase")),
    );
    expect(matched.map((r) => r.id).sort()).toEqual(
      expected.map((r) => r.id).sort(),
    );
    expect(matched.length).toBeGreaterThan(0);
  });

  test("'postgres' matches Lakebase Postgres service even when name lacks it", () => {
    const matched = filterTemplates(recipesInOrder, {
      searchQuery: "postgres",
    });
    const lakebaseRecipes = recipesInOrder.filter((r) =>
      r.services.includes("Lakebase Postgres"),
    );
    for (const r of lakebaseRecipes) {
      expect(matched.map((m) => m.id)).toContain(r.id);
    }
  });

  test("searching a tag finds tag-only matches across all template kinds", () => {
    const allItems = [...recipesInOrder, ...cookbooks, ...examples];
    const matched = filterTemplates(allItems, { searchQuery: "appkit" });
    expect(matched.length).toBeGreaterThan(0);
    expect(
      matched.every(
        (m) =>
          m.name.toLowerCase().includes("appkit") ||
          m.description.toLowerCase().includes("appkit") ||
          m.tags.some((t) => t.toLowerCase().includes("appkit")) ||
          m.services.some((s) => s.toLowerCase().includes("appkit")),
      ),
    ).toBe(true);
  });

  test("returns empty for queries that match nothing", () => {
    expect(
      filterTemplates(recipesInOrder, {
        searchQuery: "definitely-not-a-thing",
      }),
    ).toEqual([]);
  });

  test("service filter narrows to that service only", () => {
    const matched = filterTemplates(recipesInOrder, {
      selectedServices: new Set(["Genie"]),
    });
    expect(matched.length).toBeGreaterThan(0);
    for (const r of matched) {
      expect(r.services).toContain("Genie");
    }
  });

  test("selecting multiple services narrows results (AND, not OR)", () => {
    const allItems = [...recipesInOrder, ...cookbooks, ...examples];

    const databricksApps = filterTemplates(allItems, {
      selectedServices: new Set<Service>(["Databricks Apps"]),
    });
    const lakebase = filterTemplates(allItems, {
      selectedServices: new Set<Service>(["Lakebase Postgres"]),
    });
    const both = filterTemplates(allItems, {
      selectedServices: new Set<Service>([
        "Databricks Apps",
        "Lakebase Postgres",
      ]),
    });

    expect(both.length).toBeLessThanOrEqual(databricksApps.length);
    expect(both.length).toBeLessThanOrEqual(lakebase.length);
    expect(both.length).toBeGreaterThan(0);
    for (const item of both) {
      expect(item.services).toContain("Databricks Apps");
      expect(item.services).toContain("Lakebase Postgres");
    }
  });
});
