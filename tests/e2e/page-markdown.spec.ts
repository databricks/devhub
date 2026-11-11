import { expect, test } from "@playwright/test";

import { HEADER_LINKS, isExternalHref } from "../../src/lib/header-navigation";

const NAV_MENU_PATHS = HEADER_LINKS.filter((item) =>
  ["Product", "Resources"].includes(item.label),
)
  .flatMap((item) => item.links ?? [])
  .map((link) => link.href)
  .filter((href) => !isExternalHref(href));

test("the Product and Resources menus link to internal pages", () => {
  expect(NAV_MENU_PATHS.length).toBeGreaterThan(0);
});

for (const path of NAV_MENU_PATHS) {
  test(`${path}.md serves the page H1 as Markdown`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const heading = (await page.locator("main h1").first().textContent())
      ?.replace(/\s+/g, " ")
      .trim();
    expect(heading).toBeTruthy();
    await expect(
      page.locator('link[rel="alternate"][type="text/markdown"]'),
    ).toHaveAttribute("href", new RegExp(`${path}\\.md$`));

    const response = await request.get(`${path}.md`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/markdown");
    const markdown = await response.text();
    expect(markdown.startsWith(`# ${heading}\n`)).toBe(true);
    expect(markdown).not.toMatch(/\]\(\/(?!\/)/);

    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).toContain(`${path}.md)`);
  });
}

test("Accept: text/markdown on a product page returns its Markdown", async ({
  request,
}) => {
  const response = await request.get("/product/lakebase", {
    headers: { Accept: "text/markdown" },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/markdown");
  expect(await response.text()).toMatch(/^# Lakebase\. /);
});
