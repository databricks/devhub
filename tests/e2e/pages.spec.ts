import { expect, test, type Page } from "@playwright/test";

import { expectDevHubImageToUseNextOptimizer } from "./image-assertions";

const PRODUCT_PAGES = [
  { path: "/product/agent-bricks", title: "Agent Bricks" },
  { path: "/product/lakebase", title: "Lakebase" },
  { path: "/product/databricks-apps", title: "Databricks Apps" },
];

const PAGES = [
  { path: "/", title: "Databricks Developer" },
  { path: "/solutions", title: "Solutions" },
  {
    path: "/solutions/devhub-launch",
    title: "Introducing DevHub",
  },
  { path: "/templates", title: "Templates" },
  { path: "/templates/ai-chat-app", title: "AI Chat App" },
  { path: "/templates/app-with-lakebase", title: "App with Lakebase" },
  {
    path: "/templates/genie-analytics-app",
    title: "Genie Analytics App",
  },
  {
    path: "/templates/agentic-support-console",
    title: "Agentic Support Console",
  },
  {
    path: "/templates/saas-tracker",
    title: "SaaS Subscription Tracker",
  },
  {
    path: "/templates/set-up-your-local-dev-environment",
    title: "Set Up Your Local Dev Environment",
  },
  {
    path: "/templates/spin-up-databricks-app",
    title: "Spin Up a Databricks App",
  },
  {
    path: "/templates/onboard-your-coding-agent",
    title: "Onboard Your Coding Agent",
  },
  {
    path: "/templates/medallion-architecture-from-cdc",
    title: "Medallion Architecture from CDC History Tables",
  },
  { path: "/templates/lakebase-off-platform", title: "Lakebase Off-Platform" },
  { path: "/perspectives", title: "Perspectives" },
  { path: "/docs/start-here", title: "Start here" },
  { path: "/docs/agents/overview", title: "What is Agent Bricks?" },
  { path: "/docs/agents/ai-gateway", title: "Unity AI Gateway" },
  { path: "/docs/agents/genie", title: "Genie Agents" },
  { path: "/docs/agents/custom-agents", title: "Custom agent endpoints" },
  { path: "/docs/apps/quickstart", title: "Quickstart" },
  { path: "/docs/apps/configuration", title: "App configuration" },
  { path: "/docs/apps/development", title: "App development" },
  { path: "/docs/lakebase/quickstart", title: "Quickstart" },
  {
    path: "/docs/lakebase/configuration",
    title: "Lakebase Postgres configuration",
  },
  {
    path: "/docs/lakebase/development",
    title: "Lakebase Postgres development",
  },
  { path: "/docs/appkit/v0", title: "Getting started" },
  {
    path: "/docs/appkit/v0/api/appkit-ui/ui/Button",
    title: "Button",
  },
  { path: "/docs/tools/databricks-cli", title: "Databricks CLI" },
  { path: "/docs/tools/ai-tools/agent-skills", title: "Agent skills" },
  {
    path: "/docs/tools/ai-tools/docs-mcp-server",
    title: "Docs MCP Server",
  },
  {
    path: "/hackathon/apps-agents-for-good-2026",
    title: "Apps & Agents for Good Hackathon",
  },
  { path: "/hackathon/challenge", title: "Hackathon challenge" },
  {
    path: "/hackathon/free-edition-setup",
    title: "Set up Databricks Free Edition",
  },
];

async function expectMarketing404Footer(page: Page) {
  const heading = page.getByRole("heading", { name: "Page Not Found" });
  await expect(heading).toBeVisible();

  const cta = page.getByRole("region", { name: "Start building" });
  await expect(
    cta.getByRole("heading", {
      name: /Ready to ship your next agentic app in minutes/i,
    }),
  ).toBeVisible();
  await expect(
    cta.getByRole("button", { name: /Copy agent prompt/i }),
  ).toBeVisible();
  await expect(cta.getByRole("link", { name: /Read docs/i })).toHaveAttribute(
    "href",
    "/docs/start-here",
  );

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText("Products", { exact: true })).toBeVisible();
  await expect(footer.getByText("Resources", { exact: true })).toBeVisible();
  await expect(footer.getByText("COMMUNITY", { exact: true })).toBeVisible();

  const layout = await page.evaluate(() => {
    const cta = document.querySelector(".cta");
    const footer = document.querySelector("footer");
    return {
      ctaBeforeFooter:
        Boolean(cta && footer) &&
        cta.getBoundingClientRect().bottom <=
          footer.getBoundingClientRect().top,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(layout).toEqual({
    ctaBeforeFooter: true,
    scrollWidth: 390,
    viewportWidth: 390,
  });
}

async function gotoPage(page: Page, path: string) {
  return page.goto(path, {
    waitUntil: path === "/solutions" ? "domcontentloaded" : "load",
  });
}

test.describe("all pages load without errors", () => {
  for (const { path, title } of PAGES) {
    test(`${path} loads successfully`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await gotoPage(page, path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(
        new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );

      const fatalErrors = consoleErrors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("the server responded with a status of 404") &&
          !e.includes("Download the React DevTools") &&
          !e.includes("Warning:"),
      );
      expect(fatalErrors).toEqual([]);
    });
  }
});

test.describe("global visual parity", () => {
  test("uses production font rendering defaults", async ({ page }) => {
    await page.goto("/solutions/devhub-launch");

    const rendering = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      return {
        textRendering: body.textRendering,
        webkitFontSmoothing: body.webkitFontSmoothing,
      };
    });

    expect(rendering).toEqual({
      textRendering: "optimizelegibility",
      webkitFontSmoothing: "antialiased",
    });
  });

  test("renders perspectives without the shared header and CTA", async ({
    page,
  }) => {
    await page.goto("/perspectives");

    await expect(page.locator("html")).toHaveClass(/(?:^|\s)dark(?:\s|$)/);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    await expect(page.getByRole("main")).toHaveCSS(
      "background-color",
      "rgb(4, 4, 6)",
    );
    await expect(
      page.getByRole("heading", { level: 1, name: "DevHub" }),
    ).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.getByText("Skip to main content")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toContainText("Privacy Notice");
    await expect(
      page.getByRole("region", { name: "Start building" }),
    ).toHaveCount(0);
  });

  for (const path of [
    "/docs/apps/development",
    "/solutions",
    "/hackathon/challenge",
  ]) {
    test(`${path} applies the single dark theme class to the root`, async ({
      page,
    }) => {
      await gotoPage(page, path);

      await expect(page.locator("html")).toHaveClass(/(?:^|\s)dark(?:\s|$)/);
      await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    });
  }
});

