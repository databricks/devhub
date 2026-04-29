import { describe, expect, test } from "vitest";
import {
  prependLlmsReference,
  getDetailMarkdown,
} from "../api/content-markdown";

describe("detail markdown resolver", () => {
  test("resolves docs markdown", () => {
    const markdown = getDetailMarkdown("docs", "start-here");
    expect(markdown).toContain("---");
    expect(markdown).toContain("title:");
  });

  test("resolves solution markdown", () => {
    const markdown = getDetailMarkdown("solutions", "devhub-launch");
    expect(markdown).toContain("# Introducing dev.databricks.com");
  });

  test("resolves recipe markdown", () => {
    const markdown = getDetailMarkdown("recipes", "databricks-local-bootstrap");
    expect(markdown).toContain("## Databricks Local App Development Bootstrap");
    expect(markdown).toContain("databricks -v");
  });

  test("resolves example markdown", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    expect(markdown).toContain("## Agentic Support Console");
    expect(markdown).toContain("Data Flow");
  });

  test("resolves template markdown", () => {
    const markdown = getDetailMarkdown("templates", "hello-world-app");
    expect(markdown).toContain("# Hello World App");
    expect(markdown).toContain("## Databricks Local App Development Bootstrap");
  });

  test("template markdown hoists all recipe prereqs before any recipe content", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");

    const firstLineStart = (pattern: RegExp): number =>
      markdown.search(pattern);

    const prereqIdx = firstLineStart(/^## Prerequisites$/m);
    const bootstrapContentIdx = firstLineStart(
      /^## Databricks Local App Development Bootstrap$/m,
    );
    const lakebaseContentIdx = firstLineStart(
      /^## Lakebase Chat Persistence$/m,
    );

    expect(prereqIdx).toBeGreaterThanOrEqual(0);
    expect(prereqIdx).toBeLessThan(bootstrapContentIdx);
    expect(bootstrapContentIdx).toBeLessThan(lakebaseContentIdx);
    // Only one combined `## Prerequisites` heading, with demoted H3 per recipe.
    expect(markdown.match(/^## Prerequisites$/gm)?.length).toBe(1);
    expect(markdown).toMatch(/^### Databricks Local Bootstrap$/m);
    expect(markdown).toMatch(/^### Lakebase Chat Persistence$/m);
  });

  test("template markdown includes cookbook intro.md above Prerequisites when present", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");
    const introIdx = markdown.indexOf("## What you are building");
    const prereqIdx = markdown.indexOf("## Prerequisites");
    expect(introIdx).toBeGreaterThanOrEqual(0);
    expect(introIdx).toBeLessThan(prereqIdx);
    expect(markdown).toContain("How the steps fit together");
  });

  test("rejects path traversal", () => {
    expect(() => getDetailMarkdown("docs", "../package.json")).toThrow(
      "path traversal",
    );
  });
});

describe("templates section resolves recipes, examples, and cookbooks", () => {
  test("resolves a recipe slug via templates", () => {
    const markdown = getDetailMarkdown(
      "templates",
      "databricks-local-bootstrap",
    );
    expect(markdown).toContain("## Databricks Local App Development Bootstrap");
  });

  test("resolves an example slug via templates", () => {
    const markdown = getDetailMarkdown("templates", "agentic-support-console");
    expect(markdown).toContain("## Agentic Support Console");
  });

  test("resolves a cookbook slug via templates", () => {
    const markdown = getDetailMarkdown("templates", "hello-world-app");
    expect(markdown).toContain("# Hello World App");
    expect(markdown).toContain("## Databricks Local App Development Bootstrap");
  });

  test("throws for unknown template slug", () => {
    expect(() => getDetailMarkdown("templates", "nonexistent-slug")).toThrow(
      "Template not found",
    );
  });
});

describe("empty-slug index pages", () => {
  test("templates index is one flat list of every template", () => {
    const markdown = getDetailMarkdown("templates", "");
    expect(markdown).toContain("# Templates");
    expect(markdown).not.toContain("## Cookbooks");
    expect(markdown).not.toContain("## Recipes");
    expect(markdown).not.toContain("## Examples");
    expect(markdown).toMatch(/\(\/templates\/[\w-]+\.md\)/);
    expect(markdown).toContain("/templates/hello-world-app.md");
    expect(markdown).toContain("/templates/databricks-local-bootstrap.md");
  });

  test("solutions index contains heading and .md links", () => {
    const markdown = getDetailMarkdown("solutions", "");
    expect(markdown).toContain("# Solutions");
    expect(markdown).toMatch(/\(\/solutions\/[\w-]+\.md\)/);
  });

  test("docs with empty slug throws", () => {
    expect(() => getDetailMarkdown("docs", "")).toThrow("Missing slug");
  });
});

describe("example markdown includes metadata", () => {
  test("includes init command for examples with one", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    expect(markdown).toContain("## Quick start");
    expect(markdown).toContain("git clone --depth 1");
  });

  test("includes GitHub link for examples with one", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    expect(markdown).toContain("View source on GitHub");
    expect(markdown).toContain("github.com/databricks/devhub");
  });

  test("includes related recipe and template links", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    expect(markdown).toContain("/templates/operational-data-analytics");
    expect(markdown).toContain("/templates/genie-conversational-analytics");
  });
});

