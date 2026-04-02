import { describe, expect, test } from "vitest";
import { getDetailMarkdown } from "../api/content-markdown";

describe("detail markdown resolver", () => {
  test("resolves docs markdown", () => {
    const markdown = getDetailMarkdown("docs", "get-started/getting-started");
    expect(markdown).toContain("---");
    expect(markdown).toContain("title:");
  });

  test("resolves solution markdown", () => {
    const markdown = getDetailMarkdown("solutions", "what-is-a-lakebase");
    expect(markdown).toContain("# What is a Lakebase?");
  });

  test("resolves template markdown", () => {
    const markdown = getDetailMarkdown("templates", "base-app-template");
    expect(markdown).toContain("# Base App Template");
    expect(markdown).toContain("## Databricks Local Bootstrap");
  });

  test("does not duplicate recipe headings in legacy template export", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app-template");
    const matches = markdown.match(/## Databricks Local Bootstrap/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  test("rejects path traversal", () => {
    expect(() => getDetailMarkdown("docs", "../package.json")).toThrow(
      "path traversal",
    );
  });
});
