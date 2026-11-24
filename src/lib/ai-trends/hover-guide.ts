import { PointElement } from "chart.js";
import type { Plugin } from "chart.js";

import { CHART_MUTED } from "./chart-setup";

/**
 * Dashed vertical guide through the hovered week of a line chart. It is drawn
 * over the filled areas, so it runs the full height of the plot, and the
 * hovered points are then redrawn on top of it.
 */
export const hoverGuidePlugin: Plugin<"line"> = {
  id: "hoverGuide",
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements();
    if (active.length === 0) return;
    const { ctx, chartArea } = chart;
    const { x } = active[0].element;
    ctx.save();
    ctx.lineWidth = 1;
    // A pale line under the dashes keeps the guide readable on dark fills.
    for (const [color, dash] of [
      ["rgba(255,255,255,0.6)", []],
      [CHART_MUTED, [3, 3]],
    ] as const) {
      ctx.strokeStyle = color;
      ctx.setLineDash([...dash]);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
    }
    ctx.restore();
    active.forEach(({ element }) => {
      if (element instanceof PointElement) element.draw(ctx, chartArea);
    });
  },
};
