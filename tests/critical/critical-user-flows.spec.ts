import { expect, test, type Page } from "@playwright/test";

import { criticalUserFlowContracts as contracts } from "./critical-user-flow-contracts";

type TestWindow = Window & {
  __clipboardWriteAttempts?: number;
  __copiedText?: string;
};

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

function installClipboardMock(page: Page, failedWrites = 0): Promise<void> {
  return page.addInitScript((writesToFail) => {
    const testWindow = window as TestWindow;
    testWindow.__clipboardWriteAttempts = 0;

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          testWindow.__clipboardWriteAttempts =
            (testWindow.__clipboardWriteAttempts ?? 0) + 1;

          if (testWindow.__clipboardWriteAttempts <= writesToFail) {
            throw new Error("Simulated clipboard failure");
          }

          testWindow.__copiedText = value;
        },
      },
    });
  }, failedWrites);
}

function getCopiedText(page: Page): Promise<string> {
  return page.evaluate(() => (window as TestWindow).__copiedText ?? "");
}

function parseMcpResponse(contentType: string, body: string): unknown {
  if (!contentType.includes("text/event-stream")) {
    return JSON.parse(body);
  }

  const dataLine = body.split("\n").find((line) => line.startsWith("data: "));

  if (!dataLine) {
    throw new Error(`Expected an SSE data line, received: ${body}`);
  }

  return JSON.parse(dataLine.slice("data: ".length));
}

