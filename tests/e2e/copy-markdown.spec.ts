import { test, expect } from "@playwright/test";

function setupClipboardMock(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    Object.defineProperty(window.navigator, "clipboard", {
      value: {
        writeText: async (value: string) => {
          (window as { __copiedText?: string }).__copiedText = value;
        },
      },
      configurable: true,
    });
  });
}

function getCopiedText(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => (window as { __copiedText?: string }).__copiedText ?? "",
  );
}

async function clickCopyMarkdownAndWaitForToast(
  page: import("@playwright/test").Page,
) {
  const trigger = page.getByRole("button", { name: "Copy as" });
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  const menuItem = page.getByRole("menuitem", { name: "Copy Markdown" });
  await menuItem.waitFor({ state: "visible" });
  await menuItem.click();
  await expect(page.getByText("Markdown copied")).toBeVisible({
    timeout: 5000,
  });
}

test.describe("copy markdown exports raw markdown on recipe pages", () => {
  test("recipe detail page copies actual markdown with code fences", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/resources/databricks-local-bootstrap");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## Databricks Local Bootstrap");
    expect(copied).toContain("```bash");
    expect(copied).toContain("databricks -v");
    expect(copied).toContain("llms.txt");
  });
});

test.describe("copy markdown exports raw markdown on template pages", () => {
  test("template page copies concatenated recipe markdown", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/resources/hello-world-app");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## Databricks Local Bootstrap");
    expect(copied).toContain("```bash");
    expect(copied).toContain('title: "Hello World App"');
    expect(copied).toContain("llms.txt");
  });

  test("multi-recipe template includes all recipes", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/resources/app-with-lakebase");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## Databricks Local Bootstrap");
    expect(copied).toContain("## Lakebase Data Persistence");
    expect(copied).toContain("---");
  });
});

test.describe("copy markdown exports raw markdown on example pages", () => {
  test("example detail page copies markdown content", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/resources/agentic-support-console");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## Agentic Support Console");
    expect(copied).toContain("Data Flow");
    expect(copied).toContain("Lakehouse Sync");
  });

  test("saas-tracker example copies markdown content", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/resources/saas-tracker");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## SaaS Subscription Tracker");
    expect(copied).toContain("Data Flow");
  });
});

test.describe("copy markdown exports raw markdown on solution pages", () => {
  test("solution detail page copies actual markdown", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/solutions/devhub-launch");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# Introducing dev.databricks.com");
    expect(copied).toContain("**dev.databricks.com**");
    expect(copied).toContain('title: "Introducing dev.databricks.com"');
    expect(copied).toContain("llms.txt");
  });
});

test.describe("copy markdown exports raw markdown on docs pages", () => {
  test("docs page copies raw markdown fetched from static file", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/start-here");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# Start here");
    expect(copied).toContain("## Pick a template");
  });

  test("raw-docs static files are served", async ({ request }) => {
    const response = await request.get("/raw-docs/start-here.md");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("# Start here");
  });

  test("docs page with CLI tabs includes both code variants in copied markdown", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/lakebase/core-concepts");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain('title="Common"');
    expect(copied).toContain('title="All Options"');
    expect(copied).toContain("databricks postgres create-branch");
  });
});