describe("prependLlmsReference prepends about-devhub body", () => {
  const ABOUT_START = "# About DevHub";

  test("prepends about with https llms.txt URL for production host", () => {
    const result = prependLlmsReference("# Hello", "dev.databricks.com");
    expect(result).toContain("https://dev.databricks.com/llms.txt");
    expect(result).toContain("# Hello");
    expect(result.startsWith(ABOUT_START)).toBe(true);
  });

  test("prepends about with http llms.txt URL for localhost", () => {
    const result = prependLlmsReference("# Hello", "localhost:3001");
    expect(result).toContain("http://localhost:3001/llms.txt");
    expect(result.startsWith(ABOUT_START)).toBe(true);
  });

  test("includes working-with-content guidance from about-devhub", () => {
    const result = prependLlmsReference("content", "dev.databricks.com");
    expect(result).toContain("Working with DevHub content");
    expect(result).toContain("Read through the entire content");
  });

  test("trims trailing whitespace from markdown", () => {
    const result = prependLlmsReference("content\n\n\n", "dev.databricks.com");
    expect(result).toMatch(/content\n$/);
    expect(result).not.toMatch(/\n\n\n$/);
  });

  test("recipe markdown starts with about devhub", () => {
    const markdown = getDetailMarkdown("recipes", "databricks-local-bootstrap");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(ABOUT_START)).toBe(true);
    expect(result).toContain("## Databricks Local App Development Bootstrap");
  });

  test("example markdown starts with about devhub", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(ABOUT_START)).toBe(true);
    expect(result).toContain("## Agentic Support Console");
  });

  test("template markdown starts with about devhub", () => {
    const markdown = getDetailMarkdown("templates", "hello-world-app");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(ABOUT_START)).toBe(true);
    expect(result).toContain("# Hello World App");
  });

  test("solution markdown starts with about devhub", () => {
    const markdown = getDetailMarkdown("solutions", "devhub-launch");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(ABOUT_START)).toBe(true);
    expect(result).toContain("# Introducing dev.databricks.com");
  });

  test("templates meta-section starts with about devhub", () => {
    const markdown = getDetailMarkdown("templates", "agentic-support-console");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(ABOUT_START)).toBe(true);
    expect(result).toContain("## Agentic Support Console");
  });
});

describe("slug normalization strips .md extension", () => {
  test("docs slug with .md extension resolves", () => {
    const markdown = getDetailMarkdown("docs", "start-here.md");
    expect(markdown).toContain("title:");
  });

  test("recipe slug with .md extension resolves", () => {
    const markdown = getDetailMarkdown(
      "recipes",
      "databricks-local-bootstrap.md",
    );
    expect(markdown).toContain("## Databricks Local App Development Bootstrap");
  });

  test("templates slug with .md extension resolves", () => {
    const markdown = getDetailMarkdown(
      "templates",
      "agentic-support-console.md",
    );
    expect(markdown).toContain("## Agentic Support Console");
  });
});
