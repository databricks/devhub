"use client";

import type { ReactNode } from "react";
import type { ChartConfiguration } from "chart.js";

import {
  CHART_MUTED,
  percentAxis,
  tickFont,
} from "@/lib/ai-trends/chart-setup";
import type { ChartLayer } from "@/lib/ai-trends/compute";
import { hoverGuidePlugin } from "@/lib/ai-trends/hover-guide";
import { useChart } from "@/lib/ai-trends/use-chart";
import { useSeriesHighlight } from "@/lib/ai-trends/use-series-highlight";

import { ChartLegend } from "./chart-legend";
import { ChartPointTooltip, useChartTooltip } from "./chart-tooltip";

/**
 * Nested filled areas on a 0-100% axis: each layer fills down to zero, and
 * Chart.js draws the first dataset on top, so `layers` runs from the smallest
 * area to the largest.
 */
export function ShareAreaChart({
  weeks,
  layers,
  canvasId,
  yAxisTitle,
}: {
  weeks: string[];
  layers: ChartLayer[];
  canvasId: string;
  yAxisTitle: string;
}): ReactNode {
  const { tooltip, external } = useChartTooltip<"line">((items) => ({
    title: "Model providers used",
    date: `Week of ${items[0].label}`,
    rows: items.map(({ datasetIndex, parsed }) => ({
      label: layers[datasetIndex].label,
      value: `${parsed.y.toFixed(1)}%`,
      color: layers[datasetIndex].color,
    })),
  }));
  const { canvasRef, chartRef } = useChart<"line">(
    (): ChartConfiguration<"line"> => ({
      type: "line",
      plugins: [hoverGuidePlugin],
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
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
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
            enabled: false,
            external,
            itemSort: (a, b) => b.parsed.y - a.parsed.y,
          },
          datalabels: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: CHART_MUTED },
            ticks: {
              font: tickFont(),
              color: CHART_MUTED,
              maxRotation: 0,
              autoSkipPadding: 12,
            },
          },
          y: percentAxis(yAxisTitle),
        },
      },
    }),
    [weeks, layers],
  );

  const highlight = useSeriesHighlight(chartRef, layers, true);
  const week = tooltip?.index ?? weeks.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative h-72 min-w-0 lg:h-80">
        <canvas id={canvasId} ref={canvasRef} />
        <ChartPointTooltip tooltip={tooltip} />
      </div>
      <ChartLegend
        label={layers[0]?.group}
        caption={weeks[week]}
        items={[...layers].reverse().map(({ label, color, values }) => ({
          label,
          color,
          value: `${values[week].toFixed(1)}%`,
        }))}
        {...highlight}
      />
    </div>
  );
}
