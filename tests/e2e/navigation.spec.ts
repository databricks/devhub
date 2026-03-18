import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BOOTSTRAP_PROMPT_MARKDOWN = readFileSync(
  resolve(process.cwd(), "content/recipes/databricks-local-bootstrap.md"),
  "utf-8",
);

test.describe("navbar navigation", () => {
  const NAVBAR_LINKS = [
    { label: "Solutions", expectedPath: "/solutions" },
    { label: "Resources", expectedPath: "/resources" },
    {
      label: "Docs",
      expectedPath: "/docs/get-started/getting-started",
    },
  ];

  for (const { label, expectedPath } of NAVBAR_LINKS) {
    test(`navbar "${label}" navigates to ${expectedPath}`, async ({ page }) => {
      await page.goto("/");
      await page
        .locator(".navbar__items")
        .getByRole("link", { name: label, exact: true })
        .click();
      await page.waitForURL(`**${expectedPath}`);
      expect(new URL(page.url()).pathname).toBe(expectedPath);
    });
  }
});

test.describe("footer navigation", () => {
  const FOOTER_INTERNAL_LINKS = [
    {
      href: "/docs/get-started/getting-started",
      label: "Get Started",
    },
    { href: "/docs/agents/getting-started", label: "Agents" },
    { href: "/docs/appkit", label: "AppKit" },
    { href: "/docs/lakebase", label: "Lakebase" },
    { href: "/resources", label: "Templates" },
    { href: "/solutions", label: "Solutions" },
  ];

  for (const { href, label } of FOOTER_INTERNAL_LINKS) {
    test(`footer "${label}" navigates to ${href}`, async ({ page }) => {
      await page.goto("/");
      await page.locator(`footer a[href="${href}"]`).click();
      await page.waitForURL(`**${href}`);
      expect(new URL(page.url()).pathname).toBe(href);
    });
  }
});

test.describe("home page link navigation", () => {
  test('hero "Copy Prompt" copies recipe markdown from API', async ({
    page,
  }) => {
    await page.route(
      "**/api/markdown?section=recipes&slug=databricks-local-bootstrap",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "text/markdown; charset=utf-8",
          body: BOOTSTRAP_PROMPT_MARKDOWN,
        });
      },
    );
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "clipboard", {
        value: {
          writeText: async (value: string) => {
            (window as { __copiedText?: string }).__copiedText = value;
          },
        },
        configurable: true,
      });
    });

    await page.goto("/");
    const button = page
      .locator("main")
      .getByRole("button", { name: "Copy Prompt" });
    await button.waitFor({ state: "visible" });
    await expect(button).toBeEnabled();
    await button.click();

    await expect
      .poll(async () =>
        page.evaluate(() => (window as { __copiedText?: string }).__copiedText),
      )
      .toBeTruthy();
    await expect(page.getByText("Failed to copy bootstrap prompt")).toHaveCount(
      0,
    );
    const finalCopiedText = await page.evaluate(
      () => (window as { __copiedText?: string }).__copiedText,
    );
    expect(finalCopiedText).toBe(BOOTSTRAP_PROMPT_MARKDOWN);
  });

  test("pillar card Lakebase navigates to /docs/lakebase", async ({ page }) => {
    await page.goto("/");
    const link = page
      .locator("main")
      .locator('a[href^="/docs/lakebase"]')
      .first();
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/docs/lakebase");
    expect(new URL(page.url()).pathname).toContain("/docs/lakebase");
  });

  test("pillar card AgentBricks navigates to /docs/agents/getting-started", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .locator('a[href="/docs/agents/getting-started"]')
      .first()
      .click();
    await page.waitForURL("**/docs/agents/getting-started");
    expect(new URL(page.url()).pathname).toBe("/docs/agents/getting-started");
  });

  test("pillar card Databricks Apps navigates to /docs/appkit", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/docs/appkit"]').first().click();
    await page.waitForURL("**/docs/appkit");
    expect(new URL(page.url()).pathname).toBe("/docs/appkit");
  });

  test('"See all templates" navigates to /resources', async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/resources"]').first().click();
    await page.waitForURL("**/resources");
    expect(new URL(page.url()).pathname).toBe("/resources");
  });

  test("template preview card navigates to /resources/base-app-template", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[href="/resources/base-app-template"]');
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/resources/base-app-template");
    expect(new URL(page.url()).pathname).toBe("/resources/base-app-template");
  });
});

test.describe("solutions page navigation", () => {
  const SOLUTIONS = [
    {
      id: "what-is-a-lakebase",
      path: "/solutions/what-is-a-lakebase",
    },
    {
      id: "from-chatbots-to-agentic-workflows",
      path: "/solutions/from-chatbots-to-agentic-workflows",
    },
    {
      id: "database-branching-for-ai-agents",
      path: "/solutions/database-branching-for-ai-agents",
    },
  ];

  for (const { path } of SOLUTIONS) {
    test(`solution card navigates to ${path}`, async ({ page }) => {
      await page.goto("/solutions");
      const link = page.locator(`a[href="${path}"]`);
      await link.waitFor({ state: "visible" });
      await link.click();
      await page.waitForURL(`**${path}`);
      expect(new URL(page.url()).pathname).toBe(path);
    });
  }
});

