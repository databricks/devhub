import { describe, expect, test } from "vitest";
import { buildCopyPreamble } from "../src/lib/copy-preamble";

describe("buildCopyPreamble", () => {
  test("includes dev.databricks.com site reference", () => {
    const preamble = buildCopyPreamble("https://dev.databricks.com/llms.txt");
    expect(preamble).toContain("dev.databricks.com");
  });

  test("includes llms.txt URL", () => {
    const preamble = buildCopyPreamble("https://dev.databricks.com/llms.txt");
    expect(preamble).toContain("https://dev.databricks.com/llms.txt");
  });

  test("includes usage guidelines about reading before executing", () => {
    const preamble = buildCopyPreamble("https://dev.databricks.com/llms.txt");
    expect(preamble).toContain("Read through the entire content");
    expect(preamble).toContain("overlapping setup commands");
  });

  test("includes guidance on provisioning vs reuse", () => {
    const preamble = buildCopyPreamble("https://dev.databricks.com/llms.txt");
    expect(preamble).toContain("create new ones or reuse existing");
  });

  test("is a single blockquote block", () => {
    const preamble = buildCopyPreamble("https://dev.databricks.com/llms.txt");
    for (const line of preamble.split("\n")) {
      expect(line.startsWith(">")).toBe(true);
    }
  });

  test("works with localhost URLs", () => {
    const preamble = buildCopyPreamble("http://localhost:3001/llms.txt");
    expect(preamble).toContain("http://localhost:3001/llms.txt");
  });
});