test.describe("static assets load correctly", () => {
  test("sitemap.xml returns 200", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
  });

  test("robots.txt returns 200", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
  });

  test("llms.txt returns 200", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
  });

  test("solutions RSS feed returns RSS XML", async ({ request }) => {
    const response = await request.get("/solutions/rss.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<rss");
  });
});

test.describe("product pages", () => {
  for (const { path, title } of PRODUCT_PAGES) {
    test(`${path} renders product metadata and structured data`, async ({
      page,
    }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(`${title} | Databricks Developer`);
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        }),
      ).toBeVisible();

      const structuredData = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLScriptElement>(
            'script[type="application/ld+json"]',
          ),
        ).map((script) => JSON.parse(script.textContent ?? "{}")),
      );
      expect(structuredData).toContainEqual(
        expect.objectContaining({
          "@type": "Product",
          name: title,
          brand: expect.objectContaining({
            "@type": "Brand",
            name: "Databricks",
          }),
        }),
      );

      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    });
  }

  test("/product root stays unpublished", async ({ request }) => {
    const response = await request.get("/product");
    expect(response.status()).toBe(404);
  });

  test("/product/data-lakehouse redirects to /product/lakebase", async ({
    page,
  }) => {
    await page.goto("/product/data-lakehouse");
    await page.waitForURL("**/product/lakebase");
    expect(new URL(page.url()).pathname).toBe("/product/lakebase");
    await expect(page).toHaveTitle("Lakebase | Databricks Developer");
  });

  test("/appkit redirects to the latest AppKit docs", async ({
    page,
    request,
  }) => {
    const destinationPath = /^\/docs\/appkit\/v\d+$/;
    const response = await request.get("/appkit", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    if (!location) {
      throw new Error("Missing Location header for /appkit");
    }
    expect(new URL(location, "http://localhost").pathname).toMatch(
      destinationPath,
    );

    await page.goto("/appkit");
    await expect(page).toHaveURL(/\/docs\/appkit\/v\d+$/);
    await expect(page).toHaveTitle("Getting started | Databricks Developer");

    await page.goto("/appkit/");
    await expect(page).toHaveURL(/\/docs\/appkit\/v\d+$/);
  });

  test("uses static testimonial cards on desktop when three testimonials fit", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/product/agent-bricks");

    const testimonials = page.locator("section").filter({
      hasText: "Agent Bricks powers real agents in production.",
    });

    await expect(
      testimonials.getByTestId("testimonials-slider-controls"),
    ).toBeHidden();
    await expect(
      testimonials.getByRole("button", {
        includeHidden: true,
        name: "Next testimonial",
      }),
    ).toBeHidden();

    const layout = await testimonials
      .getByTestId("testimonials-track")
      .evaluate((track) => {
        const trackRect = track.getBoundingClientRect();
        const styles = window.getComputedStyle(track);
        const cards = Array.from(track.querySelectorAll("article")).map(
          (card) => {
            const rect = card.getBoundingClientRect();

            return {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              top: Math.round(rect.top),
              width: Math.round(rect.width),
            };
          },
        );

        return {
          cardCount: cards.length,
          cardWidths: cards.map((card) => card.width),
          display: styles.display,
          overflowX: styles.overflowX,
          rowCount: new Set(cards.map((card) => card.top)).size,
          scrollWidth: track.scrollWidth,
          clientWidth: track.clientWidth,
          cardsInsideTrack: cards.every(
            (card) =>
              card.left >= Math.floor(trackRect.left) &&
              card.right <= Math.ceil(trackRect.right),
          ),
        };
      });

    expect(layout.display).toBe("grid");
    expect(layout.overflowX).toBe("visible");
    expect(layout.cardCount).toBe(3);
    expect(layout.rowCount).toBe(1);
    expect(layout.cardsInsideTrack).toBe(true);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 2);
    expect(layout.cardWidths.every((width) => width <= 390)).toBe(true);
  });

  test("keeps testimonial slider below 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1279, height: 900 });
    await page.goto("/product/agent-bricks");

    const testimonials = page.locator("section").filter({
      hasText: "Agent Bricks powers real agents in production.",
    });
    const track = testimonials.getByTestId("testimonials-track");

    await expect(
      testimonials.getByTestId("testimonials-slider-controls"),
    ).toBeVisible();

    const layout = await track.evaluate((element) => {
      const styles = window.getComputedStyle(element);

      return {
        display: styles.display,
        documentScrollWidth: document.documentElement.scrollWidth,
        overflowX: styles.overflowX,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        viewportWidth: window.innerWidth,
      };
    });

    expect(layout.display).toBe("flex");
    expect(layout.overflowX).toBe("auto");
    expect(layout.scrollWidth).toBeGreaterThan(layout.clientWidth);
    expect(layout.documentScrollWidth).toBeLessThanOrEqual(
      layout.viewportWidth + 1,
    );
  });

  test("keeps testimonial slider behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/product/agent-bricks");

    const testimonials = page.locator("section").filter({
      hasText: "Agent Bricks powers real agents in production.",
    });
    const track = testimonials.getByTestId("testimonials-track");

    await expect(
      testimonials.getByTestId("testimonials-slider-controls"),
    ).toBeVisible();

    const layout = await track.evaluate((element) => {
      const styles = window.getComputedStyle(element);

      return {
        display: styles.display,
        overflowX: styles.overflowX,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    });

    expect(layout.display).toBe("flex");
    expect(layout.overflowX).toBe("auto");
    expect(layout.scrollWidth).toBeGreaterThan(layout.clientWidth);

    await track.evaluate((element) => {
      element.scrollTo({
        behavior: "instant" as ScrollBehavior,
        left: element.clientWidth,
      });
    });

    await expect
      .poll(() => track.evaluate((element) => Math.round(element.scrollLeft)))
      .toBeGreaterThan(0);
  });
});