test.describe("resources page navigation", () => {
  const TEMPLATES = [
    { path: "/resources/base-app-template" },
    { path: "/resources/ai-chat-app-template" },
  ];

  for (const { path } of TEMPLATES) {
    test(`resource card navigates to ${path}`, async ({ page }) => {
      await page.goto("/resources");
      const link = page.locator(`a[href="${path}"]`);
      await link.waitFor({ state: "visible" });
      await link.click();
      await page.waitForURL(`**${path}`);
      expect(new URL(page.url()).pathname).toBe(path);
    });
  }
});

test.describe("solution detail page navigation", () => {
  test('"All solutions" back link navigates to /solutions', async ({
    page,
  }) => {
    await page.goto("/solutions/what-is-a-lakebase");
    await page.getByRole("link", { name: /All solutions/ }).click();
    await page.waitForURL("**/solutions");
    expect(new URL(page.url()).pathname).toBe("/solutions");
  });

  test("solution content includes expected outbound links", async ({
    page,
  }) => {
    await page.goto("/solutions/from-chatbots-to-agentic-workflows");
    const outboundLinks = page.locator('article a[href^="https://"]');
    const count = await outboundLinks.count();
    expect(count).toBeGreaterThan(0);

    await expect(outboundLinks).toContainText(["Resources"]);
    const hrefs = await outboundLinks.evaluateAll((elements) =>
      elements
        .map((element) => element.getAttribute("href"))
        .filter((href): href is string => Boolean(href)),
    );
    expect(hrefs).toContain("https://dev.databricks.com/resources");
    expect(hrefs).toContain(
      "https://dev.databricks.com/docs/agents/getting-started",
    );
    expect(hrefs).toContain(
      "https://dev.databricks.com/docs/lakebase/getting-started",
    );
  });
});

test.describe("resource detail page navigation", () => {
  test('"All resources" back link navigates to /resources', async ({
    page,
  }) => {
    await page.goto("/resources/base-app-template");
    await page.getByRole("link", { name: /All resources/ }).click();
    await page.waitForURL("**/resources");
    expect(new URL(page.url()).pathname).toBe("/resources");
  });
});

test.describe("docs sidebar navigation", () => {
  const SIDEBAR_LINKS = [
    { href: "/docs/get-started/getting-started" },
    { href: "/docs/get-started/your-first-app" },
    { href: "/docs/get-started/core-concepts" },
    { href: "/docs/agents/getting-started" },
    { href: "/docs/agents/core-concepts" },
    { href: "/docs/agents/development" },
    { href: "/docs/agents/ai-gateway" },
    { href: "/docs/agents/observability" },
    { href: "/docs/apps/getting-started" },
    { href: "/docs/apps/core-concepts" },
    { href: "/docs/apps/plugins" },
    { href: "/docs/apps/development" },
    { href: "/docs/lakebase/getting-started" },
    { href: "/docs/lakebase/core-concepts" },
    { href: "/docs/lakebase/development" },
    { href: "/docs/tools/databricks-cli" },
    { href: "/docs/tools/appkit" },
    { href: "/docs/tools/ai-tools/agent-skills" },
    { href: "/docs/tools/ai-tools/docs-mcp-server" },
    { href: "/docs/appkit/v0" },
  ];

  for (const { href } of SIDEBAR_LINKS) {
    test(`sidebar link ${href} is reachable`, async ({ page }) => {
      const response = await page.goto(href);
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(href);
    });
  }

  test("AppKit docs show AppKit-specific sidebar shell", async ({ page }) => {
    await page.goto("/docs/appkit/v0");

    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await expect(sidebar.getByText("AppKit Reference")).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Back to main docs" }),
    ).toHaveAttribute("href", "/docs/get-started/getting-started");
    await expect(sidebar.getByRole("combobox")).toBeVisible();
  });

  test("References AppKit link opens latest AppKit docs entry", async ({
    page,
  }) => {
    await page.goto("/docs/get-started/getting-started");
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await sidebar.getByRole("button", { name: "References" }).click();
    const appKitReferenceLink = page
      .locator(
        'nav[aria-label="Docs sidebar"] a.menu__link[href*="/docs/appkit/"]',
      )
      .first();
    await appKitReferenceLink.click();
    await expect(page).toHaveURL(/\/docs\/appkit\/v\d+/);
  });

  test("AppKit API categories collapse sibling section", async ({ page }) => {
    await page.goto("/docs/appkit/v0/api/appkit-ui");

    const appKitCategory = page.locator(
      'a.menu__link[href^="/docs/appkit/v0/api/appkit/"]',
    );
    const appKitCategoryListItem = appKitCategory.locator(
      "xpath=ancestor::li[contains(@class, 'menu__list-item')][1]",
    );
    await expect(appKitCategoryListItem).toHaveClass(
      /menu__list-item--collapsed/,
    );
  });
});
