import { describe, expect, test } from "vitest";
import {
  buildCookbookMarkdownDocument,
  composeCookbookMarkdown,
  stripPrerequisitesHeading,
  type CookbookRecipeInput,
} from "../src/lib/cookbook-composition";

const recipeA: CookbookRecipeInput = {
  id: "recipe-a",
  name: "Recipe A",
  sections: {
    content: "## Recipe A\n\n### 1. Step A1\n\nDo the first thing.",
    prerequisites:
      "## Prerequisites\n\nSome intro paragraph.\n\n- **Feature A** must be enabled.",
  },
};

const recipeB: CookbookRecipeInput = {
  id: "recipe-b",
  name: "Recipe B",
  sections: {
    content: "## Recipe B\n\n### 1. Step B1\n\nDo the first thing.",
    prerequisites:
      "## Prerequisites\n\nDifferent intro.\n\n- **Feature B** must be enabled.",
    deployment: "### 3. Deploy B\n\n```bash\nnpm run deploy\n```",
  },
};

const recipeNoExtras: CookbookRecipeInput = {
  id: "recipe-c",
  name: "Recipe C",
  sections: {
    content: "## Recipe C\n\n### 1. Only step.",
  },
};

describe("stripPrerequisitesHeading", () => {
  test("removes a leading `## Prerequisites` heading", () => {
    const body = "## Prerequisites\n\nIntro.\n\n- bullet";
    expect(stripPrerequisitesHeading(body)).toBe("Intro.\n\n- bullet");
  });

  test("leaves bodies without a Prerequisites heading untouched", () => {
    const body = "Just a paragraph.\n\n- bullet";
    expect(stripPrerequisitesHeading(body)).toBe(body);
  });
});

describe("composeCookbookMarkdown", () => {
  test("hoists every recipe's prereqs into one combined section with H3 per recipe", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook X",
      cookbookDescription: "desc",
      recipes: [recipeA, recipeB],
    });

    const locate = (pattern: RegExp): number => md.search(pattern);

    const prereqIdx = locate(/^## Prerequisites$/m);
    const recipeAHeaderIdx = locate(/^### Recipe A$/m);
    const recipeBHeaderIdx = locate(/^### Recipe B$/m);
    const contentAIdx = locate(/^## Recipe A$/m);
    const contentBIdx = locate(/^## Recipe B$/m);

    expect(prereqIdx).toBeGreaterThanOrEqual(0);
    expect(recipeAHeaderIdx).toBeGreaterThan(prereqIdx);
    expect(recipeBHeaderIdx).toBeGreaterThan(recipeAHeaderIdx);
    expect(contentAIdx).toBeGreaterThan(recipeBHeaderIdx);
    expect(contentBIdx).toBeGreaterThan(contentAIdx);
    expect(md.match(/^## Prerequisites$/gm)?.length).toBe(1);
  });

  test("prepends intro content above the Prerequisites section", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      intro: "## What you are building\n\nSome paragraph.",
      recipes: [recipeA],
    });

    const introIdx = md.indexOf("## What you are building");
    const prereqIdx = md.indexOf("## Prerequisites");
    expect(introIdx).toBeGreaterThanOrEqual(0);
    expect(prereqIdx).toBeGreaterThan(introIdx);
  });

  test("skips Prerequisites section when no recipe has prerequisites", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      recipes: [recipeNoExtras],
    });
    expect(md).not.toContain("## Prerequisites");
    expect(md).toContain("## Recipe C");
  });

  test("emits combined Deployment section after content when any recipe has a deployment", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      recipes: [recipeA, recipeB],
    });

    const contentBIdx = md.search(/^## Recipe B$/m);
    const deployIdx = md.search(/^## Deployment$/m);
    expect(contentBIdx).toBeGreaterThanOrEqual(0);
    expect(deployIdx).toBeGreaterThan(contentBIdx);
    expect(md).toContain("### Recipe B\n\n### 3. Deploy B");
  });

  test("omits Deployment section when no recipe has deployment content", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      recipes: [recipeA],
    });
    expect(md).not.toContain("## Deployment");
  });

  test("drops the ## Prerequisites heading from each recipe's body", () => {
    const md = composeCookbookMarkdown({
      cookbookName: "Cookbook",
      cookbookDescription: "desc",
      recipes: [recipeA, recipeB],
    });
    const prereqHeadings = md.match(/^## Prerequisites$/gm);
    expect(prereqHeadings?.length).toBe(1);
  });
});

describe("buildCookbookMarkdownDocument", () => {
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
    expect(md).toContain("## Prerequisites");
    expect(md).toContain("### Recipe A");
  });
});
