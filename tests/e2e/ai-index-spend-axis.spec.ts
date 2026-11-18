import { expect, test } from "@playwright/test";

import { getSpendAxis } from "../../src/lib/ai-trends/compute";
import { industryData } from "../../src/lib/ai-trends/data";
import {
  formatSpendCentsTick,
  formatSpendTick,
} from "../../src/lib/ai-trends/format";

const PANELS = [
  { canvasId: "spendP50", key: "p50", format: formatSpendCentsTick },
  { canvasId: "spendP90", key: "p90", format: formatSpendTick },
  { canvasId: "spendP99", key: "p99", format: formatSpendTick },
] as const;

test("the spend share card uses the y ticks Chart.js draws on the page", async ({
  page,
}) => {
  // Chart.js draws tick labels with fillText, so record what each canvas draws.
  await page.addInitScript(() => {
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.drawnText = `${this.canvas.dataset.drawnText ?? ""}${text}\n`;
      }
      return fillText.call(this, text, ...rest);
    };
  });
  await page.goto("/ai-index");
  await page.locator('[id="spend"]').scrollIntoViewIfNeeded();

  for (const { canvasId, key, format } of PANELS) {
    const { max, step } = getSpendAxis(industryData.spend[key]);
    const expected = Array.from(
      { length: Math.round(max / step) + 1 },
      (_, i) => format(Math.round(i * step * 1e6) / 1e6),
    ).sort();
    await expect
      .poll(async () => {
        const drawn = await page
          .locator(`#${canvasId}`)
          .getAttribute("data-drawn-text");
        // Every label starting with "$" is a y tick; x ticks are week labels.
        return [
          ...new Set(drawn?.split("\n").filter((t) => t.startsWith("$"))),
        ].sort();
      })
      .toEqual(expected);
  }
});
