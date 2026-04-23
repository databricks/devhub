import { test, expect } from "@playwright/test";
import {
  examples,
  recipesInOrder,
  templates,
} from "../../src/lib/recipes/recipes";

const RESOURCE_COUNT =
  examples.length + templates.length + recipesInOrder.length;
const TOTAL_RESOURCES = `${RESOURCE_COUNT} of ${RESOURCE_COUNT} templates`;

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

test.describe("resources page search", () => {
  test("search bar filters results and clearing restores all", async ({
    page,
  }) => {
    await page.goto("/resources");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();

    await page.getByRole("searchbox").fill("genie");
    await expect(
      page.getByText(`7 of ${RESOURCE_COUNT} templates`),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Inventory Intelligence" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Agentic Support Console" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "SaaS Subscription Tracker" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Content Moderator" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Genie Analytics App" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Genie Conversational Analytics" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Genie Multi-Space Selector" }),
    ).toBeVisible();

    await page.getByRole("searchbox").fill("");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();
  });
});

test.describe("resources page service filter", () => {
  test("checking a service narrows results and shows active pill", async ({
    page,
  }) => {
    await page.goto("/resources");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();

    await page.getByRole("checkbox", { name: "Lakebase", exact: true }).check();

    const count = page.getByText(
      new RegExp(`^\\d+ of ${RESOURCE_COUNT} templates$`),
    );
    await expect(count).not.toHaveText(TOTAL_RESOURCES);

    await expect(
      page.getByRole("link", { name: "Lakebase Data Persistence" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Query AI Gateway Endpoints" }),
    ).toBeHidden();
  });
});

test.describe("resources page resource type filter", () => {
  test("Examples filter shows only examples, Guides shows only guides", async ({
    page,
  }) => {
    await page.goto("/resources");

    await page.getByRole("checkbox", { name: "Examples" }).check();
    await expect(
      page.getByRole("link", { name: "Agentic Support Console" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Hello World App" }),
    ).toBeHidden();

    await page.getByRole("checkbox", { name: "Examples" }).uncheck();
    await page.getByRole("checkbox", { name: "Guides" }).check();
    await expect(
      page.getByRole("link", { name: "Databricks Local Bootstrap" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Agentic Support Console" }),
    ).toBeHidden();
  });
});

test.describe("resources page tag filter", () => {
  test("clicking a tag on a card adds an active filter pill", async ({
    page,
  }) => {
    await page.goto("/resources");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();

    await page.getByRole("button", { name: "Genie" }).first().click();

    await expect(
      page.getByText(new RegExp(`^\\d+ of ${RESOURCE_COUNT} templates$`)),
    ).not.toHaveText(TOTAL_RESOURCES);
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
  });
});

test.describe("resources page clear all filters", () => {
  test("clear all resets search, service filter, and tag filters", async ({
    page,
  }) => {
    await page.goto("/resources");

    await page.getByRole("searchbox").fill("lakebase");
    await page.getByRole("checkbox", { name: "Lakebase", exact: true }).check();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();

    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeHidden();
  });
});

test.describe("example cards are not selectable", () => {
  test("example card has no checkbox", async ({ page }) => {
    await page.goto("/resources");
    const exampleCard = page.getByRole("link", {
      name: "Agentic Support Console",
    });
    await expect(exampleCard).toBeVisible();
    const card = exampleCard.locator(
      "xpath=ancestor::div[contains(@class, 'rounded-xl')]",
    );
    await expect(card.getByRole("checkbox")).toBeHidden();
  });
});

test.describe("resources page selection and copy", () => {
  test("select all, remove one, copy markdown, then deselect all", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/resources");

    await page.getByRole("checkbox", { name: "Select all" }).check();
    await expect(page.getByText(/\d+ selected:/)).toBeVisible();

    const firstChip = page
      .getByText(/selected:/)
      .locator("..")
      .getByRole("button")
      .first();
    await firstChip.click();

    const trigger = page.getByRole("button", { name: "Copy as" });
    await expect(trigger).toBeEnabled();
    await trigger.click();
    const menuItem = page.getByRole("menuitem", { name: "Copy Markdown" });
    await menuItem.waitFor({ state: "visible" });
    await menuItem.click();
    await expect(page.getByText("Markdown copied")).toBeVisible({
      timeout: 5000,
    });

    const copied = await getCopiedText(page);
    expect(copied.length).toBeGreaterThan(0);

    const selectAll = page.getByRole("checkbox", { name: "Select all" });
    await selectAll.click();
    await selectAll.click();
    await expect(page.getByText(/\d+ selected:/)).toBeHidden();
  });
});
