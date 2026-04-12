import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", title: "Databricks Developer" },
  { path: "/solutions", title: "Solutions" },
  {
    path: "/solutions/devhub-launch",
    title: "Introducing dev.databricks.com",
  },
  { path: "/resources", title: "Resources" },
  { path: "/resources/hello-world-app", title: "Hello World App" },
  { path: "/resources/ai-chat-app", title: "AI Chat App" },
  { path: "/resources/app-with-lakebase", title: "App with Lakebase" },
  {
    path: "/resources/genie-analytics-app",
    title: "Genie Analytics App",
  },
  {
    path: "/resources/agentic-support-console",
    title: "Agentic Support Console",
  },
  {
    path: "/resources/saas-tracker",
    title: "SaaS Subscription Tracker",
  },
  {
    path: "/resources/databricks-local-bootstrap",
    title: "Databricks Local Bootstrap",
  },
  {
    path: "/resources/medallion-architecture-from-cdc",
    title: "Medallion Architecture from CDC History Tables",
  },
  { path: "/resources/lakebase-off-platform", title: "Lakebase Off-Platform" },
  { path: "/docs/start-here", title: "Start here" },
  { path: "/docs/agents/quickstart", title: "Quickstart" },
  { path: "/docs/agents/core-concepts", title: "How agents work" },
  {
    path: "/docs/agents/development",
    title: "Local development and deployment",
  },
  { path: "/docs/agents/ai-gateway", title: "Model serving and AI Gateway" },
  { path: "/docs/agents/observability", title: "Tracing and evaluation" },
  { path: "/docs/apps/quickstart", title: "Quickstart" },
  { path: "/docs/apps/core-concepts", title: "App runtime and configuration" },
  { path: "/docs/apps/plugins", title: "Built-in plugins" },
  { path: "/docs/apps/development", title: "Local development and deployment" },
  { path: "/docs/lakebase/quickstart", title: "Provision and connect" },
  {
    path: "/docs/lakebase/core-concepts",
    title: "Projects, branches, and endpoints",
  },
  {
    path: "/docs/lakebase/development",
    title: "App integration and development",
  },
  { path: "/docs/apps/appkit", title: "AppKit SDK" },
  { path: "/docs/appkit/v0", title: "Getting started" },
  { path: "/docs/tools/databricks-cli", title: "Databricks CLI" },
  { path: "/docs/tools/ai-tools/agent-skills", title: "Agent skills" },
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
