"use client";

import type { ReactNode } from "react";
import type { ChartConfiguration } from "chart.js";

import {
  axisTitle,
  CHART_BLUE,
  CHART_GRID,
  CHART_MUTED,
  ChartDataLabels,
} from "@/lib/ai-trends/chart-setup";
import { SPEND_MAX_TICKS } from "@/lib/ai-trends/compute";
import { formatSpendCentsTick, formatSpendTick } from "@/lib/ai-trends/format";
import { useChart } from "@/lib/ai-trends/use-chart";

function SpendPanel({
  canvasId,
  weeks,
  data,
  yMax,
  tickFmt,
  label,
}: {
  canvasId: string;
  weeks: string[];
  data: number[];
  yMax: number;
  tickFmt: (v: number) => string;
  label: string;
}): ReactNode {
  // A single period has no line to draw, so its point and value carry the panel.
  const single = data.length === 1;
  const { canvasRef } = useChart<"line">(
    (): ChartConfiguration<"line"> => ({
      type: "line",
      plugins: [ChartDataLabels],
      data: {
        labels: weeks,
        datasets: [
          {
            data,
            borderColor: CHART_BLUE,
            backgroundColor: CHART_BLUE + "33",
            fill: true,
            borderWidth: 2,
            pointRadius: single ? 5 : 0,
            pointBackgroundColor: CHART_BLUE,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: single ? 22 : 0 } },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) =>
                `$${c.parsed.y.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
            },
          },
          datalabels: single
            ? {
                display: true,
                align: "top",
                anchor: "end",
                offset: 6,
                color: "rgb(0, 0, 0)",
                font: { size: 13, weight: 600 },
                formatter: (v: number) =>
                  "$" +
                  v.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
              }
            : { display: false },
        },
        scales: {
          x: {
            offset: single,
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              color: CHART_MUTED,
              maxTicksLimit: 7,
              maxRotation: 0,
              autoSkipPadding: 12,
            },
          },
          y: {
            min: 0,
            suggestedMax: yMax,
            grid: { color: CHART_GRID },
            title: axisTitle("Spend per user (USD)"),
            ticks: {
              font: { size: 11 },
              color: CHART_MUTED,
              maxTicksLimit: SPEND_MAX_TICKS,
              callback: (v) =>
                tickFmt(typeof v === "number" ? v : parseFloat(String(v))),
            },
          },
        },
      },
    }),
    [weeks, data, yMax, tickFmt, single],
  );

  return (
    <div className="flex min-w-0 flex-col gap-2 pt-5 first:pt-0 md:pt-0 md:pr-8 md:last:pr-0">
      <p className="font-heading text-foreground text-center text-sm font-semibold">
        {label}
      </p>
      <div className="relative h-[200px]">
        <canvas id={canvasId} ref={canvasRef} />
      </div>
    </div>
  );
}

export function SpendCharts({
  weeks,
  series,
  maxes,
  labels,
}: {
  weeks: string[];
  series: { p50: number[]; p90: number[]; p99: number[] };
  maxes: { p50: number; p90: number; p99: number };
  labels: { p50: string; p90: string; p99: string };
}): ReactNode {
  return (
    <div className="divide-foreground/10 grid grid-cols-1 gap-6 divide-y md:grid-cols-3 md:gap-8 md:divide-x md:divide-y-0">
      <SpendPanel
        canvasId="spendP50"
        weeks={weeks}
        data={series.p50}
        yMax={maxes.p50}
        tickFmt={formatSpendCentsTick}
        label={labels.p50}
      />
      <SpendPanel
        canvasId="spendP90"
        weeks={weeks}
        data={series.p90}
        yMax={maxes.p90}
        tickFmt={formatSpendTick}
        label={labels.p90}
      />
      <SpendPanel
        canvasId="spendP99"
        weeks={weeks}
        data={series.p99}
        yMax={maxes.p99}
        tickFmt={formatSpendTick}
        label={labels.p99}
      />
    </div>
  );
}
