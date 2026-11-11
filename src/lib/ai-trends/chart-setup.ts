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

/** Axis title in the shared muted style; every chart axis on the page has one. */
export function axisTitle(text: string) {
  return { display: true, text, font: { size: 11 }, color: CHART_MUTED };
}

let defaultsApplied = false;

export function applyChartDefaults(): void {
  if (defaultsApplied) return;
  defaultsApplied = true;
  Chart.defaults.color = CHART_MUTED;
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
}
