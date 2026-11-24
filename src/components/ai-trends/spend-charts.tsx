"use client";

import type { ReactNode } from "react";
import type { ChartConfiguration } from "chart.js";

import {
  axisTitle,
  CHART_AREA_FILL,
  CHART_GRID,
  CHART_MUTED,
  CHART_SERIES,
  ChartDataLabels,
  tickFont,
} from "@/lib/ai-trends/chart-setup";
import { SPEND_MAX_TICKS } from "@/lib/ai-trends/compute";
import { formatSpendCentsTick, formatSpendTick } from "@/lib/ai-trends/format";
import { hoverGuidePlugin } from "@/lib/ai-trends/hover-guide";
import { useChart } from "@/lib/ai-trends/use-chart";

import { ChartPointTooltip, useChartTooltip } from "./chart-tooltip";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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
  const { tooltip, external } = useChartTooltip<"line">(([item]) => ({
    title: `${label} weekly spend`,
    date: `Week of ${item.label}`,
    rows: [{ label: "Spend per user", value: usd.format(item.parsed.y) }],
  }));
  const { canvasRef } = useChart<"line">(
    (): ChartConfiguration<"line"> => ({
      type: "line",
      plugins: [ChartDataLabels, hoverGuidePlugin],
      data: {
        labels: weeks,
        datasets: [
          {
            data,
            borderColor: CHART_SERIES,
            backgroundColor: CHART_AREA_FILL,
            fill: true,
            borderWidth: 2,
            pointRadius: single ? 5 : 0,
            pointBackgroundColor: CHART_SERIES,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: CHART_SERIES,
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 2,
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
          tooltip: { enabled: false, external },
          datalabels: single
            ? {
                display: true,
                align: "top",
                anchor: "end",
                offset: 6,
                color: "rgb(0, 0, 0)",
                font: { size: 13, weight: 600 },
                formatter: (v: number) => usd.format(v),
              }
            : { display: false },
        },
        scales: {
          x: {
            offset: single,
            grid: { display: false },
            border: { color: CHART_MUTED },
            ticks: {
              font: tickFont(),
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
            border: { display: false },
            title: axisTitle("Spend per user (USD)"),
            ticks: {
              font: tickFont(),
              color: CHART_MUTED,
              maxTicksLimit: SPEND_MAX_TICKS,
              callback: (v) =>
                tickFmt(typeof v === "number" ? v : parseFloat(String(v))),
            },
          },
        },
      },
    }),
    [weeks, data, yMax, tickFmt, single, label],
  );

  return (
    <div className="flex min-w-0 flex-col gap-2 pt-6 pb-5 first:pt-0 last:pb-0 md:py-0 md:pr-8 md:last:pr-0">
      <p className="text-grey-40 font-mono text-sm/none font-medium uppercase">
        {label}
      </p>
      <div className="relative h-[200px]">
        <canvas id={canvasId} ref={canvasRef} />
        <ChartPointTooltip tooltip={tooltip} />
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
    <div className="divide-foreground/10 grid grid-cols-1 divide-y md:grid-cols-3 md:gap-8 md:divide-x md:divide-y-0">
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
