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
    await page.goto("/resources/recipes/databricks-local-bootstrap");

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
    await page.goto("/resources/base-app-template");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## Databricks Local Bootstrap");
    expect(copied).toContain("```bash");
    expect(copied).toContain('title: "Base App Template"');
    expect(copied).toContain("llms.txt");
  });

  test("multi-recipe template includes all recipes", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/resources/data-app-template");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("## Databricks Local Bootstrap");
    expect(copied).toContain("## Lakebase Data Persistence");
    expect(copied).toContain("---");
  });
});

test.describe("copy markdown exports raw markdown on solution pages", () => {
  test("solution detail page copies actual markdown", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/solutions/what-is-a-lakebase");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# What is a Lakebase?");
    expect(copied).toContain("**Lakebase**");
    expect(copied).toContain('title: "What is a Lakebase?"');
    expect(copied).toContain("llms.txt");
  });
});

test.describe("copy markdown exports raw markdown on docs pages", () => {
  test("docs page copies raw markdown fetched from static file", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/get-started/getting-started");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# Getting Started");
    expect(copied).toContain("## Prerequisites");
    expect(copied).toContain("llms.txt");
  });

  test("raw-docs static files are served", async ({ request }) => {
    const response = await request.get(
      "/raw-docs/get-started/getting-started.md",
    );
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("# Getting Started");
  });
});
