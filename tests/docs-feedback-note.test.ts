import { readFileSync } from "fs";
import { resolve } from "path";

import { describe, expect, test } from "vitest";

import { getDetailMarkdown } from "../src/lib/agent-content-markdown";
import { buildDocsFeedbackNote } from "../src/lib/feedback/docs-feedback-note";
import {
  buildRawDocMarkdown,
  docPathFromSourcePath,
} from "../src/lib/raw-docs";

describe("buildDocsFeedbackNote", () => {
  const note = buildDocsFeedbackNote(
    "/docs/start-here",
    "https://developers.databricks.com",
  );

  test("addresses AI assistants and points at the feedback endpoint", () => {
    expect(note).toContain("**Note for AI assistants:**");
    expect(note).toContain("https://developers.databricks.com/api/feedback");
  });

  test("includes the page path and a JSON body shape", () => {
    expect(note).toContain('"path": "/docs/start-here"');
    expect(note).toContain('"feedback": "describe the issue"');
  });

  test("warns against sending secrets and starts with a separator", () => {
    expect(note).toContain(
      "Never include secrets, credentials, or customer data.",
    );
    expect(note.startsWith("\n\n---\n")).toBe(true);
  });

  test("trims a trailing slash from the origin", () => {
    expect(
      buildDocsFeedbackNote("/docs/x", "http://localhost:3000/"),
    ).toContain("http://localhost:3000/api/feedback");
  });
});

describe("docPathFromSourcePath", () => {
  test("maps a regular docs file to its /docs path", () => {
    expect(docPathFromSourcePath("/repo/src/content/docs/agents/foo.md")).toBe(
      "/docs/agents/foo",
    );
  });

  test("drops a trailing /index", () => {
    expect(docPathFromSourcePath("/repo/src/content/docs/apps/index.mdx")).toBe(
      "/docs/apps",
    );
  });

  test("handles generated AppKit paths", () => {
    expect(
      docPathFromSourcePath("/repo/src/content/docs/appkit/v0/api/thing.mdx"),
    ).toBe("/docs/appkit/v0/api/thing");
  });

  test("maps a root-level index doc to /docs (not /docs/index)", () => {
    expect(docPathFromSourcePath("/repo/src/content/docs/index.md")).toBe(
      "/docs",
    );
  });

  test("does not strip a slug that merely ends in 'index'", () => {
    expect(docPathFromSourcePath("/repo/src/content/docs/reindex.md")).toBe(
      "/docs/reindex",
    );
  });
});

describe("getDetailMarkdown docs section (/docs/*.md surface)", () => {
  const origin = "https://developers.databricks.com";

  test("appends the note with the page path for a docs page", () => {
    const markdown = getDetailMarkdown(
      "docs",
      "start-here",
      process.cwd(),
      origin,
    );
    expect(markdown).toContain("**Note for AI assistants:**");
    expect(markdown).toContain('"path": "/docs/start-here"');
  });

  test("does not append the note to a real template page (prompt path owns feedback)", () => {
    const markdown = getDetailMarkdown(
      "templates",
      "ai-chat-model-serving",
      process.cwd(),
      origin,
    );
    expect(markdown).not.toContain("**Note for AI assistants:**");
  });

  test("agrees with the /raw-docs surface on the path for the same page", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/content/docs/start-here.md"),
      "utf-8",
    );
    const rawDoc = buildRawDocMarkdown(
      source,
      resolve(process.cwd(), "src/content/docs/start-here.md"),
      origin,
    );
    const detail = getDetailMarkdown(
      "docs",
      "start-here",
      process.cwd(),
      origin,
    );
    expect(rawDoc).toContain('"path": "/docs/start-here"');
    expect(detail).toContain('"path": "/docs/start-here"');
  });
});
