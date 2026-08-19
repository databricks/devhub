import { expect, test, type Locator } from "@playwright/test";

import { loadAgentPromptParts } from "../../src/lib/agent-content-markdown";
import { composeAgentPrompt } from "../../src/lib/copy-preamble";
import { expectDevHubImageToUseNextOptimizer } from "./image-assertions";

// Reproduce what `/api/bootstrap-prompt` returns for the hero "Copy prompt"
// button: the full agent-prompt composer with kind="hero". We mock the API
// response with this string so the e2e test asserts the composed output
// shape rather than depending on a running dev server.
const BOOTSTRAP_PROMPT_MARKDOWN = composeAgentPrompt({
  parts: loadAgentPromptParts(),
  kind: "hero",
  siteOrigin: "https://developers.databricks.com",
});

async function getTemplateCardTextMetrics(templateLink: Locator) {
  return templateLink.evaluate((link) => {
    const card = link.parentElement;
    const description =
      card?.querySelector('p[aria-hidden="false"]') ?? card?.querySelector("p");

    if (!card || !description) {
      throw new Error("Expected home template slider card to be measurable");
    }

    const cardBox = card.getBoundingClientRect();
    const descriptionBox = description.getBoundingClientRect();

    return {
      cardLeft: cardBox.left,
      cardRight: cardBox.right,
      cardWidth: cardBox.width,
      descriptionLeft: descriptionBox.left,
      descriptionRight: descriptionBox.right,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
}

function expectTemplateCardDescriptionToFit(
  sliderMetrics: Awaited<ReturnType<typeof getTemplateCardTextMetrics>>,
) {
  expect(sliderMetrics.documentWidth).toBe(sliderMetrics.viewportWidth);
  expect(Math.round(sliderMetrics.descriptionLeft)).toBeGreaterThanOrEqual(
    Math.round(sliderMetrics.cardLeft),
  );
  expect(Math.round(sliderMetrics.descriptionRight)).toBeLessThanOrEqual(
    Math.round(sliderMetrics.cardRight) + 1,
  );
}

test.describe("navbar navigation", () => {
  const NAVBAR_LINKS = [
    { label: "Solutions", expectedPath: "/solutions" },
    { label: "Templates", expectedPath: "/templates" },
    { label: "Docs", expectedPath: "/docs/start-here" },
  ];

  for (const { label, expectedPath } of NAVBAR_LINKS) {
    test(`navbar "${label}" navigates to ${expectedPath}`, async ({ page }) => {
      await page.goto("/");
      await page.locator(`header nav a[href="${expectedPath}"]`).click();
      await page.waitForURL(`**${expectedPath}`);
      expect(new URL(page.url()).pathname).toBe(expectedPath);
    });
  }

  test("product dropdown hover state is visible in production CSS", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/product/lakebase");

    await page.getByRole("button", { name: "[Product]" }).hover();
    const productMenu = page.locator('[data-slot="navigation-menu-content"]');
    await expect(productMenu).toBeVisible();

    const activeLink = productMenu.getByRole("link", {
      name: "Lakebase",
      exact: true,
    });
    const hoverLink = productMenu.getByRole("link", {
      name: "Agent Bricks",
      exact: true,
    });

    await expect(activeLink).toHaveAttribute("aria-current", "page");
    await expect(activeLink).toHaveCSS("color", "rgb(28, 29, 34)");
    await expect(
      productMenu.locator("[data-product-dropdown-frame]"),
    ).toHaveAttribute("viewBox", "0 0 178 114");

    const highlight = productMenu.locator("[data-product-dropdown-highlight]");
    const thumb = productMenu.locator("[data-product-dropdown-thumb]");
    const dotColumn = productMenu
      .locator("[data-product-dropdown-dot-column]")
      .first();
    const initialHighlightBox = await highlight.boundingBox();
    const initialThumbBox = await thumb.boundingBox();
    const dotColumnBox = await dotColumn.boundingBox();

    if (!initialHighlightBox || !initialThumbBox || !dotColumnBox) {
      throw new Error("Expected product dropdown controls to be measurable");
    }

    expect(Math.round(dotColumnBox.y - initialThumbBox.y)).toBe(0);
    expect(Math.round(dotColumnBox.height)).toBeGreaterThan(
      Math.round(initialThumbBox.height),
    );

    const motionStyles = await productMenu.evaluate((menu) => {
      const getRequiredElement = (selector: string) => {
        const element = menu.querySelector(selector);

        if (!element) {
          throw new Error(`Expected ${selector} to exist`);
        }

        return getComputedStyle(element);
      };

      return {
        contentAnimationName: getComputedStyle(menu).animationName,
        contentTransitionProperty: getComputedStyle(menu).transitionProperty,
        highlightTransitionDuration: getRequiredElement(
          "[data-product-dropdown-highlight]",
        ).transitionDuration,
        linkTransitionProperty: getRequiredElement("a").transitionProperty,
        thumbTransitionDuration: getRequiredElement(
          "[data-product-dropdown-thumb]",
        ).transitionDuration,
      };
    });

    expect(motionStyles.contentAnimationName).toBe("none");
    expect(motionStyles.contentTransitionProperty).toBe("none");
    expect(motionStyles.highlightTransitionDuration).toBe("0s");
    expect(motionStyles.linkTransitionProperty).toBe("none");
    expect(motionStyles.thumbTransitionDuration).toBe("0s");

    await hoverLink.hover();
    await expect(hoverLink).toHaveCSS("color", "rgb(28, 29, 34)");
    await expect
      .poll(async () => {
        const box = await highlight.boundingBox();

        return Math.round((box?.y ?? 0) - initialHighlightBox.y);
      })
      .toBe(24);
    await expect
      .poll(async () => {
        const box = await thumb.boundingBox();

        return Math.round((box?.y ?? 0) - initialThumbBox.y);
      })
      .toBe(16);
  });
});

test.describe("mobile navigation", () => {
  for (const viewport of [
    {
      width: 360,
      height: 640,
      highlightWidth: 240,
      sectionClickWidth: 279,
      sectionX: 61,
    },
    {
      width: 768,
      height: 732,
      highlightWidth: 648,
      sectionClickWidth: 683,
      sectionX: 63,
    },
  ]) {
    test(`mobile menu uses terminal tree layout at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/product/lakebase");

      await page.getByRole("button", { name: "Open menu" }).click();

      const header = page.getByRole("banner");
      const menu = page.getByRole("dialog", { name: "Main navigation" });
      const home = menu.locator("[data-mobile-menu-home]");
      const productLabel = menu.locator("[data-mobile-menu-product-label]");
      const lakebase = menu.getByRole("link", { name: "lakebase" });
      const lakebaseLabel = lakebase.locator("[data-mobile-menu-item-label]");
      const solutions = menu.getByRole("link", { name: "solutions" });
      const templates = menu.getByRole("link", { name: "templates" });
      const docs = menu.getByRole("link", { name: "docs" });

      await expect(
        page.getByRole("button", { name: "Close menu" }),
      ).toBeVisible();
      await expect(header).toHaveCSS("background-color", "rgb(199, 201, 209)");
      await expect(menu).toHaveCSS("background-color", "rgb(28, 29, 34)");
      await expect(productLabel).toHaveCSS("opacity", "0.6");
      await expect(lakebase).toHaveAttribute("aria-current", "page");
      await expect(lakebaseLabel).toHaveCSS(
        "background-color",
        "rgb(199, 201, 209)",
      );
      await expect(lakebase).toHaveCSS("color", "rgb(28, 29, 34)");

      const headerBox = await header.boundingBox();
      const menuBox = await menu.boundingBox();
      const homeBox = await home.boundingBox();
      const productLabelBox = await productLabel.boundingBox();
      const lakebaseBox = await lakebase.boundingBox();
      const solutionsBox = await solutions.boundingBox();
      const templatesBox = await templates.boundingBox();
      const docsBox = await docs.boundingBox();

      if (
        !headerBox ||
        !menuBox ||
        !homeBox ||
        !productLabelBox ||
        !lakebaseBox ||
        !solutionsBox ||
        !templatesBox ||
        !docsBox
      ) {
        throw new Error("Expected mobile menu layout to be measurable");
      }

      // Announcement banners (e.g. the hackathon banner) render above the
      // header and shift the whole menu down, so measure from the header's top.
      const offsetY = Math.round(headerBox.y);

      expect(Math.round(menuBox.x)).toBe(0);
      expect(Math.round(menuBox.y)).toBe(offsetY + 56);
      expect(Math.round(menuBox.width)).toBe(viewport.width);
      expect(Math.round(homeBox.x)).toBe(20);
      expect(Math.round(homeBox.y)).toBe(offsetY + 70);
      expect(Math.round(productLabelBox.x)).toBe(61);
      expect(Math.round(productLabelBox.y)).toBe(offsetY + 102);
      expect(Math.round(lakebaseBox.x)).toBe(100);
      expect(Math.round(lakebaseBox.y)).toBe(offsetY + 132);
      expect(Math.round(lakebaseBox.width)).toBe(viewport.highlightWidth);
      expect(Math.round(solutionsBox.x)).toBe(viewport.sectionX);
      expect(Math.round(solutionsBox.y)).toBe(offsetY + 270);
      expect(Math.round(solutionsBox.width)).toBe(viewport.sectionClickWidth);
      expect(Math.round(templatesBox.x)).toBe(viewport.sectionX);
      expect(Math.round(templatesBox.y)).toBe(offsetY + 304);
      expect(Math.round(templatesBox.width)).toBe(viewport.sectionClickWidth);
      expect(Math.round(docsBox.x)).toBe(viewport.sectionX);
      expect(Math.round(docsBox.y)).toBe(offsetY + 338);
      expect(Math.round(docsBox.width)).toBe(viewport.sectionClickWidth);
    });
  }

  test("mobile menu highlights home and not product links on the homepage", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 732 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();

    const menu = page.getByRole("dialog", { name: "Main navigation" });
    const home = menu.getByRole("link", { name: "~/HOME" });
    const homeLabel = home.locator("[data-mobile-menu-item-label]");
    const lakebase = menu.getByRole("link", { name: "lakebase" });
    const lakebaseLabel = lakebase.locator("[data-mobile-menu-item-label]");
    const productLinks = menu.locator("[data-mobile-menu-product-link]");

    await expect(home).toHaveAttribute("aria-current", "page");
    await expect(homeLabel).toHaveCSS("background-color", "rgb(199, 201, 209)");
    await expect(home).toHaveCSS("color", "rgb(28, 29, 34)");

    const homeBox = await home.boundingBox();
    const homeLabelBox = await homeLabel.boundingBox();

    if (!homeBox || !homeLabelBox) {
      throw new Error("Expected mobile home link layout to be measurable");
    }

    expect(Math.round(homeLabelBox.width)).toBe(Math.round(homeBox.width));

    await expect(lakebase).not.toHaveAttribute("aria-current", "page");
    await expect(lakebaseLabel).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await expect(lakebase).toHaveCSS("color", "rgb(199, 201, 209)");

    await expect(productLinks).toHaveCount(4);
    for (const productLink of await productLinks.all()) {
      await expect(productLink).not.toHaveAttribute("aria-current", "page");
    }
  });

  for (const section of [
    { href: "/solutions", label: "solutions" },
    { href: "/templates", label: "templates" },
    { href: "/docs/start-here", label: "docs" },
  ]) {
    test(`mobile menu highlights ${section.label} on its section page`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 732 });
      await page.goto(section.href);

      await page.getByRole("button", { name: "Open menu" }).click();

      const menu = page.getByRole("dialog", { name: "Main navigation" });
      const sectionLink = menu.getByRole("link", { name: section.label });
      const sectionLabel = sectionLink.locator("[data-mobile-menu-item-label]");
      const home = menu.getByRole("link", { name: "~/HOME" });
      const homeLabel = home.locator("[data-mobile-menu-item-label]");
      const productLinks = menu.locator("[data-mobile-menu-product-link]");

      await expect(sectionLink).toHaveAttribute("aria-current", "page");
      await expect(sectionLabel).toHaveCSS(
        "background-color",
        "rgb(199, 201, 209)",
      );
      await expect(sectionLink).toHaveCSS("color", "rgb(28, 29, 34)");
      await expect(homeLabel).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

      const sectionBox = await sectionLink.boundingBox();
      const sectionLabelBox = await sectionLabel.boundingBox();

      if (!sectionBox || !sectionLabelBox) {
        throw new Error("Expected mobile section link layout to be measurable");
      }

      expect(Math.round(sectionLabelBox.width)).toBe(
        Math.round(sectionBox.width),
      );

      for (const productLink of await productLinks.all()) {
        await expect(productLink).not.toHaveAttribute("aria-current", "page");
      }
    });
  }
});

test.describe("current mobile navigation", () => {
  test("uses the production hamburger menu with search inside the drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Search documentation" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Open menu" }).click();

    const header = page.locator("header").first();
    const mainContent = page.locator("#devhub-main-content");
    const menu = page.getByRole("dialog", { name: "Main navigation" });
    const home = menu.getByRole("link", { name: "~/HOME" });
    const homeLabel = home.locator("[data-mobile-menu-item-label]");

    await expect(
      page.getByRole("button", { name: "Close menu" }),
    ).toBeVisible();
    await expect(header).toHaveCSS("background-color", "rgb(199, 201, 209)");
    await expect(mainContent).toHaveAttribute("aria-hidden", "true");
    await expect(mainContent).toHaveJSProperty("inert", true);
    await expect(menu).toHaveCSS("background-color", "rgb(28, 29, 34)");
    await expect(home).toHaveAttribute("aria-current", "page");
    await expect(homeLabel).toHaveCSS("background-color", "rgb(199, 201, 209)");
    await expect(menu.locator("[data-mobile-menu-product-label]")).toHaveText(
      "product",
    );
    await expect(menu.getByRole("link", { name: "lakebase" })).toHaveAttribute(
      "href",
      "/product/lakebase",
    );
    await expect(
      menu.getByRole("link", { name: "agent bricks" }),
    ).toHaveAttribute("href", "/product/agent-bricks");
    await expect(
      menu.getByRole("link", { name: "databricks apps" }),
    ).toHaveAttribute("href", "/product/databricks-apps");
    await expect(menu.getByRole("link", { name: "solutions" })).toHaveAttribute(
      "href",
      "/solutions",
    );
    await expect(menu.getByRole("link", { name: "templates" })).toHaveAttribute(
      "href",
      "/templates",
    );
    await expect(menu.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "/docs/start-here",
    );
    await expect(
      menu.getByRole("button", { name: "Search documentation" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(mainContent).not.toHaveAttribute("aria-hidden", "true");
    await expect(mainContent).toHaveJSProperty("inert", false);
  });
});

test.describe("home hero animation", () => {
  test("restarts after navigating away and returning home", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const heroRoot = page.locator(".db-hero-animation-root");
    const heroStage = heroRoot.locator("#stage");
    const heroCanvas = heroRoot.locator("#gridCanvas");

    await expect(heroStage).toHaveAttribute("data-current-state", /[1-6]/, {
      timeout: 30_000,
    });
    await expect(heroCanvas).toHaveAttribute("width", /\d+/);

    await page.getByRole("link", { name: "[Docs]" }).click();
    await expect(page).toHaveURL(/\/docs\/start-here$/);
    await page
      .getByRole("link", { name: "Databricks Developer home" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/$/);

    await expect(heroStage).toHaveAttribute("data-current-state", /[1-6]/, {
      timeout: 30_000,
    });
    await expect(heroCanvas).toHaveAttribute("width", /\d+/);
  });

  test("does not create browser selection when dragging the app preview body", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const heroRoot = page.locator(".db-hero-animation-root");
    const appPreview = page.locator("#appPreview");

    await expect(heroRoot).toHaveCSS("user-select", "none");
    await expect(appPreview).toHaveCSS("user-select", "none");
    await expect(page.locator("#appPreview img").first()).toHaveAttribute(
      "draggable",
      "false",
    );
    await expect(appPreview).toBeVisible({ timeout: 30_000 });

    const appPreviewBox = await appPreview.boundingBox();

    if (!appPreviewBox) {
      throw new Error("Expected hero app preview to be measurable");
    }

    await page.mouse.move(
      appPreviewBox.x + appPreviewBox.width / 2,
      appPreviewBox.y + appPreviewBox.height * 0.62,
    );
    await page.mouse.down();
    await page.mouse.move(
      appPreviewBox.x + appPreviewBox.width / 2 + 120,
      appPreviewBox.y + appPreviewBox.height * 0.62 + 70,
      { steps: 6 },
    );
    await page.mouse.up();

    await expect
      .poll(async () => page.evaluate(() => window.getSelection()?.toString()))
      .toBe("");
  });
});

test.describe("footer navigation", () => {
  const FOOTER_INTERNAL_LINKS = [
    {
      href: "/",
      label: "Databricks logo",
    },
    {
      href: "/docs/start-here",
      label: "Docs",
    },
    { href: "/templates", label: "Templates" },
    { href: "/solutions", label: "Solutions" },
    { href: "/product/databricks-apps", label: "Databricks Apps" },
    { href: "/product/lakebase", label: "Lakebase" },
    { href: "/product/agent-bricks", label: "Agent Bricks" },
  ];

  const FOOTER_EXTERNAL_LINKS = [
    { href: "https://www.reddit.com/r/databricks/", label: "Reddit" },
    { href: "https://www.youtube.com/@Databricks", label: "YouTube" },
    { href: "https://github.com/databricks/devhub", label: "GitHub" },
    { href: "https://www.databricks.com", label: "Databricks.com" },
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
    "https://www.databricks.com/legal/privacynotice",
    "https://www.databricks.com/legal/terms-of-use",
    "https://www.databricks.com/legal/modern-slavery-policy-statement",
    "https://www.databricks.com/legal/supplemental-privacy-notice-california-residents",
    "#yourprivacychoices",
    "/product/databricks-apps",
    "/product/lakebase",
    "/product/agent-bricks",
    "https://neon.com",
    "/docs/start-here",
    "/templates",
    "/solutions",
    "https://www.reddit.com/r/databricks/",
    "https://www.youtube.com/@Databricks",
    "https://github.com/databricks/devhub",
    "https://www.databricks.com",
  ];

  test("footer renders every expected link in order", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("footer a")
      .filter({ visible: true })
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
      const link = page.locator(`footer a[href="${href}"]`).filter({
        visible: true,
      });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  }
});

test.describe("home page link navigation", () => {
  test('hero "Copy agent prompt" copies the full composed agent prompt (about + guidelines + hero intent + bootstrap) from API', async ({
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
      .getByRole("button", { name: "Copy agent prompt" })
      .first();
    await button.waitFor({ state: "visible" });
    await expect(button).toBeEnabled();
    await button.click();

    await expect(
      page.locator("main").getByRole("button", { name: "Copied" }).first(),
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
    expect(finalCopiedText).toContain("Databricks CLI");
    expect(finalCopiedText).toContain("developers.databricks.com");
    expect(finalCopiedText).toContain("llms.txt");
  });

  test("pillar card Lakebase navigates to /product/lakebase", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[href="/product/lakebase"]').first();
    await link.waitFor({ state: "visible" });
    await link.click();
    await page.waitForURL("**/product/lakebase");
    expect(new URL(page.url()).pathname).toBe("/product/lakebase");
  });

  test("pillar card Agent Bricks navigates to /product/agent-bricks", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/product/agent-bricks"]').first().click();
    await page.waitForURL("**/product/agent-bricks");
    expect(new URL(page.url()).pathname).toBe("/product/agent-bricks");
  });

  test("pillar card Databricks Apps navigates to /product/databricks-apps", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('a[href="/product/databricks-apps"]').first().click();
    await page.waitForURL("**/product/databricks-apps");
    expect(new URL(page.url()).pathname).toBe("/product/databricks-apps");
  });

  test('"See all templates" navigates to /templates', async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/templates"]').first().click();
    await page.waitForURL("**/templates");
    expect(new URL(page.url()).pathname).toBe("/templates");
  });

  test("home features section renders product feature cards", async ({
    page,
  }) => {
    await page.goto("/");

    const features = page.locator("section.features");
    await features.scrollIntoViewIfNeeded();

    await expect(features.locator("#home-features-heading")).toHaveText(
      "Databricks developer platform features",
    );
    await expect(features.locator('[data-slot="feature-card"]')).toHaveCount(3);
    await expect(features).toContainText(
      "Web apps that run inside your workspace.",
    );
    await expect(features).toContainText(
      "Managed Postgres, colocated with your Lakehouse.",
    );
    await expect(features).toContainText(
      "LLM-driven apps that call tools and return structured output.",
    );
    await expect(
      features.locator('a[href="/product/databricks-apps"]'),
    ).toHaveText("Learn more");
    await expect(features.locator('a[href="/product/lakebase"]')).toHaveText(
      "Learn more",
    );
    await expect(
      features.locator('a[href="/product/agent-bricks"]'),
    ).toHaveText("Learn more");
  });

  test("home template slider fits responsive cards and preserves vertical touch scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const client = await page.context().newCDPSession(page);

    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 1,
    });
    await page.goto("/");

    const firstTemplateCard = page
      .getByRole("link", { name: "AI Chat App template" })
      .first();
    const nextTemplateCard = page
      .getByRole("link", { name: "App with Lakebase template" })
      .first();

    await firstTemplateCard.scrollIntoViewIfNeeded();
    await expect(firstTemplateCard).toBeVisible();
    await expect(nextTemplateCard).toBeVisible();

    const sliderMetrics = await getTemplateCardTextMetrics(firstTemplateCard);
    const nextSliderMetrics =
      await getTemplateCardTextMetrics(nextTemplateCard);

    expect(Math.round(sliderMetrics.cardWidth)).toBeLessThan(
      sliderMetrics.viewportWidth - 80,
    );
    expectTemplateCardDescriptionToFit(sliderMetrics);
    expectTemplateCardDescriptionToFit(nextSliderMetrics);
    expect(Math.round(nextSliderMetrics.cardLeft)).toBeLessThan(
      sliderMetrics.viewportWidth,
    );
    expect(Math.round(nextSliderMetrics.cardRight)).toBeGreaterThan(
      sliderMetrics.viewportWidth,
    );

    const horizontalSwipeBox = await firstTemplateCard.boundingBox();

    if (!horizontalSwipeBox) {
      throw new Error("Expected home template slider card bounds");
    }

    const horizontalTouchX =
      horizontalSwipeBox.x + horizontalSwipeBox.width / 2;
    const horizontalTouchY =
      horizontalSwipeBox.y + Math.min(horizontalSwipeBox.height - 20, 160);

    await client.send("Input.dispatchTouchEvent", {
      touchPoints: [{ x: horizontalTouchX, y: horizontalTouchY }],
      type: "touchStart",
    });
    await client.send("Input.dispatchTouchEvent", {
      touchPoints: [{ x: horizontalTouchX - 170, y: horizontalTouchY + 6 }],
      type: "touchMove",
    });
    await client.send("Input.dispatchTouchEvent", {
      touchPoints: [],
      type: "touchEnd",
    });

    await expect
      .poll(() =>
        page
          .locator("[data-template-slider-viewport]")
          .evaluate((viewport) => viewport.scrollLeft),
      )
      .toBeGreaterThan(80);
    await expect(
      page.locator('[data-active="true"] a[aria-label]').first(),
    ).toBeVisible();

    const activeTemplateCard = page
      .locator('[data-active="true"] a[aria-label]')
      .first();
    const cardBox = await activeTemplateCard.boundingBox();

    if (!cardBox) {
      throw new Error("Expected home template slider card bounds");
    }

    const touchX = cardBox.x + cardBox.width / 2;
    const touchY = cardBox.y + Math.min(cardBox.height - 20, 160);
    const scrollBefore = await page.evaluate(() => window.scrollY);

    await client.send("Input.dispatchTouchEvent", {
      touchPoints: [{ x: touchX, y: touchY }],
      type: "touchStart",
    });
    await client.send("Input.dispatchTouchEvent", {
      touchPoints: [{ x: touchX + 8, y: touchY - 160 }],
      type: "touchMove",
    });
    await client.send("Input.dispatchTouchEvent", {
      touchPoints: [],
      type: "touchEnd",
    });

    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollBefore + 40);

    await page.setViewportSize({ width: 892, height: 785 });
    await page.goto("/");

    const appWithLakebaseCard = page
      .getByRole("link", { name: "App with Lakebase template" })
      .first();

    await firstTemplateCard.scrollIntoViewIfNeeded();
    await expect(firstTemplateCard).toBeVisible();
    await expect(appWithLakebaseCard).toBeVisible();

    expectTemplateCardDescriptionToFit(
      await getTemplateCardTextMetrics(firstTemplateCard),
    );
    expectTemplateCardDescriptionToFit(
      await getTemplateCardTextMetrics(appWithLakebaseCard),
    );

    await expect(
      appWithLakebaseCard.locator("xpath=ancestor::*[@data-active][1]"),
    ).toHaveCSS("opacity", "1");
    await appWithLakebaseCard.click();
    await page.waitForURL("**/templates/app-with-lakebase");
    expect(new URL(page.url()).pathname).toBe("/templates/app-with-lakebase");
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
      await page.goto("/solutions", { waitUntil: "domcontentloaded" });
      const link = page.locator(`a[href="${path}"]`).first();
      await link.waitFor({ state: "visible" });
      await expectDevHubImageToUseNextOptimizer(
        page.locator(`a[href="${path}"] img`).first(),
        "/img/solutions/devhub-launch.jpg",
      );
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
    // agentic-support-console is unlisted, so it can't be reached from the grid.
    { path: "/templates/vacation-rentals", kind: "example" },
    {
      path: "/templates/saas-tracker",
      kind: "example",
      searchQuery: "SaaS Subscription Tracker",
    },
    { path: "/templates/set-up-your-local-dev-environment", kind: "recipe" },
  ];

  for (const { path, kind, searchQuery } of TEMPLATES) {
    test(`${kind} card navigates to ${path}`, async ({ page }) => {
      await page.goto("/templates");
      const link = page
        .locator(`#templates-list a[href="${path}"]`)
        .filter({ hasText: /.+/ })
        .first();
      if (!(await link.isVisible())) {
        await page
          .getByRole("searchbox")
          .fill(
            searchQuery ?? path.split("/").pop()?.replaceAll("-", " ") ?? path,
          );
      }
      await link.waitFor({ state: "visible" });
      expect(await link.getAttribute("href")).toBe(path);
      await page.goto(path);
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

  test("solution detail hero image uses the Next image optimizer", async ({
    page,
  }) => {
    await page.goto("/solutions/devhub-launch");

    await expectDevHubImageToUseNextOptimizer(
      page.getByRole("img", {
        name: "Cover graphic for Introducing DevHub with a grid, launch tags, and developer hub label",
      }),
      "/img/solutions/devhub-launch.jpg",
    );
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

  test("more templates slider renders cover images", async ({ page }) => {
    await page.goto("/templates/ai-chat-app");

    const moreTemplates = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Explore more templates" }),
    });
    const coverImages = moreTemplates.locator('img[alt$=" preview"]');

    await expectDevHubImageToUseNextOptimizer(coverImages.first());
  });

  test("template detail pages keep production light preview assets", async ({
    page,
  }) => {
    await page.goto("/templates/lakebase-change-data-feed-autoscaling");

    await expectDevHubImageToUseNextOptimizer(
      page
        .locator(
          'img[alt="Lakebase Change Data Feed: Sync Lakebase to Unity Catalog (Autoscaling) preview"]',
        )
        .first(),
      "/img/guides/lakebase-change-data-feed-autoscaling-preview-light.png",
    );

    const moreTemplates = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Explore more templates" }),
    });

    await expectDevHubImageToUseNextOptimizer(
      moreTemplates.locator('img[alt="Lakebase Agent Memory preview"]').first(),
      "/img/guides/lakebase-agent-memory-preview-light.png",
    );
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
      page.getByText("Query Foundation Model Endpoints", { exact: true }),
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

  test("AppKit docs keep the main docs sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/docs/appkit/v0");

    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await expect(sidebar.getByText("AppKit Reference")).toBeHidden();
    await expect(
      page.getByRole("banner").getByRole("button", {
        name: "Search documentation",
      }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("button", { name: "Search documentation" }),
    ).toHaveCount(0);
    await expect(
      sidebar.getByRole("link", { name: "Start here" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Platform overview" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("button", { name: "Databricks Apps", exact: true }),
    ).toBeVisible();
  });

  test("Databricks Apps AppKit link opens latest AppKit docs entry", async ({
    page,
  }) => {
    await page.goto("/docs/start-here");
    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await sidebar
      .getByRole("button", { name: "Databricks Apps", exact: true })
      .click();
    await sidebar.getByRole("button", { name: "AppKit", exact: true }).click();
    const appKitReferenceLink = page
      .locator('nav[aria-label="Docs sidebar"] a[href*="/docs/appkit/"]')
      .first();
    await appKitReferenceLink.click();
    await expect(page).toHaveURL(/\/docs\/appkit\/v\d+/);
  });

  test("AppKit API pages stay inside the main docs sidebar", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/api/appkit-ui");

    const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
    await expect(
      sidebar.getByRole("link", { name: "Start here" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("button", { name: "Databricks Apps", exact: true }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("button", { name: "AppKit", exact: true }),
    ).toBeVisible();
    await expect(
      sidebar.locator('a[href="/docs/appkit/v0/api/appkit-ui"]'),
    ).toBeVisible();
    await expect(
      sidebar.locator('a[href="/docs/appkit/v0/api/appkit"]'),
    ).toBeVisible();
  });
});
