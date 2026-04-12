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
      expectedPath: "/docs/start-here",
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
      href: "/docs/start-here",
      label: "Start Here",
    },
    { href: "/docs/agents/quickstart", label: "Agents" },
    { href: "/docs/apps/appkit", label: "AppKit" },
    { href: "/docs/lakebase/quickstart", label: "Lakebase" },
    { href: "/resources", label: "Guides" },
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

  test("pillar card Lakebase navigates to /docs/lakebase/quickstart", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page
      .locator("main")
      .locator('a[href^="/docs/lakebase"]')
      .first();
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/docs/lakebase/quickstart");
    expect(new URL(page.url()).pathname).toContain("/docs/lakebase/quickstart");
  });

  test("pillar card Agent Bricks navigates to /docs/agents/quickstart", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/docs/agents/quickstart"]').first().click();
    await page.waitForURL("**/docs/agents/quickstart");
    expect(new URL(page.url()).pathname).toBe("/docs/agents/quickstart");
  });

  test("pillar card Databricks Apps navigates to /docs/apps/appkit", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/docs/apps/appkit"]').first().click();
    await page.waitForURL("**/docs/apps/appkit");
    expect(new URL(page.url()).pathname).toBe("/docs/apps/appkit");
  });

  test('"See all templates" navigates to /resources', async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/resources"]').first().click();
    await page.waitForURL("**/resources");
    expect(new URL(page.url()).pathname).toBe("/resources");
  });

  test("template preview card navigates to /resources/hello-world-app", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[href="/resources/hello-world-app"]');
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/resources/hello-world-app");
    expect(new URL(page.url()).pathname).toBe("/resources/hello-world-app");
  });
});

test.describe("solutions page navigation", () => {
  const SOLUTIONS = [
    {
      id: "devhub-launch",
      path: "/solutions/devhub-launch",
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
  const RESOURCES = [
    { path: "/resources/hello-world-app", kind: "guide" },
    { path: "/resources/ai-chat-app", kind: "guide" },
    { path: "/resources/agentic-support-console", kind: "example" },
    { path: "/resources/saas-tracker", kind: "example" },
    { path: "/resources/databricks-local-bootstrap", kind: "guide" },
  ];

  for (const { path, kind } of RESOURCES) {
    test(`${kind} card navigates to ${path}`, async ({ page }) => {
      await page.goto("/resources");
      const link = page.locator(`a[href="${path}"]`).first();
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
    await page.goto("/solutions/devhub-launch");
    await page.getByRole("link", { name: /All solutions/ }).click();
    await page.waitForURL("**/solutions");
    expect(new URL(page.url()).pathname).toBe("/solutions");
  });

  test("solution content includes expected internal links", async ({
    page,
  }) => {
    await page.goto("/solutions/devhub-launch");
    const internalLinks = page.locator('article a[href^="/"]');
    const count = await internalLinks.count();
    expect(count).toBeGreaterThan(0);

    const hrefs = await internalLinks.evaluateAll((elements) =>
      elements
        .map((element) => element.getAttribute("href"))
        .filter((href): href is string => Boolean(href)),
    );
    expect(hrefs).toContain("/docs/start-here");
    expect(hrefs).toContain("/resources");
  });
});

test.describe("resource detail page navigation", () => {
  test('"All resources" back link navigates to /resources from guide', async ({
    page,
  }) => {
    await page.goto("/resources/hello-world-app");
    await page.getByRole("link", { name: /All resources/ }).click();
    await page.waitForURL("**/resources");
    expect(new URL(page.url()).pathname).toBe("/resources");
  });

  test('"All resources" back link navigates to /resources from example', async ({
    page,
  }) => {
    await page.goto("/resources/agentic-support-console");
    await page.getByRole("link", { name: /All resources/ }).click();
    await page.waitForURL("**/resources");
    expect(new URL(page.url()).pathname).toBe("/resources");
  });
});

test.describe("example detail page", () => {
  test("shows example badge, GitHub link, and init command", async ({
    page,
  }) => {
    const response = await page.goto("/resources/agentic-support-console");
    expect(response?.status()).toBe(200);
    await expect(
      page.locator("main").getByText("Example", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Agentic Support Console", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View on GitHub" }),
    ).toBeVisible();
    await expect(page.getByText("git clone --depth 1")).toBeVisible();
  });

  test("shows included guide resources", async ({ page }) => {
    await page.goto("/resources/agentic-support-console");
    await expect(
      page.getByRole("heading", { name: "Included Resources" }),
    ).toBeVisible();
    await expect(
      page.getByText("Operational Data Analytics", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("App with Lakebase", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Genie Conversational Analytics", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Query AI Gateway Endpoints", { exact: true }),
    ).toBeVisible();
  });
});

test.describe("docs sidebar navigation", () => {
  const SIDEBAR_LINKS = [
    { href: "/docs/start-here" },
    { href: "/docs/agents/quickstart" },
    { href: "/docs/agents/core-concepts" },
    { href: "/docs/agents/development" },
    { href: "/docs/agents/ai-gateway" },
    { href: "/docs/agents/observability" },
    { href: "/docs/apps/quickstart" },
    { href: "/docs/apps/core-concepts" },
    { href: "/docs/apps/plugins" },
    { href: "/docs/apps/development" },
    { href: "/docs/lakebase/quickstart" },
    { href: "/docs/lakebase/core-concepts" },
    { href: "/docs/lakebase/development" },
    { href: "/docs/tools/databricks-cli" },
    { href: "/docs/apps/appkit" },
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
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/docs/appkit/v0");

    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await expect(sidebar.getByText("AppKit Reference")).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Back to main docs" }),
    ).toHaveAttribute("href", "/docs/start-here");
    await expect(sidebar.getByRole("combobox")).toBeVisible();
  });

  test("Reference AppKit link opens latest AppKit docs entry", async ({
    page,
  }) => {
    await page.goto("/docs/start-here");
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await sidebar.getByRole("button", { name: "Reference" }).click();
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
