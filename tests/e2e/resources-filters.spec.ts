import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectDevHubImageToUseNextOptimizer } from "./image-assertions";

function templateLinks(page: Page) {
  return page.locator('#templates-list a[href^="/templates/"]');
}

function templateTextLink(page: Page, href: string) {
  return page.locator(`#templates-list a[href="${href}"]`).filter({
    hasText: /.+/,
  });
}

async function visibleCount(locator: Locator): Promise<number> {
  return locator.evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      }).length,
  );
}

test.describe("templates page search", () => {
  test("renders cover images for all visible template cards", async ({
    page,
  }) => {
    await page.goto("/templates");

    const cards = page.locator("#templates-list article");
    const coverImages = page
      .locator('#templates-list img[alt$=" preview"]')
      .filter({ visible: true });
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(6);
    await expect(coverImages).toHaveCount(cardCount);
    await expectDevHubImageToUseNextOptimizer(
      coverImages.first(),
      "/img/guides/ai-chat-app-preview-light.png",
    );
  });

  test("search bar filters results and clearing restores all", async ({
    page,
  }) => {
    await page.goto("/templates");
    const initialCount = await visibleCount(templateLinks(page));
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole("searchbox").fill("genie");
    await expect(
      templateTextLink(page, "/templates/inventory-intelligence"),
    ).toBeVisible();
    const filteredCount = await visibleCount(templateLinks(page));
    expect(filteredCount).toBe(7);
    expect(filteredCount).toBeLessThan(initialCount);
    // agentic-support-console matches "genie" but is unlisted, so it must stay
    // hidden from the listing even when the search would otherwise surface it.
    await expect(
      page.locator('a[href="/templates/agentic-support-console"]'),
    ).toBeHidden();
    await expect(
      templateTextLink(page, "/templates/saas-tracker"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/content-moderator"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/vacation-rentals"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/genie-analytics-app"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/genie-conversational-analytics"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/genie-multi-space"),
    ).toBeVisible();

    await page.getByRole("searchbox").fill("");
    expect(await visibleCount(templateLinks(page))).toBe(initialCount);
  });

  test("search matches terms that only appear in tags or services", async ({
    page,
  }) => {
    await page.goto("/templates");
    expect(await visibleCount(templateLinks(page))).toBeGreaterThan(0);

    await page.getByRole("searchbox").fill("postgres");
    await expect(
      templateTextLink(page, "/templates/lakebase-pgvector"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/lakebase-token-management"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/genie-conversational-analytics"),
    ).toBeHidden();

    await page.getByRole("searchbox").fill("appkit");
    await expect(
      templateTextLink(page, "/templates/spin-up-databricks-app"),
    ).toBeVisible();
  });
});

test.describe("templates page service filter", () => {
  test("checking a service narrows results", async ({ page }) => {
    await page.goto("/templates");
    const initialCount = await visibleCount(templateLinks(page));
    expect(initialCount).toBeGreaterThan(0);

    await page
      .getByRole("checkbox", { name: "Lakebase Postgres", exact: true })
      .check();

    const filteredCount = await visibleCount(templateLinks(page));
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).not.toBe(initialCount);

    await expect(
      templateTextLink(page, "/templates/lakebase-off-platform"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/foundation-models-api"),
    ).toBeHidden();
  });

  test("checking a service after scrolling returns to the top of the list", async ({
    page,
  }) => {
    await page.goto("/templates");
    await expect(page.locator("#templates-list article").first()).toBeVisible();

    const listTop = await page.locator("#templates-list").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(listTop + 200);

    await page
      .getByRole("checkbox", { name: "Unity Gateway", exact: true })
      .check();

    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeLessThanOrEqual(listTop + 8);
  });

  test("clear all resets selected service filters", async ({ page }) => {
    await page.goto("/templates");
    const initialCount = await visibleCount(templateLinks(page));
    expect(initialCount).toBeGreaterThan(0);

    const appsFilter = page.getByRole("checkbox", {
      name: "Databricks Apps",
      exact: true,
    });
    const lakebaseFilter = page.getByRole("checkbox", {
      name: "Lakebase Postgres",
      exact: true,
    });

    await appsFilter.check();
    await lakebaseFilter.check();

    await expect(page.getByText("2 FILTERS selected")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();

    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(appsFilter).not.toBeChecked();
    await expect(lakebaseFilter).not.toBeChecked();
    await expect(page.getByText("2 FILTERS selected")).toBeHidden();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeHidden();
    expect(await visibleCount(templateLinks(page))).toBe(initialCount);
  });

  test("selecting multiple services narrows results (AND)", async ({
    page,
  }) => {
    await page.goto("/templates");
    expect(await visibleCount(templateLinks(page))).toBeGreaterThan(0);

    await page
      .getByRole("checkbox", { name: "Databricks Apps", exact: true })
      .check();
    const firstCount = await visibleCount(templateLinks(page));

    await page
      .getByRole("checkbox", { name: "Lakebase Postgres", exact: true })
      .check();
    const secondCount = await visibleCount(templateLinks(page));

    expect(secondCount).toBeLessThan(firstCount);
    expect(secondCount).toBeGreaterThan(0);

    await expect(
      templateTextLink(page, "/templates/lakebase-data-persistence"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/lakebase-pgvector"),
    ).toBeHidden();
  });
});

test.describe("templates page empty state", () => {
  test("empty state reset clears search and service filters", async ({
    page,
  }) => {
    await page.goto("/templates");

    await page.getByRole("searchbox").fill("not-a-real-template");
    await page
      .getByRole("checkbox", { name: "Lakebase Postgres", exact: true })
      .check();
    await expect(
      page.getByText("No templates match your filters."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear filters" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page.getByRole("searchbox")).toHaveValue("");
    expect(await visibleCount(templateLinks(page))).toBeGreaterThan(0);
    await expect(
      page.getByRole("button", { name: "Clear filters" }),
    ).toBeHidden();
  });
});

test.describe("templates page Build-with Replit filter", () => {
  test("checking 'Replit' narrows the grid to templates with a replit prompt", async ({
    page,
  }) => {
    await page.goto("/templates");
    const initialCount = await visibleCount(templateLinks(page));
    expect(initialCount).toBeGreaterThan(0);

    const replitFilter = page.getByRole("checkbox", {
      name: "Replit",
      exact: true,
    });
    await replitFilter.check();
    const filteredCount = await visibleCount(templateLinks(page));
    expect(filteredCount).toBeGreaterThan(0);
    await expect(replitFilter).toHaveCSS(
      "background-color",
      "rgb(255, 95, 70)",
    );
    await expect(replitFilter).toHaveCSS("border-color", "rgb(255, 95, 70)");

    // saas-tracker ships a replit-prompt.md, so it should still be visible.
    await expect(
      templateTextLink(page, "/templates/saas-tracker"),
    ).toBeVisible();
    // set-up-your-local-dev-environment does NOT ship one, so it should hide.
    await expect(
      templateTextLink(page, "/templates/set-up-your-local-dev-environment"),
    ).toBeHidden();

    await expect(page.getByRole("button", { name: /^Replit$/ })).toBeHidden();
    await expect(page.getByText("1 FILTER selected")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();

    await page.getByRole("searchbox").fill("genie");
    expect(await visibleCount(templateLinks(page))).toBe(7);
    await expect(
      templateTextLink(page, "/templates/genie-analytics-app"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/inventory-intelligence"),
    ).toBeVisible();
    await expect(
      templateTextLink(page, "/templates/operational-data-analytics"),
    ).toBeHidden();

    await page.getByRole("searchbox").fill("");
    await replitFilter.uncheck();
    expect(await visibleCount(templateLinks(page))).toBe(initialCount);
  });

  test("Build-with Replit filter clears when unchecked", async ({ page }) => {
    await page.goto("/templates");
    const initialCount = await visibleCount(templateLinks(page));
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole("checkbox", { name: "Replit", exact: true }).check();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();

    await page.getByRole("checkbox", { name: "Replit", exact: true }).uncheck();
    await expect(page.getByRole("button", { name: "Clear all" })).toBeHidden();
    expect(await visibleCount(templateLinks(page))).toBe(initialCount);
  });
});
