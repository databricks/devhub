import type { ReactNode } from "react";

import type { ChartLayer } from "@/lib/ai-trends/compute";

import {
  CHART_HEIGHT,
  CHART_WIDTH,
  GRID,
  INK,
  MUTED,
  OG_LEGEND_HEIGHT,
  OgLabel,
  OgLegend,
  PAPER,
} from "./frame";
import type { OgLegendData } from "./frame";
import { linear } from "./scale";

const PLOT = { left: 52, right: 0, top: 8, bottom: 30 };
const PLOT_HEIGHT = CHART_HEIGHT - OG_LEGEND_HEIGHT;
const BAR_FILL = 0.86;

/** Weekly 100% stacked columns over a legend row, as on the page. */
export function OgStackedBars({
  weeks,
  layers,
  legend,
  showHalfLine,
}: {
  weeks: string[];
  layers: ChartLayer[];
  legend: OgLegendData;
  showHalfLine: boolean;
}): ReactNode {
  const plotRight = CHART_WIDTH - PLOT.right;
  const bottom = PLOT_HEIGHT - PLOT.bottom;
  const y = linear(0, 100, bottom, PLOT.top);
  const slot = (plotRight - PLOT.left) / weeks.length;
  const barWidth = slot * BAR_FILL;
  const ticks = [0, 25, 50, 75, 100];
  const xEvery = Math.ceil(weeks.length / 8);

  const bars = weeks.map((_, week) => {
    let base = 0;
    return layers.map((layer) => {
      const value = layer.values[week] ?? 0;
      const rect = {
        key: `${week}-${layer.label}`,
        x: PLOT.left + slot * week + (slot - barWidth) / 2,
        y: y(base + value),
        height: y(base) - y(base + value),
        color: layer.color,
        // A rule separates a segment from the one above it; the top segment
        // of a column has none, so the column meets the 100% line.
        capped: layers
          .slice(layers.indexOf(layer) + 1)
          .some((above) => (above.values[week] ?? 0) > 0),
      };
      base += value;
      return rect;
    });
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          width: CHART_WIDTH,
          height: PLOT_HEIGHT,
        }}
      >
        <svg
          width={CHART_WIDTH}
          height={PLOT_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${PLOT_HEIGHT}`}
        >
          {ticks.map((v) => (
            <line
              key={v}
              x1={PLOT.left}
              x2={plotRight}
              y1={y(v)}
              y2={y(v)}
              stroke={v === 0 ? MUTED : GRID}
              strokeWidth={1}
            />
          ))}
          {bars.flat().map(({ key, ...rect }) => (
            <rect
              key={key}
              x={rect.x}
              y={rect.y}
              width={barWidth}
              height={rect.height}
              fill={rect.color}
            />
          ))}
          {bars
            .flat()
            .map(({ key, ...rect }) =>
              rect.capped && rect.height > 0 ? (
                <line
                  key={key}
                  x1={rect.x}
                  x2={rect.x + barWidth}
                  y1={rect.y}
                  y2={rect.y}
                  stroke={PAPER}
                  strokeWidth={1}
                />
              ) : null,
            )}
          {showHalfLine ? (
            <line
              x1={PLOT.left}
              x2={plotRight}
              y1={y(50)}
              y2={y(50)}
              stroke={INK}
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
          ) : null}
        </svg>
        {ticks.map((v) => (
          <OgLabel
            key={v}
            x={PLOT.left - 10}
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
              x={PLOT.left + slot * i + slot / 2}
              y={bottom + 16}
              align="center"
              width={70}
              size={14}
            >
              {w}
            </OgLabel>
          ) : null,
        )}
      </div>
      <OgLegend {...legend} />
    </div>
  );
}
