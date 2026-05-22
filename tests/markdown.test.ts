import { describe, expect, test } from "vitest";
import {
  composeTemplateAgentPrompt,
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
    expect(markdown).toContain("Hello World, developers.databricks.com!");
    expect(markdown).not.toMatch(/^# /m);
  });

  test("solution markdown frontmatter is built from the registry, not the .md file", () => {
    const markdown = getDetailMarkdown(
      "solutions",
      "devhub-launch",
      process.cwd(),
      "https://developers.databricks.com",
    );
    const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/);
    expect(frontmatter).not.toBeNull();
    if (!frontmatter) return;
    const block = frontmatter[1];
    expect(block).toMatch(/^title:\s+"Introducing DevHub"$/m);
    expect(block).toMatch(
      /^url:\s+https:\/\/dev\.databricks\.com\/solutions\/devhub-launch$/m,
    );
    expect(block).toMatch(/^summary:\s+".+"$/m);
    expect(block).toMatch(/^publishedAt:\s*2026-05-04$/m);
    expect(block).toMatch(/^authors:$/m);
    expect(block).toContain("name: Andre Landgraf");
    expect(block).toContain("role: Staff Developer Advocate, Databricks");
  });

  test("solution frontmatter url is absolute and uses the supplied site origin", () => {
    const markdown = getDetailMarkdown(
      "solutions",
      "devhub-launch",
      process.cwd(),
      "http://localhost:3001",
    );
    const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/);
    expect(frontmatter).not.toBeNull();
    if (!frontmatter) return;
    expect(frontmatter[1]).toMatch(
      /^url:\s+http:\/\/localhost:3001\/solutions\/devhub-launch$/m,
    );
  });

  test("source .md file no longer carries its own frontmatter (registry is the source of truth)", () => {
    const markdown = getDetailMarkdown("solutions", "devhub-launch");
    const frontmatterCount = (markdown.match(/^---$/gm) ?? []).length;
    expect(frontmatterCount).toBe(2);
  });

  test("resolves recipe markdown (returns goal when goal.md exists)", () => {
    const markdown = getDetailMarkdown(
      "recipes",
      "set-up-your-local-dev-environment",
    );
    // Agent prompt returns goal.md content (no heading, just description)
    expect(markdown).toContain("Install the Databricks CLI");
    expect(markdown).toContain("authenticated CLI profile");
  });

  test("resolves example markdown", () => {
    const markdown = getDetailMarkdown("examples", "agentic-support-console");
    expect(markdown).toContain("AI-powered support console");
    expect(markdown).toContain("Data Flow");
  });

  test("resolves template markdown (cookbook in agent mode)", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");
    expect(markdown).toContain("# AI Chat App");
    // Agent mode uses "Component:" headings
    expect(markdown).toContain("Component: Lakebase Agent Memory");
  });

  test("template markdown no longer embeds the local dev environment recipe (now injected by the meta-prompt)", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");
    expect(markdown).not.toContain("## Set Up Your Local Dev Environment");
    expect(markdown).not.toMatch(/^### Set Up Your Local Dev Environment$/m);
  });

  test("template markdown for cookbook uses agent mode (goals only, no prereqs or full content)", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");
    // Agent mode: cookbook goal + recipe goals as components
    expect(markdown).toContain("streaming AI chat app on Databricks");
    expect(markdown).toContain("## Component:");
    // Agent mode should NOT include prerequisites section
    expect(markdown).not.toContain("## Prerequisites");
  });

  test("template markdown includes cookbook goal.md above recipe goals", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");
    const goalIdx = markdown.indexOf("streaming AI chat app on Databricks");
    const componentIdx = markdown.indexOf("## Component:");
    expect(goalIdx).toBeGreaterThanOrEqual(0);
    expect(goalIdx).toBeLessThan(componentIdx);
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
      "set-up-your-local-dev-environment",
    );
    expect(markdown).toContain("Install the Databricks CLI");
  });

  test("resolves an example slug via templates", () => {
    const markdown = getDetailMarkdown("templates", "agentic-support-console");
    expect(markdown).toContain("AI-powered support console");
  });

  test("resolves a cookbook slug via templates", () => {
    const markdown = getDetailMarkdown("templates", "ai-chat-app");
    expect(markdown).toContain("# AI Chat App");
    expect(markdown).toContain("Component: Lakebase Agent Memory");
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
    expect(markdown).toContain("/templates/ai-chat-app.md");
    expect(markdown).toContain(
      "/templates/set-up-your-local-dev-environment.md",
    );
    expect(markdown).not.toContain("/templates/hello-world-app.md");
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

describe("composeTemplateAgentPrompt wraps template bodies in the agent prompt", () => {
  const ABOUT_START = "# About DevHub";

  test("recipe wraps with about + guidelines + recipe intent + bootstrap + body", () => {
    const body = getDetailMarkdown("recipes", "lakebase-agent-memory");
    const result = composeTemplateAgentPrompt({
      body,
      section: "recipes",
      slug: "lakebase-agent-memory",
      siteOrigin: "https://developers.databricks.com",
    });
    expect(result.startsWith(ABOUT_START)).toBe(true);
    expect(result).toContain("# Working with DevHub prompts");
    expect(result).toContain("# Verify your local Databricks dev environment");
    expect(result).toContain("# The recipe the user copied");
    expect(result).toContain("Lakebase Agent Memory");
  });

  test("example wraps with example intent and example label", () => {
    const body = getDetailMarkdown("examples", "agentic-support-console");
    const result = composeTemplateAgentPrompt({
      body,
      section: "examples",
      slug: "agentic-support-console",
      siteOrigin: "https://developers.databricks.com",
    });
    expect(result).toContain("# The example the user copied");
    expect(result).toContain("Agentic Support Console");
  });

  test("templates section detects cookbook kind from slug", () => {
    const body = getDetailMarkdown("templates", "ai-chat-app");
    const result = composeTemplateAgentPrompt({
      body,
      section: "templates",
      slug: "ai-chat-app",
      siteOrigin: "https://developers.databricks.com",
    });
    expect(result).toContain("# The cookbook the user copied");
  });

  test("rewrites canonical origin to localhost when called with localhost", () => {
    const body = getDetailMarkdown(
      "recipes",
      "set-up-your-local-dev-environment",
    );
    const result = composeTemplateAgentPrompt({
      body,
      section: "recipes",
      slug: "set-up-your-local-dev-environment",
      siteOrigin: "localhost:3001",
    });
    expect(result).toContain("http://localhost:3001/llms.txt");
    expect(result).toContain("- Website: http://localhost:3001");
    expect(result).not.toContain("https://developers.databricks.com/llms.txt");
  });

  test("preserves canonical origin when production host is used", () => {
    const body = getDetailMarkdown(
      "recipes",
      "set-up-your-local-dev-environment",
    );
    const result = composeTemplateAgentPrompt({
      body,
      section: "recipes",
      slug: "set-up-your-local-dev-environment",
      siteOrigin: "developers.databricks.com",
    });
    expect(result).toContain("https://developers.databricks.com/llms.txt");
    expect(result).toContain("- Website: https://developers.databricks.com");
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
      "set-up-your-local-dev-environment.md",
    );
    expect(markdown).toContain("Install the Databricks CLI");
  });

  test("templates slug with .md extension resolves", () => {
    const markdown = getDetailMarkdown(
      "templates",
      "agentic-support-console.md",
    );
    expect(markdown).toContain("AI-powered support console");
  });
});
