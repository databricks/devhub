import { readFile } from "node:fs/promises";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { getShareSlugs } from "../../src/lib/ai-trends/share-cards";

const SHARE_CARD = { width: 1200, height: 630 };
// Every chart with a share card, so a new chart can't skip these checks.
const CARDS = getShareSlugs();

// Playwright only knows clipboard permissions in Chromium; Firefox and WebKit
// allow the write on a click.
test.use({
  permissions: async ({ browserName }, use) => {
    await use(
      browserName === "chromium" ? ["clipboard-read", "clipboard-write"] : [],
    );
  },
});

function pngSize(header: Uint8Array): { width: number; height: number } {
  const view = new DataView(header.buffer, header.byteOffset, 24);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

async function clickCopyImage(page: Page, card: Locator): Promise<void> {
  await expect(card.getByRole("status")).toHaveCount(0, { timeout: 5_000 });
  await card.getByRole("button", { name: "More share options" }).click();
  await page.getByRole("menuitem", { name: "Copy image" }).click();
}

/** Clicks Copy image on a chart card and returns the copied PNG's size. */
async function copyImage(
  page: Page,
  card: Locator,
): Promise<{ width: number; height: number }> {
  await page.evaluate(() => navigator.clipboard.writeText(""));
  await clickCopyImage(page, card);
  await expect(card.getByRole("status")).toHaveText("Copied!", {
    timeout: 15_000,
  });
  const header = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    const blob = await item.getType("image/png");
    return Array.from(new Uint8Array(await blob.slice(0, 24).arrayBuffer()));
  });
  return pngSize(Uint8Array.from(header));
}

test.describe("AI Index Copy image", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-index");
  });

  for (const id of CARDS) {
    test(
      `${id}: copies the share card`,
      { tag: "@cross-browser" },
      async ({ page, browserName }) => {
        const card = page.locator(`[id="${id}"]`);
        await card.scrollIntoViewIfNeeded();
        if (browserName === "chromium") {
          expect(await copyImage(page, card)).toEqual(SHARE_CARD);
          return;
        }
        // Headless Firefox reads images back from its own clipboard as empty
        // blobs and WebKit denies clipboard reads, so only the write result
        // is checked there.
        const downloads: string[] = [];
        page.on("download", (download) =>
          downloads.push(download.suggestedFilename()),
        );
        await clickCopyImage(page, card);
        await expect(card.getByRole("status")).toHaveText("Copied!", {
          timeout: 15_000,
        });
        expect(downloads).toEqual([]);
      },
    );
  }

  for (const id of CARDS) {
    test(`${id}: share links and Copy link point at its share page`, async ({
      page,
    }) => {
      const shareUrl = new URL(`/ai-index/share/${id}`, page.url()).href;
      await page.evaluate(() => {
        const opened: string[] = [];
        Object.assign(window, { __opened: opened });
        window.open = (url) => {
          opened.push(String(url));
          return null;
        };
      });
      const card = page.locator(`[id="${id}"]`);
      await card.scrollIntoViewIfNeeded();

      await card.getByRole("button", { name: "Share on X" }).click();
      await card.getByRole("button", { name: "More share options" }).click();
      await page.getByRole("menuitem", { name: "LinkedIn" }).click();
      const [x, linkedIn] = await page.evaluate(
        () => (window as unknown as { __opened: string[] }).__opened,
      );
      expect(new URL(x).searchParams.get("url")).toBe(shareUrl);
      expect(new URL(linkedIn).searchParams.get("url")).toBe(shareUrl);

      await card.getByRole("button", { name: "More share options" }).click();
      await page.getByRole("menuitem", { name: "Copy link" }).click();
      await expect(card.getByRole("status")).toHaveText("Copied!");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        shareUrl,
      );
    });
  }

  test("a filtered scatter copies the filtered canvas", async ({ page }) => {
    const card = page.locator('[id="scatter"]');
    await card.scrollIntoViewIfNeeded();
    await card.getByRole("button", { name: "Anthropic", exact: true }).click();
    // The canvas copy is the chart's backing store plus 24 CSS px of padding
    // on each side, scaled the same way.
    const expectedWidth = await card.locator("canvas").evaluate((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)) throw new Error("No canvas");
      const scale = canvas.width / canvas.getBoundingClientRect().width;
      return canvas.width + 2 * 24 * scale;
    });
    const filtered = await copyImage(page, card);
    expect(filtered.width).toBe(expectedWidth);
    expect(filtered).not.toEqual(SHARE_CARD);

    await card.getByRole("button", { name: "All", exact: true }).click();
    expect(await copyImage(page, card)).toEqual(SHARE_CARD);
  });

  test.describe("when the browser rejects the clipboard write", () => {
    // Headless Chromium rejects clipboard writes without the permission.
    test.use({ permissions: [] });

    test("Copy image downloads the share card instead", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const card = page.locator('[id="token-share"]');
      await card.scrollIntoViewIfNeeded();

      const download = page.waitForEvent("download");
      await clickCopyImage(page, card);
      const file = await download;

      expect(file.suggestedFilename()).toBe(
        "databricks-ai-index-token-share.png",
      );
      expect(pngSize(await readFile(await file.path()))).toEqual(SHARE_CARD);
      await expect(card.getByRole("status")).toHaveText(
        "Copy unavailable, image downloaded",
      );
      expect(errors).toContainEqual(
        expect.stringContaining("Copy image failed, downloading it instead"),
      );
    });
  });
});
