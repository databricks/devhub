"use client";

import type { ReactNode } from "react";
import type { Chart, ChartConfiguration, Plugin } from "chart.js";

import {
  CHART_GRID,
  CHART_MUTED,
  ChartDataLabels,
} from "@/lib/ai-trends/chart-setup";
import type { MetricBar } from "@/lib/ai-trends/compute";
import { useChart } from "@/lib/ai-trends/use-chart";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";

const LOGO_SIZE = 18;
const TICK_FONT_SIZE = 11;
/** Room between a model name and its bar, where the logo sits. */
const TICK_PADDING = LOGO_SIZE + 8;

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
            ticks: { font: { size: 10 }, color: CHART_MUTED, maxTicksLimit: 5 },
          },
          y: {
            grid: { display: false },
            // The bars' own category gaps already clear the first and last
            // names, so drop the extra room Chart.js reserves above and below.
            afterFit(scale) {
              scale.paddingTop = 0;
              scale.paddingBottom = 0;
              // Chart.js caps the axis width on narrow canvases and clips the
              // names; keep it wide enough for the longest one in full.
              const { ctx } = scale;
              ctx.save();
              ctx.font = `${TICK_FONT_SIZE}px ${getComputedStyle(scale.chart.canvas).fontFamily}`;
              const widest = Math.max(
                ...bars.flatMap(({ label }) =>
                  [wrapLabel(label)]
                    .flat()
                    .map((line) => ctx.measureText(line).width),
                ),
              );
              ctx.restore();
              // Plus the 8px tick mark length Chart.js still reserves, and a margin.
              scale.width = Math.max(scale.width, widest + TICK_PADDING + 12);
            },
            ticks: {
              padding: TICK_PADDING,
              autoSkip: false,
              font: { size: TICK_FONT_SIZE },
              color: CHART_MUTED,
            },
          },
        },
      },
    }),
    [bars, unit],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1 py-8 first:pt-0 last:pb-0 xl:py-0 xl:pr-8 xl:last:pr-0">
      <p className="text-xl/snug font-normal tracking-tight text-black md:text-2xl/snug">
        {title}
      </p>
      <p className="text-grey-40 text-sm tracking-tight">{caption}</p>
      <div className="relative mt-3 h-[300px] xl:h-[360px]">
        <canvas id={canvasId} ref={canvasRef} />
      </div>
      {/* In HTML, not on the canvas: Chart.js squeezes an axis title that is
          wider than the plot, which it always is on a phone. */}
      <p className="text-grey-40 text-center text-xs">{axis}</p>
      {missing.length > 0 ? (
        <p className="text-grey-40 text-sm tracking-tight">
          Not ranked, no timing data: {missing.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}

export function TopModelBars({ panels }: { panels: BarPanel[] }): ReactNode {
  return (
    <div className="divide-foreground/10 grid grid-cols-1 divide-y xl:grid-cols-3 xl:gap-8 xl:divide-x xl:divide-y-0">
      {panels.map((panel) => (
        <BarChartPanel key={panel.canvasId} panel={panel} />
      ))}
    </div>
  );
}
