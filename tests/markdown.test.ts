import { describe, expect, test } from "vitest";
import { getDetailMarkdown } from "../api/content-markdown";

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

describe("example markdown includes metadata", () => {
  test("includes init command for examples with one", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    expect(markdown).toContain("## Quick start");
    expect(markdown).toContain("databricks apps init --template");
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
