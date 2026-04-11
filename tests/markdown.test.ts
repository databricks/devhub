import { describe, expect, test } from "vitest";
import { appendLlmsFooter, getDetailMarkdown } from "../api/content-markdown";

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
    expect(markdown).toContain("## Templates");
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

describe("appendLlmsFooter appends llms.txt reference", () => {
  test("appends footer with https for production host", () => {
    const result = appendLlmsFooter("# Hello", "dev.databricks.com");
    expect(result).toBe(
      "# Hello\n\n---\nFull documentation: https://dev.databricks.com/llms.txt\n",
    );
  });

  test("appends footer with http for localhost", () => {
    const result = appendLlmsFooter("# Hello", "localhost:3001");
    expect(result).toBe(
      "# Hello\n\n---\nFull documentation: http://localhost:3001/llms.txt\n",
    );
  });

  test("trims trailing whitespace from markdown before appending", () => {
    const result = appendLlmsFooter("content\n\n\n", "dev.databricks.com");
    expect(result).toMatch(/^content\n\n---\n/);
    expect(result).not.toMatch(/content\n\n\n\n/);
  });

  const LLMS_FOOTER =
    "---\nFull documentation: https://dev.databricks.com/llms.txt\n";

  test("docs markdown with footer ends with llms.txt link", () => {
    const markdown = getDetailMarkdown("docs", "start-here");
    const withFooter = appendLlmsFooter(markdown, "dev.databricks.com");
    expect(withFooter).toContain("title:");
    expect(withFooter.endsWith(LLMS_FOOTER)).toBe(true);
  });

  test("recipe markdown with footer ends with llms.txt link", () => {
    const markdown = getDetailMarkdown("recipes", "databricks-local-bootstrap");
    const withFooter = appendLlmsFooter(markdown, "dev.databricks.com");
    expect(withFooter).toContain("## Databricks Local Bootstrap");
    expect(withFooter.endsWith(LLMS_FOOTER)).toBe(true);
  });

  test("example markdown with footer ends with llms.txt link", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    const withFooter = appendLlmsFooter(markdown, "dev.databricks.com");
    expect(withFooter).toContain("## Agentic Support Console");
    expect(withFooter.endsWith(LLMS_FOOTER)).toBe(true);
  });

  test("template markdown with footer ends with llms.txt link", () => {
    const markdown = getDetailMarkdown("templates", "hello-world-app");
    const withFooter = appendLlmsFooter(markdown, "dev.databricks.com");
    expect(withFooter).toContain("# Hello World App");
    expect(withFooter.endsWith(LLMS_FOOTER)).toBe(true);
  });

  test("solution markdown with footer ends with llms.txt link", () => {
    const markdown = getDetailMarkdown("solutions", "devhub-launch");
    const withFooter = appendLlmsFooter(markdown, "dev.databricks.com");
    expect(withFooter).toContain("# Introducing dev.databricks.com");
    expect(withFooter.endsWith(LLMS_FOOTER)).toBe(true);
  });

  test("resources meta-section with footer ends with llms.txt link", () => {
    const markdown = getDetailMarkdown("resources", "agentic-support-console");
    const withFooter = appendLlmsFooter(markdown, "dev.databricks.com");
    expect(withFooter).toContain("## Agentic Support Console");
    expect(withFooter.endsWith(LLMS_FOOTER)).toBe(true);
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
