"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { ChartArea, ChartConfiguration, Plugin } from "chart.js";

import {
  CHART_MUTED,
  percentAxis,
  tickFont,
} from "@/lib/ai-trends/chart-setup";
import { getModelShades } from "@/lib/ai-trends/compute";
import type { ChartLayer, ProviderShareLayer } from "@/lib/ai-trends/compute";
import { useChart } from "@/lib/ai-trends/use-chart";
import { useSeriesHighlight } from "@/lib/ai-trends/use-series-highlight";

import { ChartLegend } from "./chart-legend";
import { ChartPointTooltip, useChartTooltip } from "./chart-tooltip";
import { ShareChartColumns } from "./share-chart-columns";
import type { WeekSelection } from "./share-chart-columns";
import { ShareModelLegend } from "./share-model-legend";

const BAR_WIDTH = 0.86;

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

/** Washes out every column but the hovered one, which keeps its colors. */
const dimOthersPlugin: Plugin<"bar"> = {
  id: "dimOthers",
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements()[0];
    if (!active) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.15)";
    chart.getDatasetMeta(0).data.forEach((bar, index) => {
      if (index === active.index) return;
      const { width } = bar.getProps(["width"]);
      ctx.fillRect(bar.x - width / 2, chartArea.top, width, chartArea.height);
    });
    ctx.restore();
  },
};

type StackedShareChartProps = {
  weeks: string[];
  canvasId: string;
  yAxisTitle: string;
  showHalfLine?: boolean;
} & (
  | { layers: ProviderShareLayer[]; metricLabel: string; byModel: boolean }
  | { layers: ChartLayer[]; tooltipTitle: string }
);

export function StackedShareChart(props: StackedShareChartProps): ReactNode {
  const { weeks, layers, canvasId, yAxisTitle, showHalfLine = false } = props;
  const grouped = "metricLabel" in props;
  const [plot, setPlot] = useState<ChartArea>();
  const [selected, setSelected] = useState<WeekSelection | null>(null);
  const byModel = grouped && props.byModel;
  const series = layers.map((layer) => ({
    label: "provider" in layer ? layer.provider : layer.label,
    color: layer.color,
    values: layer.values,
  }));
  // One dataset per series, or per model in the model view; a model keeps its
  // provider's label, so the legend focuses a provider's models together.
  const bars = layers.flatMap((layer, i) => {
    if (!byModel || !("models" in layer)) return [series[i]];
    const shades = getModelShades(layer.color, layer.models.length);
    return layer.models.map(({ values }, m) => ({
      label: layer.provider,
      color: shades[m],
      values,
    }));
  });
  const { tooltip, external } = useChartTooltip<"bar">((items) => ({
    title: grouped ? props.metricLabel : props.tooltipTitle,
    date: `Week of ${items[0].label}`,
    rows: items.map(({ datasetIndex, parsed }) => {
      const layer = layers[datasetIndex];
      return {
        label: "provider" in layer ? layer.provider : layer.label,
        value: `${parsed.y.toFixed(1)}%`,
        color: layer.color,
      };
    }),
  }));
  const { canvasRef, chartRef } = useChart<"bar">(
    (): ChartConfiguration<"bar"> => ({
      type: "bar",
      plugins: [
        {
          id: "shareColumns",
          afterLayout({ chartArea }) {
            if (!grouped) return;
            setPlot((current) =>
              current?.left === chartArea.left &&
              current?.top === chartArea.top &&
              current?.width === chartArea.width &&
              current?.height === chartArea.height
                ? current
                : chartArea,
            );
          },
        },
        ...(grouped ? [] : [dimOthersPlugin]),
        ...(showHalfLine ? [halfLinePlugin] : []),
      ],
      data: {
        labels: weeks,
        datasets: bars.map(({ label, color, values }, index) => ({
          label,
          data: values,
          backgroundColor: colorForSeries(label, color),
          // A white rule separates a segment from the one above it. The top
          // segment of a column has none, so the column meets the 100% line.
          borderColor: "#ffffff",
          borderSkipped: false,
          borderWidth: ({ dataIndex }) =>
            bars.slice(index + 1).some((bar) => bar.values[dataIndex] > 0)
              ? { top: 1, right: 0, bottom: 0, left: 0 }
              : 0,
          categoryPercentage: BAR_WIDTH,
          barPercentage: 1,
          datalabels: { display: false },
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...(grouped
          ? { events: [] }
          : { interaction: { mode: "index", intersect: true } }),
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false, external: grouped ? undefined : external },
          datalabels: { display: false },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { color: CHART_MUTED },
            ticks: { font: tickFont(), color: CHART_MUTED, maxRotation: 0 },
          },
          y: { stacked: true, ...percentAxis(yAxisTitle) },
        },
      },
    }),
    [weeks, layers, grouped, showHalfLine, yAxisTitle, byModel],
  );

  const { colorForSeries, ...highlight } = useSeriesHighlight(
    chartRef,
    bars,
    false,
  );
  const week = (grouped ? selected?.index : tooltip?.index) ?? weeks.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative h-72 min-w-0 lg:h-80">
        <canvas
          id={canvasId}
          ref={canvasRef}
          aria-hidden={grouped || undefined}
        />
        <ChartPointTooltip tooltip={tooltip} />
        {grouped && plot && (
          <ShareChartColumns
            weeks={weeks}
            layers={props.layers}
            plot={plot}
            metricLabel={props.metricLabel}
            detailsId={`${canvasId}-breakdown`}
            barWidth={BAR_WIDTH}
            selected={selected}
            onSelectedChange={setSelected}
            showModelColors={byModel}
            onlyProvider={highlight.pinned}
          />
        )}
      </div>
      {grouped && byModel ? (
        <ShareModelLegend
          layers={[...props.layers].reverse()}
          week={week}
          caption={weeks[week]}
          {...highlight}
        />
      ) : (
        <ChartLegend
          label={grouped ? undefined : props.layers[0]?.group}
          caption={weeks[week]}
          items={[...series].reverse().map(({ label, color, values }) => ({
            label,
            color,
            value: `${values[week].toFixed(1)}%`,
          }))}
          {...highlight}
        />
      )}
    </div>
  );
}
