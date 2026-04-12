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
    expect(markdown).toContain("## Databricks Local Bootstrap");
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
    expect(markdown).toContain("## Databricks Local Bootstrap");
  });

  test("rejects path traversal", () => {
    expect(() => getDetailMarkdown("docs", "../package.json")).toThrow(
      "path traversal",
    );
  });
});

describe("resources meta-section resolves recipes, examples, and templates", () => {
  test("resolves a recipe slug via resources", () => {
    const markdown = getDetailMarkdown(
      "resources",
      "databricks-local-bootstrap",
    );
    expect(markdown).toContain("## Databricks Local Bootstrap");
  });

  test("resolves an example slug via resources", () => {
    const markdown = getDetailMarkdown("resources", "agentic-support-console");
    expect(markdown).toContain("## Agentic Support Console");
  });

  test("resolves a template slug via resources", () => {
    const markdown = getDetailMarkdown("resources", "hello-world-app");
    expect(markdown).toContain("# Hello World App");
    expect(markdown).toContain("## Databricks Local Bootstrap");
  });

  test("throws for unknown resource slug", () => {
    expect(() => getDetailMarkdown("resources", "nonexistent-slug")).toThrow(
      "Resource page not found",
    );
  });
});

describe("empty-slug index pages", () => {
  test("resources index contains headings and .md links", () => {
    const markdown = getDetailMarkdown("resources", "");
    expect(markdown).toContain("# Resources");
    expect(markdown).toContain("## Guides");
    expect(markdown).toContain("## Recipes");
    expect(markdown).toContain("## Examples");
    expect(markdown).toMatch(/\(\/resources\/[\w-]+\.md\)/);
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
    expect(markdown).toContain("/resources/operational-data-analytics");
    expect(markdown).toContain("/resources/genie-conversational-analytics");
  });
});

describe("prependLlmsReference prepends copy preamble", () => {
  const PREAMBLE_START = "> Source: [dev.databricks.com]";

  test("prepends preamble with https llms.txt URL for production host", () => {
    const result = prependLlmsReference("# Hello", "dev.databricks.com");
    expect(result).toContain(
      "> Full resource index: https://dev.databricks.com/llms.txt",
    );
    expect(result).toContain("# Hello");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
  });

  test("prepends preamble with http llms.txt URL for localhost", () => {
    const result = prependLlmsReference("# Hello", "localhost:3001");
    expect(result).toContain(
      "> Full resource index: http://localhost:3001/llms.txt",
    );
  });

  test("includes usage guidelines in preamble", () => {
    const result = prependLlmsReference("content", "dev.databricks.com");
    expect(result).toContain("How to use this guide");
    expect(result).toContain("Read through the entire content");
  });

  test("trims trailing whitespace from markdown", () => {
    const result = prependLlmsReference("content\n\n\n", "dev.databricks.com");
    expect(result).toMatch(/content\n$/);
    expect(result).not.toMatch(/\n\n\n$/);
  });

  test("docs markdown starts with preamble", () => {
    const markdown = getDetailMarkdown("docs", "start-here");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
    expect(result).toContain("title:");
  });

  test("recipe markdown starts with preamble", () => {
    const markdown = getDetailMarkdown("recipes", "databricks-local-bootstrap");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
    expect(result).toContain("## Databricks Local Bootstrap");
  });

  test("example markdown starts with preamble", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
    expect(result).toContain("## Agentic Support Console");
  });

  test("template markdown starts with preamble", () => {
    const markdown = getDetailMarkdown("templates", "hello-world-app");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
    expect(result).toContain("# Hello World App");
  });

  test("solution markdown starts with preamble", () => {
    const markdown = getDetailMarkdown("solutions", "devhub-launch");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
    expect(result).toContain("# Introducing dev.databricks.com");
  });

  test("resources meta-section starts with preamble", () => {
    const markdown = getDetailMarkdown("resources", "agentic-support-console");
    const result = prependLlmsReference(markdown, "dev.databricks.com");
    expect(result.startsWith(PREAMBLE_START)).toBe(true);
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
    expect(markdown).toContain("## Databricks Local Bootstrap");
  });

  test("resources slug with .md extension resolves", () => {
    const markdown = getDetailMarkdown(
      "resources",
      "agentic-support-console.md",
    );
    expect(markdown).toContain("## Agentic Support Console");
  });
});
