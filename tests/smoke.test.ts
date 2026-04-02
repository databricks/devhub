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

  test("llms.txt exists", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("# Databricks Developer");
  });

  test("llms.txt links to all resource templates", () => {
    const text = readBuildFile("llms.txt");

    const expectedTemplates = [
      "/solutions",
      "/resources",
      "/resources/base-app-template",
      "/resources/ai-chat-app-template",
      "/resources/data-app-template",
      "/resources/analytics-dashboard-app-template",
      "/resources/ai-data-explorer-template",
    ];

    for (const path of expectedTemplates) {
      expect(text).toContain(path);
    }
  });

  test("llms.txt links to all docs pages", () => {
    const text = readBuildFile("llms.txt");

    const expectedDocPaths = [
      "/docs/get-started/getting-started",
      "/docs/get-started/your-first-app",
      "/docs/get-started/core-concepts",
      "/docs/agents/getting-started",
      "/docs/agents/core-concepts",
      "/docs/agents/development",
      "/docs/agents/ai-gateway",
      "/docs/agents/observability",
      "/docs/apps/getting-started",
      "/docs/apps/core-concepts",
      "/docs/apps/plugins",
      "/docs/apps/development",
      "/docs/lakebase/getting-started",
      "/docs/lakebase/core-concepts",
      "/docs/lakebase/development",
      "/docs/appkit",
      "/docs/tools/databricks-cli",
      "/docs/tools/appkit",
      "/docs/tools/ai-tools/agent-skills",
      "/docs/tools/ai-tools/docs-mcp-server",
      "/docs/references/appkit",
    ];

    for (const docPath of expectedDocPaths) {
      expect(text).toContain(docPath);
    }
  });
});
