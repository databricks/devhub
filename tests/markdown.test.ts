import { describe, expect, test } from "vitest";
import { getDetailMarkdown } from "../api/content-markdown";

describe("detail markdown resolver", () => {
  test("resolves docs markdown", () => {
    const markdown = getDetailMarkdown("docs", "get-started/getting-started");
    expect(markdown).toContain("---");
    expect(markdown).toContain("title:");
  });

  test("resolves solution markdown", () => {
    const markdown = getDetailMarkdown("solutions", "devhub-launch");
    expect(markdown).toContain("# Introducing dev.databricks.com");
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
