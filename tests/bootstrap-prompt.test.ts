import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";
import { getDetailMarkdown } from "../api/content-markdown";

const ABOUT_PATH = resolve(__dirname, "..", "content", "about-devhub.md");

function readAboutDevhub(): string {
  return readFileSync(ABOUT_PATH, "utf-8");
}

describe("about-devhub.md content", () => {
  test("file exists and is non-empty", () => {
    const about = readAboutDevhub();
    expect(about.length).toBeGreaterThan(0);
  });

  test("identifies DevHub and dev.databricks.com", () => {
    const about = readAboutDevhub();
    expect(about).toContain("dev.databricks.com");
    expect(about).toContain("DevHub");
  });

  test("links to llms.txt", () => {
    const about = readAboutDevhub();
    expect(about).toContain("https://dev.databricks.com/llms.txt");
  });

  test("instructs agent to understand developer intent", () => {
    const about = readAboutDevhub();
    expect(about).toContain("bootstrapping a new project");
    expect(about).toContain("existing codebase");
  });

  test("instructs agent to ask about reuse vs provision", () => {
    const about = readAboutDevhub();
    expect(about).toContain("create new resources");
    expect(about).toContain("reuse existing");
  });
});

describe("bootstrap prompt composition", () => {
  test("about-devhub content appears before local bootstrap recipe", () => {
    const about = readAboutDevhub();
    const recipe = getDetailMarkdown("recipes", "databricks-local-bootstrap");

    expect(about).toContain("# About DevHub");
    expect(recipe).toContain("## Databricks Local Bootstrap");
  });

  test("combined prompt has about section then recipe", () => {
    const about = readAboutDevhub();
    const recipe = getDetailMarkdown("recipes", "databricks-local-bootstrap");
    const combined = `${about.trimEnd()}\n\n---\n\n${recipe.trimEnd()}`;

    const aboutIdx = combined.indexOf("# About DevHub");
    const recipeIdx = combined.indexOf("## Databricks Local Bootstrap");
    expect(aboutIdx).toBeLessThan(recipeIdx);
    expect(combined).toContain("---");
  });

  test("combined prompt includes key sections from both", () => {
    const about = readAboutDevhub();
    const recipe = getDetailMarkdown("recipes", "databricks-local-bootstrap");
    const combined = `${about.trimEnd()}\n\n---\n\n${recipe.trimEnd()}`;

    expect(combined).toContain("dev.databricks.com");
    expect(combined).toContain("llms.txt");
    expect(combined).toContain("bootstrapping a new project");
    expect(combined).toContain("databricks -v");
    expect(combined).toContain("databricks apps init");
  });
});
