import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";
import {
  getDetailMarkdown,
  loadAgentPromptParts,
} from "../api/content-markdown";
import { composeAgentPrompt } from "../src/lib/copy-preamble";

const ABOUT_PATH = resolve(__dirname, "..", "content", "about-devhub.md");
const GUIDELINES_PATH = resolve(
  __dirname,
  "..",
  "content",
  "dev-guidelines.md",
);
const HERO_INTENT_PATH = resolve(__dirname, "..", "content", "intent-hero.md");

function read(path: string): string {
  return readFileSync(path, "utf-8");
}

describe("about-devhub.md content (origin block only)", () => {
  test("file exists and is non-empty", () => {
    const about = read(ABOUT_PATH);
    expect(about.length).toBeGreaterThan(0);
  });

  test("identifies DevHub and developers.databricks.com", () => {
    const about = read(ABOUT_PATH);
    expect(about).toContain("developers.databricks.com");
    expect(about).toContain("DevHub");
  });

  test("links to llms.txt and the GitHub repo", () => {
    const about = read(ABOUT_PATH);
    expect(about).toContain("https://developers.databricks.com/llms.txt");
    expect(about).toContain("https://github.com/databricks/devhub");
  });

  test("does NOT include workflow guidance (now lives in dev-guidelines.md)", () => {
    const about = read(ABOUT_PATH);
    expect(about).not.toContain("Working with DevHub prompts");
    expect(about).not.toContain("Asking questions");
    expect(about).not.toContain("Make it look great");
  });
});

describe("dev-guidelines.md content (workflow + asking questions + design)", () => {
  test("instructs the agent to ask before creating vs reusing resources", () => {
    const guidelines = read(GUIDELINES_PATH);
    expect(guidelines).toContain("create new resources");
    expect(guidelines).toContain("reuse existing");
  });

  test("includes the asking-questions rules", () => {
    const guidelines = read(GUIDELINES_PATH);
    expect(guidelines).toContain("One question at a time");
    expect(guidelines).toContain("Not sure");
  });

  test("includes the make-it-look-great design defaults", () => {
    const guidelines = read(GUIDELINES_PATH);
    expect(guidelines).toContain("Make it look great");
    expect(guidelines).toContain("shadcn/ui");
  });
});

describe("intent-hero.md content", () => {
  test("frames the user as someone who needs a build wizard", () => {
    const hero = read(HERO_INTENT_PATH);
    expect(hero).toContain("Copy prompt for your agent");
    expect(hero).toContain("build wizard");
  });

  test("links to a curated set of templates and the llms.txt catalog", () => {
    const hero = read(HERO_INTENT_PATH);
    expect(hero).toContain("/templates/app-with-lakebase.md");
    expect(hero).toContain("/templates/ai-chat-app.md");
    expect(hero).toContain("https://developers.databricks.com/llms.txt");
  });

  test("does NOT link to /templates/hello-world-app.md (cookbook removed; bootstrap is in the meta-prompt)", () => {
    const hero = read(HERO_INTENT_PATH);
    expect(hero).not.toContain("/templates/hello-world-app");
  });
});

describe("hero bootstrap prompt composition (matches /api/bootstrap-prompt)", () => {
  test("composed hero prompt has the 4-block structure with the local-dev-environment recipe inline", () => {
    const combined = composeAgentPrompt({
      parts: loadAgentPromptParts(),
      kind: "hero",
      siteOrigin: "https://developers.databricks.com",
    });

    const aboutIdx = combined.indexOf("# About DevHub");
    const guidelinesIdx = combined.indexOf("# Working with DevHub prompts");
    const intentIdx = combined.indexOf("# What the user just did");
    const bootstrapIdx = combined.indexOf(
      "# Verify your local Databricks dev environment",
    );
    const localBootstrapBodyIdx = combined.indexOf(
      "Install the Databricks CLI",
    );

    expect(aboutIdx).toBe(0);
    expect(guidelinesIdx).toBeGreaterThan(aboutIdx);
    expect(intentIdx).toBeGreaterThan(guidelinesIdx);
    expect(bootstrapIdx).toBeGreaterThan(intentIdx);
    expect(localBootstrapBodyIdx).toBeGreaterThan(bootstrapIdx);
    // Hero has no trailing template body.
    expect(combined).not.toContain("# The recipe the user copied");
    expect(combined).not.toContain("# The cookbook the user copied");
    expect(combined).not.toContain("# The example the user copied");
  });

  test("composed hero prompt includes goal content and llms.txt URL", () => {
    const combined = composeAgentPrompt({
      parts: loadAgentPromptParts(),
      kind: "hero",
      siteOrigin: "https://developers.databricks.com",
    });
    // goal.md has the outcome description, not CLI commands
    expect(combined).toContain("Install the Databricks CLI");
    expect(combined).toContain("https://developers.databricks.com/llms.txt");
  });

  test("set-up-your-local-dev-environment recipe is still resolvable on its own", () => {
    const recipe = getDetailMarkdown(
      "recipes",
      "set-up-your-local-dev-environment",
    );
    // Agent prompt now returns goal.md content (outcome), not full implementation
    expect(recipe).toContain("Install the Databricks CLI");
    expect(recipe).toContain("authenticated CLI profile");
  });
});
