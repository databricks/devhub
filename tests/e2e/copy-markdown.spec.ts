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

async function clickCopyPromptAndWaitForToast(
  page: import("@playwright/test").Page,
) {
  const button = page.getByRole("button", { name: "Copy prompt" }).first();
  await button.waitFor({ state: "visible" });
  await button.click();
  await expect(page.getByText("Prompt copied")).toBeVisible({ timeout: 5000 });
}

test.describe("copy markdown exports raw markdown on recipe pages", () => {
  test("recipe detail page copies goal content with agent prompt wrapper", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/set-up-your-local-dev-environment");

    await clickCopyPromptAndWaitForToast(page);

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

    await clickCopyPromptAndWaitForToast(page);

    const copied = await getCopiedText(page);
    // Meta-prompt blocks are present:
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("# Working with DevHub prompts");
    expect(copied).toContain("# What the user just did");
    expect(copied).toContain("# Verify your local Databricks dev environment");
    expect(copied).toContain("Databricks CLI");
    // Cookbook body comes after the meta-prompt, with its own frontmatter:
    expect(copied).toContain('title: "AI Chat App"');
    expect(copied).toContain("# The cookbook the user copied");
    // Agent mode: recipe goals as components
    expect(copied).toContain("## Component:");
  });

  test("multi-recipe cookbook body uses agent mode with component headings", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/app-with-lakebase");

    await clickCopyPromptAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    // Agent mode: recipe goals appear as labeled components, not full content
    expect(copied).toContain("## Component: Lakebase Data Persistence");
    expect(copied).toContain("---");
  });
});

test.describe("copy markdown exports raw markdown on example pages", () => {
  test("example detail page copies markdown content", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/agentic-support-console");

    await clickCopyPromptAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("# Agentic Support Console");
    expect(copied).toContain("Data Flow");
    expect(copied).toContain("Lakehouse Sync");
  });

  test("saas-tracker example copies markdown content", async ({ page }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/saas-tracker");

    await clickCopyPromptAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).toContain("# About DevHub");
    expect(copied).toContain("# SaaS Subscription Tracker");
    expect(copied).toContain("Data Flow");
  });

  // Full `npm run test` runs `build` before Playwright; if you run `test:e2e`
  // alone, run `npm run build` first so `docusaurus serve` is not stale.
  test("Banner Copy prompt includes clone bash block and included templates preamble", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/templates/agentic-support-console");

    await clickCopyPromptAndWaitForToast(page);

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

    await clickCopyPromptAndWaitForToast(page);

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

test.describe("copy markdown exports raw markdown on solution pages", () => {
  test("solution detail page copies actual markdown without the About DevHub preamble", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/solutions/devhub-launch");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).not.toContain("# About DevHub");
    expect(copied).not.toContain("/llms.txt");
    expect(copied).toContain("**developers.databricks.com**");
    expect(copied).toContain('title: "Introducing DevHub"');
  });
});

test.describe("copy markdown exports raw markdown on docs pages", () => {
  test("docs page copies raw markdown without the About DevHub preamble", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/start-here");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).not.toContain("# About DevHub");
    expect(copied).not.toContain("/llms.txt");
    expect(copied).toContain("# Start here");
    expect(copied).toContain("## Where to go next");
  });

  test("raw-docs static files are served", async ({ request }) => {
    const response = await request.get("/raw-docs/start-here.md");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("# Start here");
  });

  test("docs page with CLI tabs includes both code variants and no About preamble", async ({
    page,
  }) => {
    await setupClipboardMock(page);
    await page.goto("/docs/lakebase/development");

    await clickCopyMarkdownAndWaitForToast(page);

    const copied = await getCopiedText(page);
    expect(copied).not.toContain("# About DevHub");
    expect(copied).toContain('title="Common"');
    expect(copied).toContain('title="All Options"');
    expect(copied).toContain("databricks postgres create-branch");
  });
});

// Note: the /docs/*.md, /templates/*.md, /solutions/*.md routes themselves
// are Vercel rewrites to /api/markdown, exercised end-to-end by the unit
// tests in tests/api-markdown.test.ts (`/api/markdown about-devhub preamble
// policy`). Playwright runs against `docusaurus serve`, which doesn't run
// Vercel functions, so we cover the markdown endpoints there instead.
