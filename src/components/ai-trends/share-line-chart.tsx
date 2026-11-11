"use client";

import type { ReactNode } from "react";
import type { ChartConfiguration } from "chart.js";

import {
  axisTitle,
  CHART_BLUE,
  CHART_GRID,
  CHART_MUTED,
} from "@/lib/ai-trends/chart-setup";
import { useChart } from "@/lib/ai-trends/use-chart";

/** One weekly percentage as a filled line, in the spend charts' style. */
export function ShareLineChart({
  weeks,
  values,
  yMax,
  label,
  canvasId,
  yAxisTitle,
}: {
  weeks: string[];
  values: number[];
  yMax: number;
  label: string;
  canvasId: string;
  yAxisTitle: string;
}): ReactNode {
  const { canvasRef } = useChart<"line">(
    (): ChartConfiguration<"line"> => ({
      type: "line",
      data: {
        labels: weeks,
        datasets: [
          {
            label,
            data: values,
            borderColor: CHART_BLUE,
            backgroundColor: CHART_BLUE + "33",
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: CHART_BLUE,
            tension: 0.35,
            datalabels: { display: false },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) =>
                `${item.dataset.label}: ${item.parsed.y.toFixed(1)}%`,
            },
          },
          datalabels: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              color: CHART_MUTED,
              maxRotation: 0,
              autoSkipPadding: 12,
            },
          },
          y: {
            min: 0,
            suggestedMax: yMax,
            grid: { color: CHART_GRID },
            ticks: {
              font: { size: 11 },
              color: CHART_MUTED,
              callback: (v) => `${v}%`,
            },
            title: axisTitle(yAxisTitle),
          },
        },
      },
    }),
    [weeks, values, yMax, label],
  );

  return (
    <div className="relative h-80 min-w-0">
      <canvas id={canvasId} ref={canvasRef} />
    </div>
  );
}
