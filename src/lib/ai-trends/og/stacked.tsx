import type { ReactNode } from "react";

import type { LegendGroup, StackLayer } from "@/lib/ai-trends/compute";

import { CHART_HEIGHT, CHART_WIDTH, GRID, INK, OgLabel, PAPER } from "./frame";
import { linear } from "./scale";

const PLOT = { left: 48, right: 250, top: 8, bottom: 30 };
const BARE_PLOT = { left: 0, right: 0, top: 0, bottom: 0 };
const BAR_FILL = 0.78;
const LEGEND_ROW = 20;

export function OgStackedBars({
  weeks,
  layers,
  legend,
  metric,
  showHalfLine,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
  bare = false,
}: {
  weeks: string[];
  layers: StackLayer[];
  legend: LegendGroup[];
  metric: "token" | "wallet";
  showHalfLine: boolean;
  width?: number;
  height?: number;
  /** Bars only: no axis labels, gridlines, or legend. */
  bare?: boolean;
}): ReactNode {
  const plot = bare ? BARE_PLOT : PLOT;
  const plotRight = width - plot.right;
  const bottom = height - plot.bottom;
  const y = linear(0, 100, bottom, plot.top);
  const slot = (plotRight - plot.left) / weeks.length;
  const barWidth = slot * BAR_FILL;
  const ticks = [0, 25, 50, 75, 100];
  const xEvery = Math.ceil(weeks.length / 8);
  const legendRows = legend.reduce((n, g) => n + g.items.length + 1, 0);
  const rowHeight = Math.min(LEGEND_ROW, height / legendRows);

  const bars = weeks.map((_, week) => {
    let base = 0;
    return layers.map((layer) => {
      const value = layer[metric][week] ?? 0;
      const rect = {
        key: `${week}-${layer.label}`,
        x: plot.left + slot * week + (slot - barWidth) / 2,
        y: y(base + value),
        height: y(base) - y(base + value),
        color: layer.color,
      };
      base += value;
      return rect;
    });
  });

  let legendTop = 0;
  const legendRowsLayout = legend.flatMap((group) => {
    const rows = [
      {
        key: group.provider,
        label: group.provider,
        color: null,
        top: legendTop,
      },
      ...group.items.map((item, i) => ({
        key: `${group.provider}-${item.label}`,
        label: item.label,
        color: item.color,
        top: legendTop + (i + 1) * rowHeight,
      })),
    ];
    legendTop += rows.length * rowHeight;
    return rows;
  });

  const barRects = bars
    .flat()
    .map(({ key, ...rect }) => (
      <rect
        key={key}
        x={rect.x}
        y={rect.y}
        width={barWidth}
        height={rect.height}
        fill={rect.color}
        stroke={PAPER}
        strokeWidth={0.75}
      />
    ));

  if (bare) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {barRects}
      </svg>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width,
        height,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((v) => (
          <line
            key={v}
            x1={plot.left}
            x2={plotRight}
            y1={y(v)}
            y2={y(v)}
            stroke={GRID}
            strokeWidth={1}
          />
        ))}
        {barRects}
        {showHalfLine ? (
          <line
            x1={plot.left}
            x2={plotRight}
            y1={y(50)}
            y2={y(50)}
            stroke={INK}
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
        ) : null}
      </svg>
      {ticks.map((v) => (
        <OgLabel
          key={v}
          x={plot.left - 8}
          y={y(v)}
          align="right"
          width={44}
          size={14}
        >
          {`${v}%`}
        </OgLabel>
      ))}
      {weeks.map((w, i) =>
        i % xEvery === 0 ? (
          <OgLabel
            key={w}
            x={plot.left + slot * i + slot / 2}
            y={bottom + 16}
            align="center"
            width={70}
            size={14}
          >
            {w}
          </OgLabel>
        ) : null,
      )}
      {legendRowsLayout.map((row) => (
        <div
          key={row.key}
          style={{
            position: "absolute",
            left: plotRight + 18,
            top: row.top,
            height: rowHeight,
            display: "flex",
            alignItems: "center",
            fontSize: row.color ? 13 : 14,
            fontWeight: row.color ? 400 : 700,
            color: INK,
            whiteSpace: "nowrap",
          }}
        >
          {row.color ? (
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                marginRight: 8,
                background: row.color,
              }}
            />
          ) : null}
          {row.label}
        </div>
      ))}
    </div>
  );
}
