import { test, expect } from "@playwright/test";
import {
  examples,
  recipesInOrder,
  cookbooks,
} from "../../src/lib/recipes/recipes";

const RESOURCE_COUNT =
  examples.length + cookbooks.length + recipesInOrder.length;
const TOTAL_RESOURCES = `${RESOURCE_COUNT} of ${RESOURCE_COUNT} templates`;

test.describe("resources page search", () => {
  test("search bar filters results and clearing restores all", async ({
    page,
  }) => {
    await page.goto("/templates");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();

    await page.getByRole("searchbox").fill("genie");
    await expect(
      page.getByText(`7 of ${RESOURCE_COUNT} templates`),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/inventory-intelligence"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/agentic-support-console"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/saas-tracker"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/content-moderator"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/genie-analytics-app"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/genie-conversational-analytics"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/genie-multi-space"]'),
    ).toBeVisible();

    await page.getByRole("searchbox").fill("");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();
  });
});

test.describe("resources page service filter", () => {
  test("checking a service narrows results and shows active pill", async ({
    page,
  }) => {
    await page.goto("/templates");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();

    await page.getByRole("checkbox", { name: "Lakebase", exact: true }).check();

    const count = page.getByText(
      new RegExp(`^\\d+ of ${RESOURCE_COUNT} templates$`),
    );
    await expect(count).not.toHaveText(TOTAL_RESOURCES);

    await expect(
      page.locator('a[href="/templates/lakebase-off-platform"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/query-ai-gateway-endpoints"]'),
    ).toBeHidden();
  });
});

test.describe("resources page resource type filter", () => {
  test("Examples filter shows only examples, Cookbooks filter hides examples", async ({
    page,
  }) => {
    await page.goto("/templates");

    await page.getByRole("checkbox", { name: "Examples" }).check();
    await expect(
      page.locator('a[href="/templates/agentic-support-console"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/hello-world-app"]'),
    ).toBeHidden();

    await page.getByRole("checkbox", { name: "Examples" }).uncheck();
    await page.getByRole("checkbox", { name: "Cookbooks" }).check();
    await expect(
      page.locator('a[href="/templates/databricks-local-bootstrap"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/templates/agentic-support-console"]'),
    ).toBeHidden();
  });
});

test.describe("resources page clear all filters", () => {
  test("clear all resets search, service filter, and tag filters", async ({
    page,
  }) => {
    await page.goto("/templates");

    await page.getByRole("searchbox").fill("lakebase");
    await page.getByRole("checkbox", { name: "Lakebase", exact: true }).check();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();

    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(page.getByText(TOTAL_RESOURCES)).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeHidden();
  });
});
