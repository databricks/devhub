import type { ReactNode } from "react";

import { CHART_HEIGHT, CHART_WIDTH, GRID, INK, MUTED, OgLabel } from "./frame";
import { linear } from "./scale";

type OgSeries = { label: string; color: string; values: number[] };

const PLOT = { left: 56, right: 14, top: 10, bottom: 32 };
// Same series color as the page spend charts (spend-charts.tsx).
const SPEND_COLOR = "#2a78d6";

function niceCeil(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

function OgLines({
  weeks,
  series,
  yMax,
  yStep,
  formatY,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
  compact = false,
  bare = false,
}: {
  weeks: string[];
  series: OgSeries[];
  yMax?: number;
  yStep: number;
  formatY: (value: number) => string;
  width?: number;
  height?: number;
  compact?: boolean;
  bare?: boolean;
}): ReactNode {
  const stroke = compact ? 3 : 4;
  const plotLeft = bare ? stroke : compact ? 44 : PLOT.left;
  const plotRight = width - (bare ? stroke : PLOT.right);
  const top = bare ? stroke : compact ? 10 : PLOT.top;
  const bottom = height - (bare ? stroke : compact ? 28 : PLOT.bottom);
  const max =
    yMax ?? niceCeil(Math.max(...series.flatMap((s) => s.values)), yStep);
  const single = weeks.length === 1;
  const x = single
    ? () => (plotLeft + plotRight) / 2
    : linear(0, weeks.length - 1, plotLeft, plotRight);
  const y = linear(0, max, bottom, top);
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += yStep) ticks.push(v);
  const size = compact ? 13 : 15;
  const xEvery = compact
    ? Math.ceil(weeks.length / 4)
    : Math.ceil(weeks.length / 8);

  return (
    <div style={{ display: "flex", position: "relative", width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {(bare ? [0] : ticks).map((v) => (
          <line
            key={v}
            x1={plotLeft}
            x2={plotRight}
            y1={y(v)}
            y2={y(v)}
            stroke={GRID}
            strokeWidth={1}
          />
        ))}
        {series.map((s) => (
          <g key={s.label}>
            <polyline
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {compact && !single
              ? null
              : s.values.map((v, i) => (
                  <circle key={i} cx={x(i)} cy={y(v)} r={4.5} fill={s.color} />
                ))}
          </g>
        ))}
      </svg>
      {(bare ? [] : ticks).map((v) => (
        <OgLabel
          key={v}
          x={plotLeft - 8}
          y={y(v)}
          align="right"
          width={48}
          size={size}
        >
          {formatY(v)}
        </OgLabel>
      ))}
      {weeks.map((w, i) =>
        !bare && i % xEvery === 0 ? (
          <OgLabel
            key={w}
            x={x(i)}
            y={bottom + 16}
            align="center"
            width={70}
            size={size}
          >
            {w}
          </OgLabel>
        ) : null,
      )}
    </div>
  );
}

export function OgSpendPanels({
  weeks,
  panels,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
  bare = false,
}: {
  weeks: string[];
  panels: { label: string; values: number[]; max: number; step: number }[];
  width?: number;
  height?: number;
  /** One line per panel: no panel titles, latest values, or axis labels. */
  bare?: boolean;
}): ReactNode {
  const gap = bare ? 24 : 20;
  const panelWidth = (width - gap * (panels.length - 1)) / panels.length;
  return (
    <div style={{ display: "flex", width, height }}>
      {panels.map((p, i) => (
        <div
          key={p.label}
          style={{
            display: "flex",
            flexDirection: "column",
            width: panelWidth,
            marginRight: i < panels.length - 1 ? gap : 0,
          }}
        >
          {bare ? null : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 600,
                color: INK,
                marginBottom: 6,
              }}
            >
              {p.label}
            </div>
          )}
          {bare ? null : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: 15,
                color: MUTED,
                marginBottom: 4,
              }}
            >
              {`Latest ${formatSpend(p.values[p.values.length - 1])}`}
            </div>
          )}
          <OgLines
            weeks={weeks}
            series={[
              {
                label: p.label,
                color: SPEND_COLOR,
                values: p.values,
              },
            ]}
            yMax={p.max}
            yStep={p.step}
            formatY={formatSpend}
            width={panelWidth}
            height={bare ? height : height - 60}
            compact
            bare={bare}
          />
        </div>
      ))}
    </div>
  );
}

function formatSpend(value: number): string {
  if (value >= 1000)
    return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  if (value >= 10) return `$${value.toFixed(0)}`;
  return `$${value.toFixed(value % 1 === 0 ? 0 : 1)}`;
}