test.describe("solutions RSS", () => {
  test("RSS action links to the generated feed", async ({ page }) => {
    await gotoPage(page, "/solutions");

    const rssLink = page.getByRole("link", {
      name: "Subscribe to the Databricks Developer Solutions RSS feed",
    });

    await expect(rssLink).toHaveAttribute("href", /\/solutions\/rss\.xml$/);
  });

  test("literal paginated placeholder route returns not found", async ({
    request,
  }) => {
    const response = await request.get("/solutions/page/:page");

    expect(response.status()).toBe(404);
  });

  test("out-of-range paginated routes return not found", async ({
    request,
  }) => {
    const response = await request.get("/solutions/page/2");

    expect(response.status()).toBe(404);
  });
});

test.describe("solutions search", () => {
  test("opens and filters without runtime errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await gotoPage(page, "/solutions");
    await page.getByRole("button", { name: "Search solutions" }).click();

    const search = page.getByRole("combobox");
    await expect(search).toBeVisible();
    await expect(
      page.getByRole("option", { name: /Introducing DevHub/ }),
    ).toBeVisible();

    await search.fill("lakebase");
    await expect(
      page.getByRole("option", { name: /How to use Lakebase/ }),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});

test.describe("perspectives index", () => {
  test("keeps production metadata and generated-index copy", async ({
    page,
  }) => {
    await page.goto("/perspectives");

    await expect(page).toHaveTitle("Perspectives | Databricks Developer");
    await expect(
      page.getByText(/Answers to common questions about building data apps/),
    ).toBeVisible();
  });
});

test.describe("detail prose visual parity", () => {
  test("keeps production recipe prose line-height across mobile and desktop breakpoints", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/templates/ai-chat-app");

    const templateParagraph = page
      .locator(".recipe-content-card .prose p")
      .first();
    await expect(templateParagraph).toHaveCSS("line-height", "24px");

    const mobileTemplateLayout = await page
      .locator(".recipe-content-card")
      .evaluate((card) => {
        const paragraph = card.querySelector("p")!;

        return {
          cardHeight: Math.round(card.getBoundingClientRect().height),
          paragraphHeight: Math.round(paragraph.getBoundingClientRect().height),
        };
      });

    expect(mobileTemplateLayout).toEqual({
      cardHeight: 1315,
      paragraphHeight: 240,
    });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/solutions/devhub-launch");

    const solutionParagraph = page
      .locator(".recipe-content-card .prose p")
      .first();
    await expect(solutionParagraph).toHaveCSS("line-height", "27px");
  });
});

test.describe("docs MDX compatibility", () => {
  test("uses sidebar labels in docs navigation and eyebrow", async ({
    page,
  }) => {
    await page.goto("/docs/agents/overview");

    const article = page.locator("article");
    await expect(article.getByText("Overview").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What is Agent Bricks?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Overview", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "What is Agent Bricks?", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('a[href="#devhub-main-content"]')).toHaveText(
      "Skip to main content",
    );
    await expect(
      page.getByRole("button", { name: "Copy link to section" }).first(),
    ).toBeAttached();

    await page
      .getByRole("banner")
      .getByRole("button", { name: "Search documentation" })
      .click();
    const suggestions = page.getByRole("listbox", { name: "Suggestions" });
    const aiGatewaySuggestion = suggestions.getByRole("option", {
      name: "Ai Gateway",
    });
    await expect(aiGatewaySuggestion).toBeVisible();
    await expect(aiGatewaySuggestion.locator("svg").first()).toHaveAttribute(
      "viewBox",
      "0 0 14.14 16.14",
    );
    await expect(
      suggestions.getByRole("option", { name: "AI Chat App" }),
    ).toHaveCount(0);
  });

  test("renders tabs and admonitions without literal MDX source", async ({
    page,
  }) => {
    await page.goto("/docs/tools/databricks-cli");

    const article = page.locator("article");
    await expect(article).not.toContainText("import Tabs from");
    await expect(article).not.toContainText('<Tabs groupId="os">');
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
      "content",
      /import Tabs|<Tabs/,
    );
    const macOsTab = page.getByRole("tab", { name: "macOS / Linux" });
    const windowsTab = page.getByRole("tab", { name: "Windows" });
    await expect(macOsTab).toHaveAttribute("aria-selected", "true");
    await expect(macOsTab).toHaveAttribute("tabindex", "0");
    await expect(windowsTab).toHaveAttribute("tabindex", "-1");
    await expect(
      page.getByRole("button", { name: "Copy code" }).first(),
    ).toBeVisible();
    await expect(page.locator(".admonition")).toContainText(
      "All DevHub templates assume",
    );

    await macOsTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(windowsTab).toBeFocused();
    await expect(windowsTab).toHaveAttribute("aria-selected", "true");
    await expect(windowsTab).toHaveAttribute("tabindex", "0");
    await expect(macOsTab).toHaveAttribute("tabindex", "-1");
    await expect(page.getByText("winget install")).toBeVisible();
  });

  test("substitutes DevHub site URL placeholders in rendered docs", async ({
    page,
  }) => {
    await page.goto("/docs/tools/ai-tools/docs-mcp-server");

    const article = page.locator("article");
    await expect(article).not.toContainText("__DEVHUB_SITE_URL__");
    await expect(article).toContainText(
      "npx add-mcp https://developers.databricks.com/api/mcp --name devhub-docs -g",
    );
    await expect(
      article
        .locator("figure.theme-code-block")
        .filter({
          hasText:
            "npx add-mcp https://developers.databricks.com/api/mcp --name devhub-docs -g",
        })
        .first()
        .getByRole("button", { name: "Copy code to clipboard" }),
    ).toBeVisible();

    const verifyListLayout = await article
      .locator("ol")
      .first()
      .evaluate((list) => ({
        directParagraphs: list.querySelectorAll(":scope > li > p").length,
        height: Math.round(list.getBoundingClientRect().height),
        nestedLists: list.querySelectorAll(":scope > li > ul").length,
      }));

    expect(verifyListLayout).toEqual({
      directParagraphs: 0,
      height: 212,
      nestedLists: 3,
    });
  });

  test("renders short MCP tool signatures as production inline code", async ({
    page,
  }) => {
    await page.goto("/docs/tools/ai-tools/docs-mcp-server");

    const article = page.locator("article");
    const listResourcesCode = article.locator(".prose-docs > code").filter({
      hasText:
        "list_docs_resources() → markdown index of all doc pages with slugs and titles",
    });
    const getResourceCode = article.locator(".prose-docs > code").filter({
      hasText:
        'get_doc_resource(slug: "start-here") → full markdown content of the requested page',
    });

    await expect(article.locator("figure.theme-code-block")).toHaveCount(3);
    await expect(listResourcesCode).toBeVisible();
    await expect(getResourceCode).toBeVisible();

    const codeHeights = await Promise.all([
      listResourcesCode.evaluate((element) =>
        Math.round(element.getBoundingClientRect().height),
      ),
      getResourceCode.evaluate((element) =>
        Math.round(element.getBoundingClientRect().height),
      ),
    ]);
    expect(codeHeights).toEqual([23, 23]);
  });

  test("renders AppKit no-language fenced snippets as production inline code", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/plugins/genie");

    const article = page.locator("article");
    const postSnippet = article.locator(".prose-docs > code").filter({
      hasText:
        'POST /api/genie/:alias/messages Content-Type: application/json { "content": "What were total sales last quarter?",',
    });
    const getSnippet = article.locator(".prose-docs > code").filter({
      hasText: "GET /api/genie/:alias/conversations/:conversationId",
    });

    await expect(
      article
        .locator("figure.theme-code-block")
        .filter({ hasText: "POST /api/genie/:alias/messages" }),
    ).toHaveCount(0);
    await expect(
      article.locator("figure.theme-code-block").filter({
        hasText: "GET /api/genie/:alias/conversations/:conversationId",
      }),
    ).toHaveCount(0);
    await expect(postSnippet).toBeVisible();
    await expect(getSnippet).toBeVisible();

    const snippetHeights = await Promise.all([
      postSnippet.evaluate((element) =>
        Math.round(element.getBoundingClientRect().height),
      ),
      getSnippet.evaluate((element) =>
        Math.round(element.getBoundingClientRect().height),
      ),
    ]);
    expect(snippetHeights).toEqual([43, 23]);
  });

  test("renders markdown helper images as images", async ({ page }) => {
    await page.goto("/docs/platform-overview");

    const article = page.locator("article");
    const diagram = article.getByRole("img", {
      name: /Architecture diagram of the Databricks workspace/,
    });

    await expect(diagram).toBeVisible();
    await expect(diagram).toHaveAttribute(
      "src",
      "/img/docs/platform-overview.svg",
    );
    await expect(article).not.toContainText("<img");
    await expect(article).not.toContainText("useBaseUrl");
  });

  test("expands local AppKit MDX partial imports in rendered docs", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0");

    const article = page.locator("article");
    await expect(article).not.toContainText("import Prerequisites");
    await expect(article).not.toContainText("<Prerequisites />");
    await expect(
      article.getByRole("heading", { name: "Prerequisites" }),
    ).toBeVisible();
    await expect(article).toContainText("Node.js v22+ environment");
    await expect(
      page
        .getByRole("navigation", { name: "On this page" })
        .getByRole("link", { name: "Prerequisites" }),
    ).toBeVisible();

    const layout = await article.evaluate((element) => ({
      articleHeight: Math.round(element.getBoundingClientRect().height),
      codeBlocks: document.querySelectorAll("figure.theme-code-block").length,
      inlineCodes: document.querySelectorAll(
        ".prose.prose-docs > code, article :not(pre) > code",
      ).length,
      linksWithoutBanners:
        document.querySelectorAll("a").length -
        document.querySelectorAll(
          ".devhub-hackathon-banner a, .devhub-site-banner a",
        ).length,
    }));

    expect(layout.articleHeight).toBeGreaterThanOrEqual(3130);
    expect(layout.articleHeight).toBeLessThanOrEqual(3165);
    expect(layout.codeBlocks).toBe(3);
    expect(layout.inlineCodes).toBe(2);
    // 68 = page links + footer links, including the Neon entry in the footer
    // Products list and "Your Privacy Choices", which the footer renders twice
    // (desktop and mobile legal blocks). Announcement banners are env-gated, so
    // their links are excluded to keep the count stable whether or not a banner
    // is live.
    expect(layout.linksWithoutBanners).toBe(68);
  });

  test("renders relative docs image assets and links", async ({ page }) => {
    await page.goto("/docs/appkit/v0/plugins/genie");

    const article = page.locator("article");
    await expect(
      article.locator("p").filter({ hasText: "<div style" }),
    ).toHaveCount(0);
    await expect(
      article.locator("p").filter({ hasText: "</div>" }),
    ).toHaveCount(0);

    const spaceIdImage = article.getByRole("img", {
      name: "Genie Space ID in the About tab",
    });
    const genieChatImage = article.getByRole("img", {
      name: "GenieChat component",
    });

    await expect(spaceIdImage).toBeVisible();
    await expect(genieChatImage).toBeVisible();
    await expectDevHubImageToUseNextOptimizer(
      spaceIdImage,
      "/docs/appkit/v0/plugins/assets/genie-space-id.png",
    );
    await expectDevHubImageToUseNextOptimizer(
      genieChatImage,
      "/docs/appkit/v0/plugins/assets/genie-chat.png",
    );

    const images = await article.locator("img").evaluateAll((items) =>
      items.map((image) => ({
        alt: image.alt,
        naturalHeight: image.naturalHeight,
        naturalWidth: image.naturalWidth,
        renderedWidth: Math.round(image.getBoundingClientRect().width),
      })),
    );

    expect(
      images.map(({ alt, renderedWidth }) => ({ alt, renderedWidth })),
    ).toEqual([
      {
        alt: "Genie Space ID in the About tab",
        renderedWidth: 400,
      },
      {
        alt: "GenieChat component",
        renderedWidth: 704,
      },
    ]);
    for (const image of images) {
      expect(image.naturalHeight).toBeGreaterThan(0);
      expect(image.naturalWidth).toBeGreaterThan(0);
    }

    const docsMediaRhythm = await article.evaluate((element) => {
      const firstImage = element.querySelector(
        'img[alt="Genie Space ID in the About tab"]',
      );
      const imageWrapper = firstImage?.parentElement;
      const firstTableWrapper = element.querySelector(
        ".markdown-table-wrapper",
      );
      const firstTable = firstTableWrapper?.querySelector("table");
      const imageWrapperStyle = imageWrapper
        ? getComputedStyle(imageWrapper)
        : null;
      const tableWrapperStyle = firstTableWrapper
        ? getComputedStyle(firstTableWrapper)
        : null;
      const tableStyle = firstTable ? getComputedStyle(firstTable) : null;

      return {
        imageWrapperMarginBottom: imageWrapperStyle?.marginBottom,
        imageWrapperMarginTop: imageWrapperStyle?.marginTop,
        imageWrapperTag: imageWrapper?.tagName,
        tableMarginTop: tableStyle?.marginTop,
        tableWrapperClass: firstTableWrapper?.getAttribute("class"),
        tableWrapperMarginBottom: tableWrapperStyle?.marginBottom,
        tableWrapperMarginTop: tableWrapperStyle?.marginTop,
        tableWrapperTag: firstTableWrapper?.tagName,
      };
    });

    expect(docsMediaRhythm).toEqual({
      imageWrapperMarginBottom: "32px",
      imageWrapperMarginTop: "32px",
      imageWrapperTag: "P",
      tableMarginTop: "0px",
      tableWrapperClass: "markdown-table-wrapper not-prose -mx-5 my-8 md:mx-0",
      tableWrapperMarginBottom: "32px",
      tableWrapperMarginTop: "32px",
      tableWrapperTag: "FIGURE",
    });
    await expect(
      article.getByRole("link", { name: "GenieChat" }),
    ).toHaveAttribute("href", "/docs/appkit/v0/api/appkit-ui/genie/GenieChat");
  });

  test("keeps constrained docs images inside the mobile article column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs/appkit/v0/plugins/genie");

    const layout = await page
      .getByRole("img", { name: "Genie Space ID in the About tab" })
      .evaluate((image) => {
        const imageRect = image.getBoundingClientRect();
        const articleRect = image.closest("article")!.getBoundingClientRect();

        return {
          articleWidth: Math.round(articleRect.width),
          documentWidth: document.documentElement.scrollWidth,
          imageRight: Math.round(imageRect.right),
          imageWidth: Math.round(imageRect.width),
          viewportWidth: window.innerWidth,
        };
      });

    expect(layout.documentWidth).toBe(layout.viewportWidth);
    expect(layout.imageWidth).toBeLessThanOrEqual(layout.articleWidth);
    expect(layout.imageRight).toBeLessThanOrEqual(layout.viewportWidth);
  });

  test("renders Mermaid diagrams as SVG instead of source code", async ({
    page,
  }) => {
    await page.goto("/docs/agents/overview");

    const article = page.locator("article");
    await expect(article).not.toContainText("```mermaid");
    await expect(page.locator("figure code.language-mermaid")).toHaveCount(0);
    await expect(page.locator("[data-mermaid-diagram] svg")).toBeVisible();
  });

  test("renders GFM tables as semantic tables instead of pipe text", async ({
    page,
  }) => {
    await page.goto("/docs/agents/overview");

    const table = page.locator("article table").first();
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Use this plugin" }),
    ).toBeVisible();
    await expect(table).toContainText("useServingStream");
    await expect(page.locator("article")).not.toContainText(
      "| ----------------------------------------------------------------------------- |",
    );
  });

  test("matches production inline code alignment in docs prose", async ({
    page,
  }) => {
    await page.goto("/docs/apps/development");

    const localSetupCopy = page
      .locator("article p")
      .filter({ hasText: "Copy .env.example to .env" });
    const inlineCode = localSetupCopy.locator("code").first();

    await expect(inlineCode).toHaveText(".env.example");

    const inlineCodeLayout = await inlineCode.evaluate((element) => {
      const paragraph = element.closest("p");
      const codeStyle = getComputedStyle(element);

      return {
        codeColor: codeStyle.color,
        paragraphHeight: paragraph
          ? Math.round(paragraph.getBoundingClientRect().height)
          : null,
        verticalAlign: codeStyle.verticalAlign,
      };
    });

    expect(inlineCodeLayout.codeColor).toBe("rgb(245, 247, 248)");
    expect(inlineCodeLayout.paragraphHeight).toBeGreaterThanOrEqual(54);
    expect(inlineCodeLayout.paragraphHeight).toBeLessThanOrEqual(81);
    expect(inlineCodeLayout.verticalAlign).toBe("middle");
  });

  test("keeps AppKit files docs close to production heading and table rhythm", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/plugins/files");

    const article = page.locator("article");
    await expect(
      article.locator("h4", { hasText: "Access policies" }),
    ).toBeVisible();
    await expect(
      article.locator(".admonition").filter({ hasText: "New in v0.21.0" }),
    ).toBeVisible();
    await expect(article).not.toContainText(":::info New in v0.21.0");

    const layout = await article.evaluate((element) => {
      const visible = (item: Element) => {
        const rect = item.getBoundingClientRect();
        const style = getComputedStyle(item);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      };
      const httpHeading = [...element.querySelectorAll("h2")].find(
        (heading) => heading.textContent?.trim() === "HTTP routes",
      );
      let httpTableWrapper = httpHeading?.nextElementSibling;
      while (httpTableWrapper && !httpTableWrapper.querySelector("table")) {
        httpTableWrapper = httpTableWrapper.nextElementSibling;
      }

      return {
        articleHeight: Math.round(element.getBoundingClientRect().height),
        h4CopyButtons: [
          ...element.querySelectorAll(
            'h4 button[aria-label="Copy link to section"]',
          ),
        ].filter(visible).length,
        headingButtons: [
          ...element.querySelectorAll(
            'button[aria-label="Copy link to section"]',
          ),
        ].filter(visible).length,
        httpTableHeight:
          httpTableWrapper instanceof HTMLElement
            ? Math.round(httpTableWrapper.getBoundingClientRect().height)
            : null,
      };
    });

    expect(layout.h4CopyButtons).toBe(0);
    expect(layout.headingButtons).toBe(23);
    expect(layout.httpTableHeight).toBeGreaterThanOrEqual(660);
    expect(layout.httpTableHeight).toBeLessThanOrEqual(690);
    expect(layout.articleHeight).toBeGreaterThanOrEqual(21750);
    expect(layout.articleHeight).toBeLessThanOrEqual(21850);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs/appkit/v0/plugins/files");

    const mobileLayout = await page.locator("article").evaluate((element) => {
      const findTableAfterHeading = (headingText: string) => {
        const heading = [...element.querySelectorAll("h4")].find(
          (item) => item.textContent?.trim() === headingText,
        );
        let sibling = heading?.nextElementSibling;

        while (sibling && !sibling.querySelector("table")) {
          sibling = sibling.nextElementSibling;
        }

        return sibling instanceof HTMLElement
          ? Math.round(sibling.getBoundingClientRect().height)
          : null;
      };

      return {
        articleHeight: Math.round(element.getBoundingClientRect().height),
        documentWidth: document.documentElement.scrollWidth,
        firstTableScrollWidth:
          document.querySelector(".markdown-table-wrapper > div")
            ?.scrollWidth ?? 0,
        firstTableVisibleWidth:
          document.querySelector(".markdown-table-wrapper > div")
            ?.clientWidth ?? 0,
        policyUserMatrixTableHeight:
          findTableAfterHeading("Policy user matrix"),
        productionBehaviorTableHeight: findTableAfterHeading(
          "Production vs development behavior",
        ),
        viewportWidth: window.innerWidth,
      };
    });

    expect(mobileLayout.documentWidth).toBe(mobileLayout.viewportWidth);
    expect(mobileLayout.productionBehaviorTableHeight).toBeGreaterThanOrEqual(
      185,
    );
    expect(mobileLayout.productionBehaviorTableHeight).toBeLessThanOrEqual(195);
    expect(mobileLayout.policyUserMatrixTableHeight).toBeGreaterThanOrEqual(
      640,
    );
    expect(mobileLayout.policyUserMatrixTableHeight).toBeLessThanOrEqual(675);
    expect(mobileLayout.firstTableScrollWidth).toBeGreaterThan(
      mobileLayout.firstTableVisibleWidth,
    );
    expect(mobileLayout.articleHeight).toBeGreaterThanOrEqual(24730);
    expect(mobileLayout.articleHeight).toBeLessThanOrEqual(24775);
  });

  test("renders DocExample embeds with preview and code tabs", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/api/appkit-ui/ui/Button");

    const article = page.locator("article");
    const example = page.locator('[data-doc-example="button"]');
    await expect(article).not.toContainText('<DocExample name="button" />');
    await expect(example).toBeVisible();
    const previewTab = example.getByRole("tab", { name: "Preview" });
    const codeTab = example.getByRole("tab", { name: "Code" });
    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await expect(previewTab).toHaveAttribute("tabindex", "0");
    await expect(codeTab).toHaveAttribute("tabindex", "-1");
    await expect(page.locator('iframe[title="button preview"]')).toBeVisible();

    await previewTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(codeTab).toBeFocused();
    await expect(codeTab).toHaveAttribute("aria-selected", "true");
    await expect(codeTab).toHaveAttribute("tabindex", "0");
    await expect(previewTab).toHaveAttribute("tabindex", "-1");
    await expect(example).toContainText("import { Button }");

    await page.keyboard.press("ArrowLeft");
    await expect(previewTab).toBeFocused();
    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('iframe[title="button preview"]')).toBeVisible();
  });

  test("keeps AppKit API source links and prop tables aligned", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/api/appkit-ui/ui/Button");

    const article = page.locator("article");
    const sourceLink = article.getByRole("link", {
      name: "packages/appkit-ui/src/react/ui/button.tsx",
    });
    await expect(sourceLink).toBeVisible();
    await expect(sourceLink.locator("code")).toHaveText(
      "packages/appkit-ui/src/react/ui/button.tsx",
    );

    const propsTable = article.locator("table").first();
    const variantRow = propsTable.locator("tbody tr").filter({
      hasText: "variant",
    });

    await expect(propsTable.locator("thead th")).toHaveCount(5);
    await expect(variantRow.locator("td")).toHaveCount(5);
    await expect(variantRow.locator("td").nth(1)).toContainText(
      '"link" | "default" | "destructive" | "secondary" | "outline" | "ghost" | null',
    );
    await expect(variantRow.locator("td").nth(2)).toHaveText("");
    await expect(variantRow.locator("td").nth(3)).toHaveText("-");
    await expect(variantRow.locator("td").nth(4)).toHaveText("-");

    const columnWidths = await variantRow
      .locator("td")
      .evaluateAll((cells) =>
        cells.map((cell) => Math.round(cell.getBoundingClientRect().width)),
      );
    expect(columnWidths[0]).toBeGreaterThanOrEqual(140);
    expect(columnWidths[1]).toBeLessThan(220);
    expect(columnWidths[2]).toBeGreaterThanOrEqual(140);
  });

  test("renders HTML details blocks with nested markdown content", async ({
    page,
  }) => {
    await page.goto("/docs/apps/development");

    const article = page.locator("article");
    const details = page.locator("article details").first();
    await expect(article).not.toContainText("<details>");
    await expect(details.locator("summary")).toContainText("Example output");

    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    // The nested fenced code block must be processed as markdown (rendered to a
    // highlighted code figure), not shown as a raw ```json fence inside the
    // <details>. This is the "nested markdown content" the test guards.
    await expect(details.locator("figure.theme-code-block")).toBeVisible();
    await expect(details.locator("figure.theme-code-block")).toContainText(
      "compute_size",
    );
  });

  test("keeps nested HTML details content collapsed in Lakebase docs", async ({
    page,
  }) => {
    await page.goto("/docs/lakebase/development");

    const article = page.locator("article");
    const exampleSummary = article.locator("details > summary").filter({
      hasText: "Example databricks.yml",
    });
    const exampleDetails = exampleSummary.locator("xpath=..");

    await expect(exampleSummary).toContainText(
      "Example databricks.yml with a project, dev branch, and read-only replica",
    );
    // Collapsed by default: no open attribute set on the <details>.
    await expect(exampleDetails).not.toHaveAttribute("open", "");

    // Assert the collapsed state directly and independently of the page's total
    // length: while collapsed the block is just the summary line, and its nested
    // code block must be hidden. If the <details> had rendered open, its height
    // would jump by hundreds of px and the code figure would be visible. This is
    // content-independent, so routine edits to this page don't re-break it.
    const collapsed = await exampleDetails.evaluate((element) => {
      const codeFigure = element.querySelector("figure.theme-code-block");
      return {
        detailsHeight: Math.round(element.getBoundingClientRect().height),
        codeVisible:
          codeFigure instanceof HTMLElement
            ? codeFigure.checkVisibility()
            : null,
      };
    });
    expect(collapsed.codeVisible).toBe(false);
    expect(collapsed.detailsHeight).toBeLessThan(120);

    // Expanding reveals the nested markdown, proving the fenced yaml block was
    // processed (rendered to a code figure) rather than left as a raw fence.
    await exampleSummary.click();
    await expect(exampleDetails).toHaveAttribute("open", "");
    await expect(
      exampleDetails.locator("figure.theme-code-block"),
    ).toBeVisible();
    await expect(
      exampleDetails.locator("figure.theme-code-block"),
    ).toContainText("postgres_projects");
  });

  test("renders fenced code blocks nested inside ordered lists", async ({
    page,
  }) => {
    await page.goto("/docs/apps/configuration");

    const article = page.locator("article");
    await expect(
      article
        .locator("p", { hasText: "controls runtime behavior" })
        .locator("strong code"),
    ).toHaveText("app.yaml");

    const secretsSection = article
      .locator("h3", { hasText: "Secrets" })
      .locator("xpath=following-sibling::ol[1]");

    await expect(secretsSection.locator(":scope > li")).toHaveCount(3);
    await expect(
      secretsSection.getByRole("button", { name: "Copy code" }),
    ).toHaveCount(3);
    await expect(secretsSection.locator("figure.theme-code-block")).toHaveCount(
      3,
    );
    await expect(article).not.toContainText("```yaml");
    await expect(article).not.toContainText("```bash");
  });

  test("renders fenced code blocks nested inside unordered lists", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/app-management");

    const article = page.locator("article");
    await expect(article).not.toContainText(
      "bash databricks apps deploy --target prod",
    );
    await expect(article.locator("figure.theme-code-block")).toHaveCount(17);
    await expect(
      article
        .locator("li", { hasText: "Deploy to a specific target" })
        .locator("figure.theme-code-block"),
    ).toContainText("databricks apps deploy --target prod");

    const layout = await article.evaluate((element) => ({
      articleHeight: Math.round(element.getBoundingClientRect().height),
      footerOffsetFromArticleY: Math.round(
        document.querySelector("footer")!.getBoundingClientRect().y -
          element.getBoundingClientRect().y,
      ),
    }));

    expect(layout).toEqual({
      articleHeight: 4312,
      footerOffsetFromArticleY: 4244,
    });
  });

  test("groups Common and All Options code blocks into tabs", async ({
    page,
  }) => {
    await page.goto("/docs/apps/development");

    const commonTab = page.getByRole("tab", { name: "Common" }).first();
    const allOptionsTab = page
      .getByRole("tab", { name: "All Options" })
      .first();

    await expect(commonTab).toHaveAttribute("aria-selected", "true");
    await expect(allOptionsTab).toBeVisible();
    await expect(
      page.getByText("databricks apps manifest").first(),
    ).toBeVisible();

    await allOptionsTab.click();
    await expect(allOptionsTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByText("--template $TEMPLATE_URL").first(),
    ).toBeVisible();
  });

  test("renders docs code blocks with Shiki syntax highlighting", async ({
    page,
  }) => {
    await page.goto("/docs/apps/development");

    const shikiBlock = page
      .locator("article figure.theme-code-block pre.shiki")
      .first();
    const keyword = page
      .locator(
        'article figure.theme-code-block pre.shiki code span[style*="FF79C6"]',
      )
      .filter({ hasText: "import" })
      .first();
    const functionToken = page
      .locator(
        'article figure.theme-code-block pre.shiki code span[style*="50FA7B"]',
      )
      .filter({ hasText: "createApp" })
      .first();
    const stringToken = page
      .locator(
        'article figure.theme-code-block pre.shiki code span[style*="F1FA8C"]',
      )
      .filter({ hasText: "@databricks/appkit" })
      .first();

    await expect(shikiBlock).toBeVisible();
    await expect(shikiBlock.locator("span.line").first()).toBeVisible();
    await expect(keyword).toBeVisible();
    await expect(functionToken).toBeVisible();
    await expect(stringToken).toBeVisible();

    await expect(keyword).toHaveCSS("color", "rgb(189, 147, 249)");
    await expect(keyword).toHaveCSS("font-style", "italic");
    await expect(functionToken).toHaveCSS("color", "rgb(80, 250, 123)");
    await expect(stringToken).toHaveCSS("color", "rgb(255, 121, 198)");
  });

  test("renders DocExample code tabs with Shiki syntax highlighting", async ({
    page,
  }) => {
    await page.goto("/docs/appkit/v0/api/appkit-ui/ui/Button");

    const example = page.locator('[data-doc-example="button"]');
    await example.getByRole("tab", { name: "Code" }).click();

    const shikiBlock = example.locator("figure.theme-code-block pre.shiki");
    await expect(shikiBlock).toBeVisible();
    await expect(
      shikiBlock.locator('code span[style*="--shiki-dark"]').first(),
    ).toBeVisible();
    await expect(example.locator("figure.theme-code-block")).toHaveAttribute(
      "data-language",
      "tsx",
    );
  });
});

