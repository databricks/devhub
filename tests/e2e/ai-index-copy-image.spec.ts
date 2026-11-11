import { expect, test, type Locator, type Page } from "@playwright/test";

const SHARE_CARD = { width: 1200, height: 630 };
const CARDS = [
  "token-share",
  "wallet-share",
  "open-source-token-share",
  "open-source-wallet-share",
  "spend",
  "scatter",
];

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

/** Clicks Copy image on a chart card and returns the copied PNG's size. */
async function copyImage(
  page: Page,
  card: Locator,
): Promise<{ width: number; height: number }> {
  await expect(card.getByRole("status")).toHaveCount(0, { timeout: 5_000 });
  await page.evaluate(() => navigator.clipboard.writeText(""));
  await card.getByRole("button", { name: "More share options" }).click();
  await page.getByRole("menuitem", { name: "Copy image" }).click();
  await expect(card.getByRole("status")).toHaveText("Copied!", {
    timeout: 15_000,
  });
  const header = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    const blob = await item.getType("image/png");
    return Array.from(new Uint8Array(await blob.slice(0, 24).arrayBuffer()));
  });
  const view = new DataView(Uint8Array.from(header).buffer);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

test.describe("AI Index Copy image", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-index");
  });

  for (const id of CARDS) {
    test(`${id}: copies the share card`, async ({ page }) => {
      const card = page.locator(`[id="${id}"]`);
      await card.scrollIntoViewIfNeeded();
      expect(await copyImage(page, card)).toEqual(SHARE_CARD);
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
});
