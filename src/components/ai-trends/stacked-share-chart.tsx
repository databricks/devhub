"use client";

import type { ReactNode } from "react";
import type { ChartConfiguration, Plugin } from "chart.js";

import {
  axisTitle,
  CHART_GRID,
  CHART_MUTED,
} from "@/lib/ai-trends/chart-setup";
import type { ChartLayer, LegendGroup } from "@/lib/ai-trends/compute";
import { useChart } from "@/lib/ai-trends/use-chart";

import { ShareLegend } from "./share-legend";

const halfLinePlugin: Plugin<"bar"> = {
  id: "halfLine",
  afterDatasetsDraw(chart) {
    const yScale = chart.scales["y"];
    const xScale = chart.scales["x"];
    if (!yScale || !xScale) return;
    const y50 = yScale.getPixelForValue(50);
    const { ctx } = chart;
    ctx.save();
    ctx.strokeStyle = "rgba(12,12,12,.55)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(xScale.left, y50);
    ctx.lineTo(xScale.right, y50);
    ctx.stroke();
    ctx.restore();
  },
};

export function StackedShareChart({
  weeks,
  layers,
  legend,
  canvasId,
  yAxisTitle,
  showHalfLine = false,
}: {
  weeks: string[];
  layers: ChartLayer[];
  legend: LegendGroup[];
  canvasId: string;
  yAxisTitle: string;
  showHalfLine?: boolean;
}): ReactNode {
  const { canvasRef } = useChart<"bar">(
    (): ChartConfiguration<"bar"> => ({
      type: "bar",
      plugins: showHalfLine ? [halfLinePlugin] : [],
      data: {
        labels: weeks,
        datasets: layers.map((layer) => ({
          label: layer.tooltip,
          data: layer.values,
          backgroundColor: layer.color,
          borderColor: "#ffffff",
          borderWidth: 1,
          categoryPercentage: 0.86,
          barPercentage: 1,
          datalabels: { display: false },
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: true },
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
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 11 }, color: CHART_MUTED, maxRotation: 0 },
          },
          y: {
            stacked: true,
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
    [weeks, layers, showHalfLine],
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
