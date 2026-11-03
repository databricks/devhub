import { expect, test, type Locator } from "@playwright/test";

const DEEP_API_PAGE = "/docs/appkit/v0/api/appkit/Class.ConfigurationError";
const DEEP_UI_PAGE = "/docs/appkit/v0/api/appkit-ui/ui/Button";

async function readSidebarLayout(viewport: Locator) {
  return viewport.evaluate((element) => {
    const active = element.querySelector('a[aria-current="page"]');
    if (!active) {
      throw new Error("Expected an active sidebar link");
    }

    const row = active.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();

    return {
      centerDistance: Math.abs(
        row.top +
          row.height / 2 -
          (bounds.top + element.clientTop + element.clientHeight / 2),
      ),
      documentScrollTop: window.scrollY,
      maxScrollTop: element.scrollHeight - element.clientHeight,
      rowBottom: row.bottom,
      rowTop: row.top,
      scrollTop: element.scrollTop,
      viewportBottom: bounds.bottom,
      viewportTop: bounds.top,
    };
  });
}

test.describe("docs sidebar active position", () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  for (const { path, depth } of [
    { path: "/docs/tools/databricks-cli", depth: 1 },
    { path: "/docs/appkit/v0", depth: 2 },
    { path: "/docs/appkit/v0/plugins", depth: 3 },
    { path: "/docs/appkit/v0/api/appkit-ui", depth: 4 },
    { path: DEEP_API_PAGE, depth: 5 },
    { path: DEEP_UI_PAGE, depth: 6 },
  ]) {
    test(`active indicator overlaps the rail at depth ${depth}`, async ({
      page,
    }) => {
      await page.goto(path);

      const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
      await expect(sidebar.locator('a[aria-current="page"]')).toHaveCount(1);
      const layout = await sidebar.evaluate((element) => {
        const active = element.querySelector('a[aria-current="page"]')!;
        const lists = [...element.querySelectorAll("ul")].filter((list) =>
          list.contains(active),
        );
        const rail = lists.find(
          (list) => parseFloat(getComputedStyle(list).borderLeftWidth) > 0,
        )!;
        const marker = element.querySelector(
          '[data-slot="docs-sidebar-active-indicator"]',
        )!;

        return {
          depth: lists.length - 1,
          markerLeft: marker.getBoundingClientRect().left,
          markerWidth: marker.getBoundingClientRect().width,
          railLeft: rail.getBoundingClientRect().left,
          railWidth: parseFloat(getComputedStyle(rail).borderLeftWidth),
        };
      });

      expect(layout.depth).toBe(depth);
      expect(layout.markerLeft).toBeCloseTo(layout.railLeft, 5);
      expect(layout.markerWidth).toBe(layout.railWidth);
    });
  }

  test("centers a deep active row on direct load and reload", async ({
    page,
  }) => {
    await page.goto(DEEP_API_PAGE);
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });

    for (let attempt = 0; attempt < 2; attempt++) {
      await expect
        .poll(async () => (await readSidebarLayout(sidebar)).centerDistance)
        .toBeLessThanOrEqual(1);
      const layout = await readSidebarLayout(sidebar);
      expect(layout.scrollTop).toBeGreaterThan(0);
      expect(layout.documentScrollTop).toBe(0);
      expect(layout.rowTop).toBeGreaterThanOrEqual(layout.viewportTop);
      expect(layout.rowBottom).toBeLessThanOrEqual(layout.viewportBottom);

      if (attempt === 0) {
        await sidebar.evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.reload();
      }
    }
  });

  test("centers a newly opened route branch without scrolling the document", async ({
    page,
  }) => {
    await page.goto(DEEP_API_PAGE);
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await expect
      .poll(async () => (await readSidebarLayout(sidebar)).centerDistance)
      .toBeLessThanOrEqual(1);
    await expect(sidebar.locator(`a[href="${DEEP_UI_PAGE}"]`)).toHaveCount(0);

    const documentScrollTop = await page.evaluate((path) => {
      window.scrollTo(0, 400);
      history.pushState(null, "", path);
      return window.scrollY;
    }, DEEP_UI_PAGE);
    expect(documentScrollTop).toBe(400);

    await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      DEEP_UI_PAGE,
    );
    await expect
      .poll(async () => (await readSidebarLayout(sidebar)).centerDistance)
      .toBeLessThanOrEqual(1);
    expect((await readSidebarLayout(sidebar)).documentScrollTop).toBe(
      documentScrollTop,
    );
  });

  test("leaves manual sidebar scrolling alone after centering", async ({
    page,
  }) => {
    await page.goto(DEEP_API_PAGE);
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await expect
      .poll(async () => (await readSidebarLayout(sidebar)).centerDistance)
      .toBeLessThanOrEqual(1);
    await sidebar.evaluate((element) => {
      element.scrollTop = 0;
    });
    await page.setViewportSize({ width: 1600, height: 800 });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect
      .poll(async () => (await readSidebarLayout(sidebar)).scrollTop)
      .toBe(0);
    expect((await readSidebarLayout(sidebar)).documentScrollTop).toBe(0);
  });

  for (const edge of ["first", "last"] as const) {
    test(`clamps the ${edge} row to the scrollable edge`, async ({ page }) => {
      await page.setViewportSize({ width: 1600, height: 600 });
      await page.goto(
        edge === "first" ? "/docs/start-here" : "/docs/lakehouse/pipelines",
      );
      const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
      await expect
        .poll(async () => {
          const layout = await readSidebarLayout(sidebar);
          return Math.abs(
            layout.scrollTop - (edge === "first" ? 0 : layout.maxScrollTop),
          );
        })
        .toBeLessThanOrEqual(1);
      const layout = await readSidebarLayout(sidebar);
      expect(layout.rowTop).toBeGreaterThanOrEqual(layout.viewportTop);
      expect(layout.rowBottom).toBeLessThanOrEqual(layout.viewportBottom);
      expect(layout.documentScrollTop).toBe(0);
    });
  }

  test("centers the active row whenever the mobile docs drawer opens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(DEEP_UI_PAGE);
    const trigger = page.getByRole("button", {
      name: "Documentation",
      exact: true,
    });
    const viewport = page.locator('[data-slot="docs-sidebar-viewport"]');

    await trigger.click();
    await expect
      .poll(async () => (await readSidebarLayout(viewport)).centerDistance)
      .toBeLessThanOrEqual(1);
    expect((await readSidebarLayout(viewport)).documentScrollTop).toBe(0);
    await viewport.evaluate((element) => {
      element.scrollTop = 0;
    });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await trigger.click();
    await expect
      .poll(async () => (await readSidebarLayout(viewport)).centerDistance)
      .toBeLessThanOrEqual(1);
    expect((await readSidebarLayout(viewport)).documentScrollTop).toBe(0);
  });
});
