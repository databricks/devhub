import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, test, expect } from "vitest";

const BUILD_DIR = resolve(__dirname, "..", "build");

function readBuildFile(filePath: string): string {
  return readFileSync(resolve(BUILD_DIR, filePath), "utf-8");
}

describe("production build smoke tests", () => {
  test("sitemap.xml exists and is valid XML", () => {
    const text = readBuildFile("sitemap.xml");
    expect(text).toContain("<urlset");
    expect(text).toContain("<url>");
  });

  test("robots.txt exists and has required directives", () => {
    const text = readBuildFile("robots.txt");
    expect(text).toContain("User-agent:");
    expect(text).toContain("Sitemap:");
  });

  test("llms.txt has correct H1 and description", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("# Databricks Developer Hub");
    expect(text).toContain("> Documentation, guides, and examples");
  });

  test("llms.txt links use .md suffix", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("/docs/start-here.md");
    expect(text).toContain("/resources/hello-world-app.md");
    expect(text).toContain("/solutions.md");
  });

  test("llms.txt section order: Start Here before Resources before Solutions", () => {
    const text = readBuildFile("llms.txt");
    const startHereIdx = text.indexOf("## Start Here");
    const resourcesIdx = text.indexOf("## Resources");
    const solutionsIdx = text.indexOf("## Solutions");
    expect(startHereIdx).toBeGreaterThan(-1);
    expect(resourcesIdx).toBeGreaterThan(startHereIdx);
    expect(solutionsIdx).toBeGreaterThan(resourcesIdx);
  });

  test("llms.txt resources have subheadings", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("### Guides");
    expect(text).toContain("### Recipes");
    expect(text).toContain("### Examples");
  });

  test("llms.txt links to all resource guides", () => {
    const text = readBuildFile("llms.txt");

    const expectedTemplates = [
      "/solutions.md",
      "/resources.md",
      "/resources/hello-world-app.md",
      "/resources/ai-chat-app.md",
      "/resources/app-with-lakebase.md",
      "/resources/genie-analytics-app.md",
      "/resources/lakebase-off-platform.md",
      "/resources/operational-data-analytics.md",
    ];

    for (const path of expectedTemplates) {
      expect(text).toContain(path);
    }
  });

  test("llms.txt links to all docs pages", () => {
    const text = readBuildFile("llms.txt");

    const expectedDocPaths = [
      "/docs/start-here.md",
      "/docs/agents/quickstart.md",
      "/docs/agents/core-concepts.md",
      "/docs/agents/development.md",
      "/docs/agents/ai-gateway.md",
      "/docs/agents/observability.md",
      "/docs/apps/quickstart.md",
      "/docs/apps/core-concepts.md",
      "/docs/apps/plugins.md",
      "/docs/apps/development.md",
      "/docs/lakebase/quickstart.md",
      "/docs/lakebase/core-concepts.md",
      "/docs/lakebase/development.md",
      "/docs/apps/appkit.md",
      "/docs/appkit/v0.md",
      "/docs/appkit/v0/plugins.md",
      "/docs/tools/databricks-cli.md",
      "/docs/tools/ai-tools/agent-skills.md",
      "/docs/tools/ai-tools/docs-mcp-server.md",
    ];

    for (const docPath of expectedDocPaths) {
      expect(text).toContain(docPath);
    }
  });

  test("raw-docs strip Docusaurus frontmatter", () => {
    const text = readBuildFile("raw-docs/start-here.md");
    expect(text).not.toMatch(/^---\n/);
    expect(text).toMatch(/^# Start here/);
  });

  test("raw-docs preserve CLI tab code blocks for markdown export", () => {
    const coreConcepts = readBuildFile("raw-docs/lakebase/core-concepts.md");
    expect(coreConcepts).toContain('title="Common"');
    expect(coreConcepts).toContain('title="All Options"');
    expect(coreConcepts).toContain("databricks postgres update-endpoint");

    const development = readBuildFile("raw-docs/lakebase/development.md");
    expect(development).toContain('title="Common"');
    expect(development).toContain('title="All Options"');
    expect(development).toContain("databricks postgres create-branch");
    expect(development).toContain("databricks postgres update-branch");
  });
});
