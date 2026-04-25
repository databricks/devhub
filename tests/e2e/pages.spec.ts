import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", title: "Databricks Developer" },
  { path: "/solutions", title: "Solutions" },
  {
    path: "/solutions/devhub-launch",
    title: "Introducing dev.databricks.com",
  },
  { path: "/templates", title: "Templates" },
  { path: "/templates/hello-world-app", title: "Hello World App" },
  { path: "/templates/ai-chat-app", title: "AI Chat App" },
  { path: "/templates/app-with-lakebase", title: "App with Lakebase" },
  {
    path: "/templates/genie-analytics-app",
    title: "Genie Analytics App",
  },
  {
    path: "/templates/agentic-support-console",
    title: "Agentic Support Console",
  },
  {
    path: "/templates/saas-tracker",
    title: "SaaS Subscription Tracker",
  },
  {
    path: "/templates/databricks-local-bootstrap",
    title: "Databricks Local Bootstrap",
  },
  {
    path: "/templates/medallion-architecture-from-cdc",
    title: "Medallion Architecture from CDC History Tables",
  },
  { path: "/templates/lakebase-off-platform", title: "Lakebase Off-Platform" },
  { path: "/docs/start-here", title: "Start here" },
  { path: "/docs/agents/overview", title: "What is Agent Bricks?" },
  { path: "/docs/agents/ai-gateway", title: "AI Gateway" },
  { path: "/docs/agents/genie", title: "Genie spaces" },
  { path: "/docs/agents/custom-agents", title: "Custom agent endpoints" },
  { path: "/docs/apps/quickstart", title: "Quickstart" },
  { path: "/docs/apps/configuration", title: "App configuration" },
  { path: "/docs/apps/development", title: "App development" },
  { path: "/docs/lakebase/quickstart", title: "Quickstart" },
  {
    path: "/docs/lakebase/configuration",
    title: "Lakebase Postgres configuration",
  },
  {
    path: "/docs/lakebase/development",
    title: "Lakebase Postgres development",
  },
  { path: "/docs/appkit/v0", title: "Getting started" },
  { path: "/docs/tools/databricks-cli", title: "Databricks CLI" },
  { path: "/docs/tools/ai-tools/agent-skills", title: "Agent skills" },
  {
    path: "/docs/tools/ai-tools/docs-mcp-server",
    title: "Docs MCP Server",
  },
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
