import { describe, expect, test } from "vitest";
import {
  buildCookbookMarkdownDocument,
  composeCookbookMarkdown,
  type CookbookRecipeInput,
} from "../src/lib/cookbook-composition";

const recipeA: CookbookRecipeInput = {
  id: "recipe-a",
  name: "Recipe A",
  sections: {
    goal: "Build feature A for the app.",
  },
};

const recipeB: CookbookRecipeInput = {
  id: "recipe-b",
  name: "Recipe B",
  sections: {
    goal: "Build feature B for the app.",
  },
};

const recipeNoGoal: CookbookRecipeInput = {
  id: "recipe-c",
  name: "Recipe C",
  sections: {},
};

describe("composeCookbookMarkdown", () => {
  test("emits each recipe goal under a ## Component heading", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook X",
      cookbookDescription: "desc",
      recipes: [recipeA, recipeB],
    });

    expect(md).toContain("## Component: Recipe A");
    expect(md).toContain("Build feature A for the app.");
    expect(md).toContain("## Component: Recipe B");
    expect(md).toContain("Build feature B for the app.");
  });

  test("prepends intro/goal content above component headings", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      intro: "## What you are building\n\nSome paragraph.",
      recipes: [recipeA],
    });

    const introIdx = md.indexOf("## What you are building");
    const componentIdx = md.indexOf("## Component: Recipe A");
    expect(introIdx).toBeGreaterThanOrEqual(0);
    expect(componentIdx).toBeGreaterThan(introIdx);
  });

  test("skips recipes with no goal", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      recipes: [recipeA, recipeNoGoal],
    });
    expect(md).toContain("## Component: Recipe A");
    expect(md).not.toContain("Recipe C");
  });

  test("prefers goal over intro", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      goal: "Goal text.",
      intro: "Intro text.",
      recipes: [recipeA],
    });
    expect(md).toContain("Goal text.");
    expect(md).not.toContain("Intro text.");
  });
});

describe("buildCookbookMarkdownDocument", () => {
  test("produces header-only document when all recipe goals are empty", () => {
    const md = buildCookbookMarkdownDocument({
      cookbookName: "Empty Cookbook",
      cookbookDescription: "No recipes with goals.",
      recipes: [recipeNoGoal],
    });
    expect(md).toContain('title: "Empty Cookbook"');
    expect(md).toContain("# Empty Cookbook");
    expect(md).not.toContain("## Component:");
  });

  test("wraps composed body with frontmatter and title", () => {
    const md = buildCookbookMarkdownDocument({
      cookbookName: "Cookbook X",
      cookbookDescription: 'Desc with "quotes".',
      recipes: [recipeA],
    });
    expect(md.startsWith("---\n")).toBe(true);
    expect(md).toContain('title: "Cookbook X"');
    expect(md).toContain('summary: "Desc with \\"quotes\\"."');
    expect(md).toContain("# Cookbook X");
    expect(md).toContain("## Component: Recipe A");
    expect(md).toContain("Build feature A for the app.");
  });
});
