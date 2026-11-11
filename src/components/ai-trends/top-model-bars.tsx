"use client";

import type { ReactNode } from "react";
import type { Chart, ChartConfiguration, Plugin } from "chart.js";

import {
  axisTitle,
  CHART_GRID,
  CHART_MUTED,
  ChartDataLabels,
} from "@/lib/ai-trends/chart-setup";
import type { MetricBar } from "@/lib/ai-trends/compute";
import { useChart } from "@/lib/ai-trends/use-chart";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";

const LOGO_SIZE = 18;

type Unit = "percent" | "minutes" | "usd";

export type BarPanel = {
  canvasId: string;
  title: string;
  caption: string;
  axis: string;
  unit: Unit;
  bars: MetricBar[];
  missing: string[];
};

function formatValue(unit: Unit, value: number): string {
  if (unit === "percent") return `${value.toFixed(1)}%`;
  if (unit === "minutes") return `${value.toFixed(1)} min`;
  return `$${value.toFixed(2)}`;
}

/** Draws each bar's provider logo just left of the model-name axis. */
function logoAxisPlugin(bars: MetricBar[]): Plugin<"bar"> {
  const logos = bars.map(({ vendor }) => {
    const src = getVendorLogo(vendor);
    if (!src) return null;
    const img = new Image(LOGO_SIZE, LOGO_SIZE);
    img.src = src;
    return img;
  });
  return {
    id: "logoAxis",
    afterDraw(chart: Chart<"bar">) {
      const y = chart.scales.y;
      logos.forEach((img, i) => {
        if (!img) return;
        if (!img.complete) {
          img.onload = () => chart.draw();
          return;
        }
        chart.ctx.drawImage(
          img,
          y.right - LOGO_SIZE - 4,
          y.getPixelForTick(i) - LOGO_SIZE / 2,
          LOGO_SIZE,
          LOGO_SIZE,
        );
      });
    },
  };
}

/** Splits a long model name over two lines so it fits beside its bar. */
function wrapLabel(label: string): string | string[] {
  if (label.length <= 18) return label;
  const cut = label.lastIndexOf(" ", 18);
  return cut > 0 ? [label.slice(0, cut), label.slice(cut + 1)] : label;
}

function BarChartPanel({ panel }: { panel: BarPanel }): ReactNode {
  const { canvasId, title, caption, axis, unit, bars, missing } = panel;
  const { canvasRef } = useChart<"bar">(
    (): ChartConfiguration<"bar"> => ({
      type: "bar",
      plugins: [ChartDataLabels, logoAxisPlugin(bars)],
      data: {
        labels: bars.map(({ label }) => wrapLabel(label)),
        datasets: [
          {
            data: bars.map(({ value }) => value),
            backgroundColor: bars.map(({ color }) => color),
            borderRadius: 3,
            maxBarThickness: 18,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 52 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const bar = bars[items[0]?.dataIndex ?? 0];
                return bar ? `${bar.label} (${bar.harness})` : "";
              },
              label: (c) => formatValue(unit, Number(c.raw)),
            },
          },
          datalabels: {
            anchor: "end",
            align: "right",
            offset: 4,
            clamp: false,
            clip: false,
            color: "rgb(0, 0, 0)",
            font: { size: 10, weight: 600 },
            formatter: (v: number) => formatValue(unit, v),
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: CHART_GRID },
            title: axisTitle(axis),
            ticks: { font: { size: 10 }, color: CHART_MUTED, maxTicksLimit: 5 },
          },
          y: {
            grid: { display: false },
            ticks: {
              padding: LOGO_SIZE + 8,
              autoSkip: false,
              font: { size: 11 },
              color: CHART_MUTED,
            },
          },
        },
      },
    }),
    [bars, unit, axis],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1 pt-5 first:pt-0 lg:pt-0 lg:pr-8 lg:last:pr-0">
      <p className="font-heading text-lg font-medium tracking-[-0.01em] text-black">
        {title}
      </p>
      <p className="text-foreground/65 text-xs">{caption}</p>
      <div className="relative mt-3 h-[360px]">
        <canvas id={canvasId} ref={canvasRef} />
      </div>
      {missing.length > 0 ? (
        <p className="text-xs text-black/60">
          Not ranked, no timing data: {missing.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}

export function TopModelBars({ panels }: { panels: BarPanel[] }): ReactNode {
  return (
    <div className="divide-foreground/10 grid grid-cols-1 gap-8 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      {panels.map((panel) => (
        <BarChartPanel key={panel.canvasId} panel={panel} />
      ))}
    </div>
  );
}
