import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", title: "Databricks Developer" },
  { path: "/solutions", title: "Solutions" },
  {
    path: "/solutions/devhub-launch",
    title: "Introducing dev.databricks.com",
  },
  { path: "/resources", title: "Resources" },
  { path: "/resources/base-app-template", title: "Base App Template" },
  { path: "/resources/ai-chat-app-template", title: "AI Chat App Template" },
  { path: "/resources/data-app-template", title: "Data App Template" },
  {
    path: "/resources/genie-analytics-app-template",
    title: "Genie Analytics App Template",
  },
  {
    path: "/docs/get-started/getting-started",
    title: "Getting Started",
  },
  { path: "/docs/get-started/your-first-app", title: "Your First App" },
  { path: "/docs/get-started/core-concepts", title: "Core Concepts" },
  { path: "/docs/agents/getting-started", title: "Getting Started" },
  { path: "/docs/agents/core-concepts", title: "Core Concepts" },
  { path: "/docs/agents/development", title: "Development" },
  { path: "/docs/agents/ai-gateway", title: "AI Gateway" },
  { path: "/docs/agents/observability", title: "Observability" },
  { path: "/docs/apps/getting-started", title: "Getting Started" },
  { path: "/docs/apps/core-concepts", title: "Core Concepts" },
  { path: "/docs/apps/plugins", title: "Plugins" },
  { path: "/docs/apps/development", title: "Development" },
  { path: "/docs/lakebase/getting-started", title: "Getting Started" },
  { path: "/docs/lakebase/core-concepts", title: "Core Concepts" },
  { path: "/docs/lakebase/development", title: "Development" },
  { path: "/docs/appkit", title: "AppKit" },
  { path: "/docs/appkit/v0", title: "Getting started" },
  { path: "/docs/tools/databricks-cli", title: "Databricks CLI" },
  { path: "/docs/tools/appkit", title: "AppKit" },
  { path: "/docs/tools/ai-tools/agent-skills", title: "Agent Skills" },
  {
    path: "/docs/tools/ai-tools/docs-mcp-server",
    title: "Docs MCP Server",
  },
  { path: "/docs/references/appkit", title: "AppKit" },
];

test.describe("all pages load without errors", () => {
  for (const { path, title } of PAGES) {
    test(`${path} loads successfully`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(
        new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );

      const fatalErrors = consoleErrors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("the server responded with a status of 404") &&
          !e.includes("Download the React DevTools") &&
          !e.includes("Warning:") &&
          !e.includes("Docusaurus"),
      );
      expect(fatalErrors).toEqual([]);
    });
  }
});

test.describe("static assets load correctly", () => {
  test("sitemap.xml returns 200", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
  });

  test("robots.txt returns 200", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
  });

  test("llms.txt returns 200", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
  });
});