test.describe("critical user flows", () => {
  test(`${contracts.bootstrapPrompt.id} copies a usable bootstrap prompt from the home page`, async ({
    page,
  }) => {
    const pageErrors = collectPageErrors(page);
    await installClipboardMock(page);

    const response = await page.goto(contracts.bootstrapPrompt.route, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Build agentic applications/,
      }),
    ).toBeVisible();

    const copyButton = page
      .locator("main")
      .getByRole("button", { name: "Copy agent prompt" })
      .first();
    await expect(copyButton).toBeEnabled();
    await copyButton.click();
    await expect(
      page.locator("main").getByRole("button", { name: "Copied" }).first(),
    ).toBeVisible();

    const copiedPrompt = await getCopiedText(page);
    for (const fragment of contracts.bootstrapPrompt.requiredPromptFragments) {
      expect(copiedPrompt).toContain(fragment);
    }
    expect(pageErrors).toEqual([]);
  });

  test(`${contracts.docsSearchAndExport.id} finds docs with the keyboard and exports useful Markdown`, async ({
    page,
  }, testInfo) => {
    const pageErrors = collectPageErrors(page);
    await installClipboardMock(page);
    await page.goto("/");

    if (testInfo.project.name.startsWith("mobile-")) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(page.locator("#devhub-main-content")).toHaveJSProperty(
        "inert",
        true,
      );
    }

    await page.getByRole("button", { name: "Search documentation" }).click();

    const searchDialog = page.getByRole("dialog", {
      name: "Search documentation",
    });
    const searchInput = searchDialog.getByPlaceholder(
      "What are you searching for?",
    );
    await expect(searchInput).toBeFocused();
    await searchInput.fill(contracts.docsSearchAndExport.query);
    await expect(
      searchDialog.getByRole("option", {
        name: /Databricks CLI/i,
      }),
    ).toBeVisible();
    await searchInput.press("Enter");

    await expect(page).toHaveURL(
      new RegExp(`${contracts.docsSearchAndExport.route}$`),
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: contracts.docsSearchAndExport.query,
      }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /copy (as|article)/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Copy Markdown" }).click();
    await expect(
      page.getByRole("button", { name: "Copied" }).first(),
    ).toBeVisible();

    const copiedMarkdown = await getCopiedText(page);
    for (const fragment of contracts.docsSearchAndExport
      .requiredMarkdownFragments) {
      expect(copiedMarkdown).toContain(fragment);
    }
    expect(copiedMarkdown).not.toContain("# About DevHub");
    expect(pageErrors).toEqual([]);
  });

  test(`${contracts.templateDiscoveryAndHandoff.id} discovers a template and produces agent handoffs`, async ({
    page,
  }) => {
    const pageErrors = collectPageErrors(page);
    await installClipboardMock(page);
    await page.goto("/templates");

    await page
      .getByRole("searchbox")
      .fill(contracts.templateDiscoveryAndHandoff.query);
    await page
      .getByRole("link", {
        name: `Read ${contracts.templateDiscoveryAndHandoff.title}`,
      })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`${contracts.templateDiscoveryAndHandoff.route}$`),
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: contracts.templateDiscoveryAndHandoff.title,
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Copy prompt" }).first().click();
    await expect(
      page.getByRole("button", { name: "Copied!" }).first(),
    ).toBeVisible();

    const copiedPrompt = await getCopiedText(page);
    for (const fragment of contracts.templateDiscoveryAndHandoff
      .requiredPromptFragments) {
      expect(copiedPrompt).toContain(fragment);
    }

    await page.getByRole("button", { name: "Open prompt in" }).click();
    const replitItem = page.getByRole("menuitem", { name: "Replit" });
    await expect(replitItem).toBeVisible();
    const replitHref = await replitItem.getAttribute("href");
    expect(replitHref).toBeTruthy();

    const replitUrl = new URL(replitHref!);
    expect(`${replitUrl.origin}${replitUrl.pathname}`).toBe(
      "https://replit.com/",
    );
    expect(replitUrl.searchParams.get("stack")).toBe("Build");
    expect(replitUrl.searchParams.get("prompt")?.length).toBeGreaterThan(50);
    expect(pageErrors).toEqual([]);
  });

  test(`${contracts.copyRecovery.id} recovers after a clipboard failure`, async ({
    page,
  }) => {
    const pageErrors = collectPageErrors(page);
    await installClipboardMock(page, 1);
    await page.goto(contracts.copyRecovery.route);

    const copyButton = page
      .getByRole("button", { name: "Copy prompt" })
      .first();
    await copyButton.click();
    await expect(
      page.getByRole("button", { name: "Try again" }).first(),
    ).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).first().click();
    await expect(
      page.getByRole("button", { name: "Copied!" }).first(),
    ).toBeVisible();
    await expect
      .poll(() => getCopiedText(page))
      .toContain(contracts.templateDiscoveryAndHandoff.title);
    expect(pageErrors).toEqual([]);
  });

  test(`${contracts.agentEntryPoints.id} serves the entry points used by coding agents`, async ({
    request,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chromium",
      "The browser-independent API contract only needs one execution.",
    );

    const bootstrapResponse = await request.get("/api/bootstrap-prompt");
    expect(bootstrapResponse.status()).toBe(200);
    expect(bootstrapResponse.headers()["content-type"]).toContain(
      "text/markdown",
    );
    expect(await bootstrapResponse.text()).toContain("# About DevHub");

    const llmsResponse = await request.get("/llms.txt");
    expect(llmsResponse.status()).toBe(200);
    expect(await llmsResponse.text()).toContain("Databricks");

    const rawDocsResponse = await request.get("/raw-docs/start-here.md");
    expect(rawDocsResponse.status()).toBe(200);
    expect(rawDocsResponse.headers()["content-type"]).toContain(
      "text/markdown",
    );
    expect(await rawDocsResponse.text()).toContain("# Start here");

    const mcpResponse = await request.post("/api/mcp", {
      data: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      },
      headers: {
        Accept: "application/json, text/event-stream",
      },
    });
    expect(mcpResponse.status()).toBe(200);

    const mcpPayload = parseMcpResponse(
      mcpResponse.headers()["content-type"] ?? "",
      await mcpResponse.text(),
    ) as {
      result: { tools: Array<{ name: string }> };
    };
    expect(mcpPayload.result.tools.map(({ name }) => name).sort()).toEqual(
      [...contracts.agentEntryPoints.mcpTools].sort(),
    );
  });
});
