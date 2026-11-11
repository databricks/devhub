import {
  axisTitle,
  CHART_GRID,
  CHART_MUTED,
} from "@/lib/ai-trends/chart-setup";
import type { QualityAxis } from "@/lib/ai-trends/compute";

export type DatalabelsCtx = {
  dataset: { data: unknown[] };
  dataIndex: number;
};

export const SCATTER_POINT_STYLES = {
  borderColor: "#FFFFFF",
  borderWidth: 1.5,
  pointRadius: 7,
  pointHoverRadius: 9,
} as const;

export function computeCostRange(models: { cost: number }[]) {
  const allCosts = models.map((m) => m.cost);
  return {
    xMin:
      allCosts.length > 0 ? Math.max(0.05, Math.min(...allCosts) * 0.55) : 0.05,
    xMax: allCosts.length > 0 ? Math.max(...allCosts) * 2.2 : 10,
  };
}

const NICE_TICKS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];

export function costXScale(xMin: number, xMax: number) {
  return {
    type: "logarithmic" as const,
    min: xMin,
    max: xMax,
    grid: { color: CHART_GRID },
    title: axisTitle("Cost per task (USD, log scale)"),
    ticks: {
      callback(v: number | string) {
        const val = Number(v);
        for (const n of NICE_TICKS) {
          if (Math.abs(val - n) / n < 0.01) return `$${n}`;
        }
        return null;
      },
      font: { size: 11 },
      color: CHART_MUTED,
    },
  };
}

export function qualityYScale(axis: QualityAxis, title: string) {
  return {
    min: axis.min,
    max: axis.max,
    grid: { color: CHART_GRID },
    title: axisTitle(title),
    ticks: {
      stepSize: 5,
      callback: (v: number | string) => `${v}%`,
      font: { size: 11 },
      color: CHART_MUTED,
    },
  };
}
