"use client";

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  LogarithmicScale,
  PieController,
  PointElement,
  ScatterController,
  Tooltip,
} from "chart.js";

Chart.register(
  ScatterController,
  LineController,
  BarController,
  PieController,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export { default as ChartDataLabels } from "chartjs-plugin-datalabels";

export const CHART_GRID = "#EBEBEB";
export const CHART_MUTED = "#6B6B6B";
/** Series color for single-series line charts (spend): DevHub orange. */
export const CHART_SERIES = "#ff5f46";
/** Muted navy wash under the spend line. */
export const CHART_AREA_FILL = "rgba(11,32,38,0.05)";

/** Axis tick numerals in the site's mono face, as in its kickers. */
export function tickFont(size = 11) {
  const mono = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-mono")
    .trim();
  return { size, family: mono || "monospace" };
}

/** Axis title in the shared muted style; every chart axis on the page has one. */
export function axisTitle(text: string) {
  return { display: true, text, font: { size: 11 }, color: CHART_MUTED };
}

/** The 0-100% value axis the share charts have in common. */
export function percentAxis(title: string) {
  return {
    min: 0,
    max: 100,
    grid: { color: CHART_GRID },
    border: { display: false },
    ticks: {
      font: tickFont(),
      color: CHART_MUTED,
      stepSize: 25,
      callback: (v: string | number) => `${v}%`,
    },
    title: axisTitle(title),
  };
}

let defaultsApplied = false;

export function applyChartDefaults(): void {
  if (defaultsApplied) return;
  defaultsApplied = true;
  Chart.defaults.color = CHART_MUTED;
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  // A short settle instead of the one-second default, and none at all for
  // visitors who ask for reduced motion.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    Chart.defaults.animation = false;
  else if (Chart.defaults.animation) Chart.defaults.animation.duration = 350;
}
