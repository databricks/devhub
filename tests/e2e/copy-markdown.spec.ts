import { expect, test } from "@playwright/test";

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

async function clickCopyMarkdownAndWaitForCopiedState(
  page: import("@playwright/test").Page,
) {
  const trigger = page.getByRole("button", { name: /copy (as|article)/i });
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  const menuItem = page.getByRole("menuitem", { name: "Copy Markdown" });
  await menuItem.waitFor({ state: "visible" });
  await menuItem.click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText("Markdown copied")).toBeHidden();
}

async function clickCopyPromptAndWaitForCopiedState(
  page: import("@playwright/test").Page,
) {
  const button = page.getByRole("button", { name: "Copy prompt" }).first();
  await button.waitFor({ state: "visible" });
  await button.click();
  await expect(
    page.getByRole("button", { name: "Copied!" }).first(),
  ).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Prompt copied")).toBeHidden();
}

async function expectCopyMarkdownWithoutPreamble({
  page,
  path,
  expectedFragments,
}: {
  page: import("@playwright/test").Page;
  path: string;
  expectedFragments: string[];
}) {
  await setupClipboardMock(page);
  await page.goto(path, { waitUntil: "domcontentloaded" });

  await clickCopyMarkdownAndWaitForCopiedState(page);

  const copied = await getCopiedText(page);
  expect(copied).not.toContain("# About DevHub");
  expect(copied).not.toContain("/llms.txt");
  for (const fragment of expectedFragments) {
    expect(copied).toContain(fragment);
  }
}

test.describe("copy markdown exports raw markdown on recipe pages", () => {
  test("recipe detail page copies goal content with agent prompt wrapper", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/set-up-your-local-dev-environment");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("Databricks CLI");
    expect(copied).toContain("authenticated CLI profile");
    expect(copied).toContain("llms.txt");
  });
});

test.describe("copy markdown exports raw markdown on template pages", () => {
  test("cookbook page wraps the body with the meta-prompt and injects local-bootstrap", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/ai-chat-app");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    // Meta-prompt blocks are present:
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("# Working with DevHub prompts");
    expect(copied).toContain("# What the user just did");
    expect(copied).toContain("# Verify your local Databricks dev environment");
    expect(copied).toContain("Databricks CLI");
    // Cookbook body comes after the meta-prompt, with its own frontmatter:
    expect(copied).toContain('title: "AI Chat App"');
    expect(copied).toContain("url: http://localhost");
    expect(copied).not.toContain("\n# AI Chat App\n");
    expect(copied).toContain("# The cookbook the user copied");
    // Agent mode: recipe goals as components
    expect(copied).toContain("## Component:");
  });

  test("multi-recipe cookbook body uses agent mode with component headings", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/app-with-lakebase");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain(
      "Follow these rules every time you act on a DevHub prompt.",
    );
    expect(copied).not.toContain(
      "Follow the repository instructions, ask for missing workspace details",
    );
    // Agent mode: recipe goals appear as labeled components, not full content
    expect(copied).toContain("## Component: Lakebase Data Persistence");
    expect(copied).toContain("---");

    const markdownResponse = await page.request.get(
      "/templates/app-with-lakebase.md",
    );
    expect(markdownResponse.status()).toBe(200);
    const routeMarkdown = await markdownResponse.text();
    const pageOrigin = new URL(page.url()).origin;
    expect(
      copied.replaceAll(pageOrigin, "https://developers.databricks.com"),
    ).toBe(routeMarkdown);
  });
});

test.describe("copy markdown exports raw markdown on example pages", () => {
  test("example detail page copies markdown content", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/agentic-support-console");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("# Agentic Support Console");
    expect(copied).toContain("Data Flow");
    expect(copied).toContain("Lakebase Change Data Feed");
  });

  test("saas-tracker example copies markdown content", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/saas-tracker");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("# SaaS Subscription Tracker");
    expect(copied).toContain("Data Flow");
  });

  // Full `pnpm test` runs `build` before Playwright; if you run `test:e2e`
  // alone, run `pnpm build` first so Next can serve the production output.
  test("Banner Copy prompt includes clone bash block and included templates preamble", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/agentic-support-console");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("## Get started");
    expect(copied).toContain("Run the command below");
    expect(copied).toContain("```bash");
    expect(copied).toContain(
      "git clone --depth 1 https://github.com/databricks/app-templates.git",
    );
    expect(copied).toContain("**`README.md`**");
    expect(copied).toContain("## Included templates");
    expect(copied).toContain(
      "These **templates** informed how this example was built",
    );
    expect(copied).toContain("### Clone and follow `README.md`");
  });

  test("Banner Copy prompt copies full prompt with bash and clone substeps", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/agentic-support-console");

    await clickCopyPromptAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("\n---\n\n# ");
    expect(copied).toContain("### Clone and follow `README.md`");
    expect(copied).toContain("```bash");
    expect(copied).toContain(
      "git clone --depth 1 https://github.com/databricks/app-templates.git",
    );
    expect(copied).toContain(
      "databricks apps init --template https://github.com/databricks/app-templates/tree/main/agentic-support-console",
    );
    expect(copied).toContain("README.md");
    expect(copied).not.toContain(
      "### 2. Provision or link existing Databricks resources",
    );
    expect(copied).not.toContain("1) Clone the repository locally");
  });
});

test.describe("copy markdown exports raw markdown on docs pages", () => {
  test("docs page copies raw markdown without the About DevHub preamble", async ({
    page,
  }) => {
    await expectCopyMarkdownWithoutPreamble({
      page,
      path: "/docs/start-here",
      expectedFragments: ["# Start here", "## Where to go next"],
    });
  });

  test("docs page opens the pretty raw markdown URL", async ({ page }) => {
    await page.goto("/docs/start-here", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: /copy (as|article)/i }).click();
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("menuitem", { name: "View Raw Markdown" }).click();
    const popup = await popupPromise;

    await expect.poll(() => popup.url()).toContain("/docs/start-here.md");
  });

  test("docs page copies the MCP config", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/start-here");

    await page.getByRole("button", { name: /copy (as|article)/i }).click();
    await page.getByRole("menuitem", { name: "Connect to MCP Server" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("MCP config copied")).toBeHidden();

    const copied = JSON.parse(await getCopiedText(page)) as {
      mcpServers: Record<string, { url: string }>;
    };
    const pageOrigin = new URL(page.url()).origin;
    const mcpUrl = copied.mcpServers["databricks-devhub"].url;
    expect(new URL(mcpUrl).origin).toBe(pageOrigin);
    expect(new URL(mcpUrl).pathname).toBe("/api/mcp");
  });

  test("raw-docs files are served for static and generated docs", async ({
    request,
  }) => {
    const response = await request.get("/raw-docs/start-here.md");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("# Start here");

    const appkitResponse = await request.get(
      "/raw-docs/appkit/v0/api/appkit-ui/ui/Calendar.md",
    );
    expect(appkitResponse.status()).toBe(200);
    expect(appkitResponse.headers()["content-type"]).toContain("text/markdown");
    expect(await appkitResponse.text()).toContain("# Calendar");
  });

  test("docs page with CLI tabs includes both code variants and no About preamble", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/lakebase/development");

    await clickCopyMarkdownAndWaitForCopiedState(page);

    const copied = await getCopiedText(page);
    expect(copied).not.toContain("# About DevHub");
    expect(copied).toContain('title="Common"');
    expect(copied).toContain('title="All Options"');
    expect(copied).toContain("databricks postgres create-branch");
  });
});

// Vercel rewrites pretty .md URLs to /api/markdown, and the Next postbuild
// emits static .md files for local development and Playwright coverage.
