import { expect, test } from "@playwright/test";

import { filterDirectory } from "../../src/lib/community/directory";
import { readDirectoryQuery } from "../../src/lib/community/directory-query";
import { getMvpDirectory } from "../../src/lib/community/mvps";

const mvpMembers = getMvpDirectory();

test("/mvps renders its program content on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/mvps");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Databricks MVPs/i,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/mvps$/,
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("Student Fellows pages remain unpublished", async ({ page }) => {
  for (const path of [
    "/student-fellows",
    "/student-fellows/fellows",
    "/student-fellows/fellows/example-fellow",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(
      page.getByRole("heading", { name: /page not found/i }),
    ).toBeVisible();
  }
});

test.describe("community directory integration", () => {
  test("an empty search has a clear result state", async ({ page }) => {
    await page.goto("/mvps/directory?q=does-not-match-any-person-01a07c3d");
    await expect(
      page.getByRole("heading", { name: "No matches found" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Clear filters", exact: true })
      .click();
    await expect(page).toHaveURL("/mvps/directory");
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(
      page
        .getByRole("region", { name: "MVP directory" })
        .getByRole("heading", { level: 2 })
        .first(),
    ).toBeVisible();
  });

  test("MVP directory renders the verified static records", async ({
    page,
  }) => {
    const result = filterDirectory(mvpMembers, readDirectoryQuery({}, "mvp"));
    expect(result.items.length).toBeGreaterThan(0);
    await page.goto("/mvps/directory");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const directory = page.getByRole("region", {
      name: "MVP directory",
      exact: true,
    });
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      result.items.map((person) => person.name),
    );
    await expect(
      directory.getByRole("status", { name: "Directory results" }),
    ).toHaveText(`${result.total} MVPs`);
  });

  for (const { kind, route, region } of [
    { kind: "mvp", route: "/mvps/directory", region: "MVP directory" },
  ] as const) {
    test(`${kind} page URLs render the requested records without JavaScript`, async ({
      browser,
      request,
      baseURL,
    }) => {
      const source = filterDirectory(mvpMembers, {
        ...readDirectoryQuery({}, kind),
        page: 2,
      });
      const context = await browser.newContext({
        javaScriptEnabled: false,
        baseURL,
      });
      try {
        const page = await context.newPage();
        const response = await page.goto(`${route}/page/2`);
        expect(response?.status()).toBe(200);
        await expect(
          page
            .getByRole("region", { name: region, exact: true })
            .getByRole("heading", { level: 2 }),
        ).toHaveText(source.items.map((person) => person.name));
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          new RegExp(`${route}/page/2$`),
        );
        await expect(page).toHaveTitle(/Page 2/);
        await expect(
          page.getByRole("link", { name: "Page 2", exact: true }),
        ).toHaveAttribute("aria-current", "page");
        for (const segment of ["0", "abc", String(source.totalPages + 1)]) {
          const invalid = await request.get(`${route}/page/${segment}`);
          expect(invalid.status(), segment).toBe(404);
        }
        const first = await request.get(`${route}/page/1?country=Brazil`, {
          maxRedirects: 0,
        });
        expect(first.status()).toBe(308);
        expect(new URL(first.headers().location, baseURL).pathname).toBe(route);
        expect(first.headers().location).toContain("country=Brazil");
        const filtered = await request.get(`${route}/page/2?q=data`);
        expect(filtered.headers()["x-robots-tag"]).toBe("noindex, follow");
        const backToProgram = page.getByRole("link", {
          name: "Back to program",
          exact: true,
        });
        await expect(backToProgram).toHaveAttribute("href", "/mvps");
        await backToProgram.click();
        await expect(page).toHaveURL("/mvps");
      } finally {
        await context.close();
      }
    });

    test(`${kind} filters reset pagination`, async ({ page }) => {
      const items = mvpMembers;
      const person =
        items.find((item) => item.country && item.city) ||
        items.find((item) => item.country);
      if (!person) throw new Error("Missing source filter fixture");
      const filters: Record<string, string> = { country: person.country };
      if (person.city) filters.city = person.city;
      const expected = filterDirectory(
        mvpMembers,
        readDirectoryQuery(filters, kind),
      );
      expect(expected.items.length).toBeGreaterThan(0);
      await page.goto(`${route}/page/2`);
      const directory = page.getByRole("region", { name: region, exact: true });
      await directory
        .getByRole("button", { name: "Country", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: person.country, exact: true })
        .click();
      await page.keyboard.press("Escape");
      const secondFilter = directory.getByRole("button", {
        name: "City",
        exact: true,
      });
      if (person.city) {
        await secondFilter.click();
        await page
          .getByRole("checkbox", { name: person.city, exact: true })
          .click();
        await page.keyboard.press("Escape");
      }
      const url = new URL(page.url());
      expect(url.pathname).toBe(route);
      expect(Object.fromEntries(url.searchParams)).toEqual(filters);
      await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
        expected.items.map((item) => item.name),
      );
      await expect(
        directory.getByRole("status", { name: "Directory results" }),
      ).toHaveText(`${expected.total} MVPs`);
    });
  }

  test("unknown MVP pages render one website not-found shell", async ({
    page,
  }) => {
    for (const path of [
      "/mvps/directory/page/0",
      "/mvps/directory/page/100000",
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: /page not found/i }),
      ).toBeVisible();
      await expect(
        page.locator('header a[aria-label="Databricks Developer home"]'),
      ).toHaveCount(1);
    }
  });

  test("MVP cards expose every additional source link with keyboard access", async ({
    page,
  }) => {
    const items = mvpMembers;
    const person = items.find((item) => item.additionalLinks.length >= 2);
    expect(
      person,
      "The official snapshot includes profiles with multiple additional links",
    ).toBeDefined();
    if (!person) throw new Error("Missing additional links source fixture");
    await page.goto(`/mvps/directory?q=${encodeURIComponent(person.name)}`);
    const trigger = page.getByRole("button", {
      name: `More links for ${person.name}`,
      exact: true,
    });
    await trigger.focus();
    await trigger.press("Enter");
    const menu = page.getByRole("menu");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page
        .getByRole("navigation", {
          name: `Additional links for ${person.name}`,
        })
        .getByRole("menu"),
    ).toBeVisible();
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: person.name, exact: true }),
    });
    for (const url of new Set(
      [
        ...Object.values(person.links),
        ...person.additionalLinks.map((link) => link.url),
      ].filter(Boolean),
    )) {
      const item = card
        .locator(`a[href=${JSON.stringify(url)}]:visible`)
        .last();
      await expect(item).toBeVisible();
      await expect(item).toHaveAttribute("target", "_blank");
      await expect(item).toHaveAttribute("rel", "noopener noreferrer");
    }
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();

    const additionalOnly = items.find(
      (item) =>
        item.additionalLinks.length && !Object.values(item.links).some(Boolean),
    );
    expect(
      additionalOnly,
      "The official snapshot includes an MVP whose only destination is YouTube",
    ).toBeDefined();
    if (!additionalOnly)
      throw new Error("Missing additional-only source fixture");
    await page.goto(
      `/mvps/directory?q=${encodeURIComponent(additionalOnly.name)}`,
    );
    await expect(
      page.getByRole("link", { name: new RegExp(additionalOnly.name) }).first(),
    ).toHaveAttribute("href", additionalOnly.additionalLinks[0].url);
  });
});
