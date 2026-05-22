import { test, expect } from "@playwright/test";
import { loadAgentPromptParts } from "../../api/content-markdown";
import { composeAgentPrompt } from "../../src/lib/copy-preamble";

// Reproduce what `/api/bootstrap-prompt` returns for the hero "Copy prompt"
// button: the full agent-prompt composer with kind="hero". We mock the API
// response with this string so the e2e test asserts the composed output
// shape rather than depending on a running dev server.
const BOOTSTRAP_PROMPT_MARKDOWN = composeAgentPrompt({
  parts: loadAgentPromptParts(),
  kind: "hero",
  siteOrigin: "https://developers.databricks.com",
});

test.describe("navbar navigation", () => {
  const NAVBAR_LINKS = [
    { label: "Solutions", expectedPath: "/solutions" },
    { label: "Templates", expectedPath: "/templates" },
    { label: "Docs", expectedPath: "/docs/start-here" },
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
      href: "/",
      label: "Databricks logo",
    },
    {
      href: "/docs/start-here",
      label: "Start Here",
    },
    { href: "/docs/agents/overview", label: "Agent Bricks" },
    { href: "/docs/apps/overview", label: "Databricks Apps" },
    { href: "/docs/lakebase/overview", label: "Lakebase" },
    { href: "/templates", label: "Templates" },
    { href: "/solutions", label: "Solutions" },
  ];

  const FOOTER_EXTERNAL_LINKS = [
    {
      href: "https://www.databricks.com/product/databricks-apps",
      label: "Databricks Apps product",
    },
    {
      href: "https://www.databricks.com/product/lakebase",
      label: "Lakebase product",
    },
    {
      href: "https://www.databricks.com/product/artificial-intelligence/agent-bricks",
      label: "Agent Bricks product",
    },
    { href: "https://databricks.com", label: "Databricks" },
    { href: "https://databricks.com/signup", label: "Sign Up" },
    { href: "https://help.databricks.com", label: "Support" },
    {
      href: "https://www.databricks.com/legal/privacynotice",
      label: "Privacy Notice",
    },
    {
      href: "https://www.databricks.com/legal/terms-of-use",
      label: "Terms of Use",
    },
    {
      href: "https://www.databricks.com/legal/modern-slavery-policy-statement",
      label: "Modern Slavery Statement",
    },
    {
      href: "https://www.databricks.com/legal/supplemental-privacy-notice-california-residents",
      label: "California Privacy",
    },
  ];

  const EXPECTED_FOOTER_HREFS = [
    "/",
    "https://www.databricks.com/product/databricks-apps",
    "https://www.databricks.com/product/lakebase",
    "https://www.databricks.com/product/artificial-intelligence/agent-bricks",
    "/templates",
    "/solutions",
    "/docs/start-here",
    "/docs/apps/overview",
    "/docs/lakebase/overview",
    "/docs/agents/overview",
    "https://databricks.com",
    "https://databricks.com/signup",
    "https://help.databricks.com",
    "https://www.databricks.com/legal/privacynotice",
    "https://www.databricks.com/legal/terms-of-use",
    "https://www.databricks.com/legal/modern-slavery-policy-statement",
    "https://www.databricks.com/legal/supplemental-privacy-notice-california-residents",
  ];

  test("footer renders every expected link in order", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("footer a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toEqual(EXPECTED_FOOTER_HREFS);
  });

  for (const { href, label } of FOOTER_INTERNAL_LINKS) {
    test(`footer "${label}" navigates to ${href}`, async ({ page }) => {
      await page.goto(href === "/" ? "/templates" : "/");
      await page.locator(`footer a[href="${href}"]`).click();
      await page.waitForURL((url) => url.pathname === href);
      expect(new URL(page.url()).pathname).toBe(href);
    });
  }

  for (const { href, label } of FOOTER_EXTERNAL_LINKS) {
    test(`footer "${label}" links to ${href}`, async ({ page }) => {
      await page.goto("/");
      const link = page.locator(`footer a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  }
});

test.describe("home page link navigation", () => {
  test('hero "Copy Prompt" copies the full composed agent prompt (about + guidelines + hero intent + bootstrap) from API', async ({
    page,
  }) => {
    await page.route("**/api/bootstrap-prompt", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/markdown; charset=utf-8",
        body: BOOTSTRAP_PROMPT_MARKDOWN,
      });
    });
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
      .getByRole("button", { name: "Copy prompt for your agent" })
      .first();
    await button.waitFor({ state: "visible" });
    await expect(button).toBeEnabled();
    await button.click();

    await expect(
      page.locator("main").getByRole("button", { name: /^Copied — now paste/ }),
    ).toBeVisible({ timeout: 5000 });
    const finalCopiedText = await page.evaluate(
      () => (window as { __copiedText?: string }).__copiedText,
    );
    expect(finalCopiedText).toBe(BOOTSTRAP_PROMPT_MARKDOWN);
    expect(finalCopiedText).toContain("# About DevHub");
    expect(finalCopiedText).toContain("# Working with DevHub prompts");
    expect(finalCopiedText).toContain("# What the user just did");
    expect(finalCopiedText).toContain(
      "# Verify your local Databricks dev environment",
    );
    expect(finalCopiedText).toContain("Install the Databricks CLI");
    expect(finalCopiedText).toContain("developers.databricks.com");
    expect(finalCopiedText).toContain("llms.txt");
  });

  test("pillar card Lakebase navigates to /docs/lakebase/overview", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[href="/docs/lakebase/overview"]').first();
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/docs/lakebase/overview");
    expect(new URL(page.url()).pathname).toContain("/docs/lakebase/overview");
  });

  test("pillar card Agent Bricks navigates to /docs/agents/overview", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/docs/agents/overview"]').first().click();
    await page.waitForURL("**/docs/agents/overview");
    expect(new URL(page.url()).pathname).toBe("/docs/agents/overview");
  });

  test("pillar card Databricks Apps navigates to /docs/apps/overview", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/docs/apps/overview"]').first().click();
    await page.waitForURL("**/docs/apps/overview");
    expect(new URL(page.url()).pathname).toBe("/docs/apps/overview");
  });

  test('"See all templates" navigates to /templates', async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/templates"]').first().click();
    await page.waitForURL("**/templates");
    expect(new URL(page.url()).pathname).toBe("/templates");
  });

  test("template preview card navigates to /templates/ai-chat-app", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[href="/templates/ai-chat-app"]').first();
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/templates/ai-chat-app");
    expect(new URL(page.url()).pathname).toBe("/templates/ai-chat-app");
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

test.describe("templates page navigation", () => {
  const TEMPLATES = [
    { path: "/templates/ai-chat-app", kind: "cookbook" },
    { path: "/templates/app-with-lakebase", kind: "cookbook" },
    { path: "/templates/agentic-support-console", kind: "example" },
    { path: "/templates/saas-tracker", kind: "example" },
    { path: "/templates/set-up-your-local-dev-environment", kind: "recipe" },
  ];

  for (const { path, kind } of TEMPLATES) {
    test(`${kind} card navigates to ${path}`, async ({ page }) => {
      await page.goto("/templates");
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
    expect(hrefs).toContain("/templates");
  });
});

test.describe("template detail page navigation", () => {
  test('"All templates" back link navigates to /templates from cookbook', async ({
    page,
  }) => {
    await page.goto("/templates/ai-chat-app");
    await page.getByRole("link", { name: /All templates/ }).click();
    await page.waitForURL("**/templates");
    expect(new URL(page.url()).pathname).toBe("/templates");
  });

  test('"All templates" back link navigates to /templates from example', async ({
    page,
  }) => {
    await page.goto("/templates/agentic-support-console");
    await page.getByRole("link", { name: /All templates/ }).click();
    await page.waitForURL("**/templates");
    expect(new URL(page.url()).pathname).toBe("/templates");
  });
});

test.describe("example detail page", () => {
  test("shows starter-code card with GitHub link", async ({ page }) => {
    const response = await page.goto("/templates/agentic-support-console");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Agentic Support Console", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("Includes a working starter app"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View on GitHub" }),
    ).toBeVisible();
  });

  test("shows included templates", async ({ page }) => {
    await page.goto("/templates/agentic-support-console");
    await expect(
      page.getByRole("heading", { name: "Built on these templates" }),
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
    { href: "/docs/agents/overview" },
    { href: "/docs/agents/ai-gateway" },
    { href: "/docs/agents/genie" },
    { href: "/docs/agents/custom-agents" },
    { href: "/docs/apps/quickstart" },
    { href: "/docs/apps/configuration" },
    { href: "/docs/apps/development" },
    { href: "/docs/lakebase/quickstart" },
    { href: "/docs/lakebase/configuration" },
    { href: "/docs/lakebase/development" },
    { href: "/docs/tools/databricks-cli" },
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

  test("Databricks Apps AppKit link opens latest AppKit docs entry", async ({
    page,
  }) => {
    await page.goto("/docs/start-here");
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await sidebar.getByRole("button", { name: "Databricks Apps" }).click();
    await sidebar.getByRole("button", { name: "AppKit" }).click();
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
