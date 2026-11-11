"use client";

import type { ReactNode } from "react";
import type { ChartConfiguration } from "chart.js";

import {
  axisTitle,
  CHART_GRID,
  CHART_MUTED,
} from "@/lib/ai-trends/chart-setup";
import type { ChartLayer, LegendGroup } from "@/lib/ai-trends/compute";
import { useChart } from "@/lib/ai-trends/use-chart";

import { ShareLegend } from "./share-legend";

/**
 * Nested filled areas on a 0-100% axis: each layer fills down to zero, and
 * Chart.js draws the first dataset on top, so `layers` runs from the smallest
 * area to the largest.
 */
export function ShareAreaChart({
  weeks,
  layers,
  legend,
  canvasId,
  yAxisTitle,
}: {
  weeks: string[];
  layers: ChartLayer[];
  legend: LegendGroup[];
  canvasId: string;
  yAxisTitle: string;
}): ReactNode {
  const { canvasRef } = useChart<"line">(
    (): ChartConfiguration<"line"> => ({
      type: "line",
      data: {
        labels: weeks,
        datasets: layers.map((layer) => ({
          label: layer.tooltip,
          data: layer.values,
          borderColor: layer.color,
          backgroundColor: layer.color,
          fill: "origin",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.35,
          datalabels: { display: false },
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            itemSort: (a, b) => b.parsed.y - a.parsed.y,
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
            max: 100,
            grid: { color: CHART_GRID },
            ticks: {
              font: { size: 11 },
              color: CHART_MUTED,
              stepSize: 25,
              callback: (v) => `${v}%`,
            },
            title: axisTitle(yAxisTitle),
          },
        },
      },
    }),
    [weeks, layers],
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
      <div className="relative h-80 min-w-0 lg:flex-1">
        <canvas id={canvasId} ref={canvasRef} />
      </div>
      <div className="shrink-0 lg:w-44 lg:border-l lg:border-black/10 lg:pl-4">
        <ShareLegend groups={legend} />
      </div>
    </div>
  );
}