test.describe("hackathon resources", () => {
  test("renders the event page metadata and key resource links", async ({
    page,
  }) => {
    await page.goto("/hackathon/apps-agents-for-good-2026");

    await expect(page).toHaveTitle(
      "Apps & Agents for Good Hackathon — Databricks Data + AI Summit 2026 | Databricks Developer",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Databricks Apps & Agents for Good Hackathon at Data + AI Summit 2026 — schedule, resources, and how to apply.",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://developers.databricks.com/hackathon/apps-agents-for-good-2026",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(
      page.getByRole("link", { name: /Quick start checklist/i }),
    ).toHaveAttribute("href", "/hackathon/quick-start-checklist");
    await expect(
      page.locator('a[href*="19326b3d-db63-4627-abc0-cf4e8131a305"]'),
    ).toContainText("Hackathon dataset");
  });

  test("support pages keep the production back link and dash-list prose", async ({
    page,
  }) => {
    await page.goto("/hackathon/challenge");

    const backLink = page.getByRole("link", {
      name: "Back to the hackathon",
    });
    await expect(backLink).toHaveAttribute("href", "/hackathon");
    await expect(backLink.locator("svg")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );

    const firstListItem = page.locator("article li").first();
    await expect(firstListItem).toContainText(
      "Run as a Databricks App on Free Edition.",
    );

    const marker = await firstListItem.evaluate((node) => {
      const style = getComputedStyle(node, "::before");
      return {
        backgroundColor: style.backgroundColor,
        content: style.content,
        width: style.width,
      };
    });
    expect(marker).toEqual({
      backgroundColor: "rgb(255, 255, 255)",
      content: '""',
      width: "8px",
    });

    const desktopLayout = await page.locator("article").evaluate((article) => {
      const table = article.querySelector("table")!;

      return {
        articleHeight: Math.round(article.getBoundingClientRect().height),
        firstRowHeight: Math.round(
          table.querySelector("tr")!.getBoundingClientRect().height,
        ),
        tableHeight: Math.round(table.getBoundingClientRect().height),
        wrappedTable: Boolean(table.closest(".markdown-table-wrapper")),
      };
    });
    expect(desktopLayout.articleHeight).toBeGreaterThanOrEqual(3050);
    expect(desktopLayout.articleHeight).toBeLessThanOrEqual(3090);
    expect(desktopLayout.firstRowHeight).toBe(37);
    expect(desktopLayout.tableHeight).toBe(358);
    expect(desktopLayout.wrappedTable).toBe(false);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/hackathon/challenge");

    const mobileLayout = await page.locator("article").evaluate((article) => {
      const table = article.querySelector("table")!;

      return {
        articleHeight: Math.round(article.getBoundingClientRect().height),
        documentWidth: document.documentElement.scrollWidth,
        tableHeight: Math.round(table.getBoundingClientRect().height),
        viewportWidth: window.innerWidth,
      };
    });
    expect(mobileLayout).toEqual({
      articleHeight: 3410,
      documentWidth: 390,
      tableHeight: 319,
      viewportWidth: 390,
    });
    await expect(
      page.getByRole("button", { name: "Copy link to section" }),
    ).toHaveCount(0);
  });

  test("Free Edition setup keeps the production FAQ set", async ({ page }) => {
    await page.goto("/hackathon/free-edition-setup");

    await expect(
      page.getByRole("button", { name: "Copy link to section" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "What if my existing Free Edition account has resources running that I do not want to tear down?",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "What limits should I expect?" }),
    ).toBeVisible();
    await expect(page.locator(".faq h3").first()).toHaveCSS(
      "line-height",
      "20px",
    );
    await expect(
      page
        .getByRole("button", {
          name: "Can I use my company or enterprise Databricks account?",
        })
        .first(),
    ).toHaveCSS("line-height", "20px");
  });
});

test.describe("product routes", () => {
  test("/product returns the 404 shell with CTA and footer", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto("/product");

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page Not Found/);
    await expect(
      page.getByRole("heading", { name: "Page Not Found" }),
    ).toBeVisible();
    await expect(
      page.getByText("We know this isn't where you intended to land"),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Start building" }),
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("Products");
    expect(pageErrors).toEqual([]);
  });

  test("/product keeps the marketing CTA and footer on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto("/product");

    expect(response?.status()).toBe(404);
    await expectMarketing404Footer(page);
  });

  test("/product/lakebase keeps the product CTA and footer on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto("/product/lakebase");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Lakebase | Databricks Developer");
    await expect(
      page.getByRole("heading", { level: 1, name: /Lakebase/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Start building" }),
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("Products");

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  });
});

test.describe("unknown routes", () => {
  test("use the website 404 shell with CTA and footer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto("/does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page Not Found/);
    await expect(page.locator(".next-error-h1")).toHaveCount(0);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("Products");
    await expectMarketing404Footer(page);
  });
});
