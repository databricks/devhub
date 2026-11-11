import type { ReactNode } from "react";

import { CHART_HEIGHT, CHART_WIDTH, GRID, INK, MUTED, OgLabel } from "./frame";
import { linear } from "./scale";

type OgSeries = { label: string; color: string; values: number[] };

const PLOT = { left: 56, right: 14, top: 10, bottom: 32 };
// Same series color as the page line charts (CHART_BLUE in chart-setup.ts).
const LINE_BLUE = "#2a78d6";

function niceCeil(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

export function OgLines({
  weeks,
  series,
  yMax,
  yStep,
  formatY,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
  compact = false,
  fill = false,
}: {
  weeks: string[];
  series: OgSeries[];
  yMax?: number;
  yStep: number;
  formatY: (value: number) => string;
  width?: number;
  height?: number;
  compact?: boolean;
  /** Fill each series down to zero; series draw in order, so list the largest first. */
  fill?: boolean;
}): ReactNode {
  const plotLeft = compact ? 44 : PLOT.left;
  const plotRight = width - PLOT.right;
  const top = compact ? 10 : PLOT.top;
  const bottom = height - (compact ? 28 : PLOT.bottom);
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
        {ticks.map((v) => (
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
            {fill ? (
              <polygon
                points={[
                  `${x(0)},${bottom}`,
                  ...s.values.map((v, i) => `${x(i)},${y(v)}`),
                  `${x(s.values.length - 1)},${bottom}`,
                ].join(" ")}
                fill={s.color}
              />
            ) : null}
            <polyline
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={compact ? 3 : 4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {(compact && !single) || fill
              ? null
              : s.values.map((v, i) => (
                  <circle key={i} cx={x(i)} cy={y(v)} r={4.5} fill={s.color} />
                ))}
          </g>
        ))}
      </svg>
      {ticks.map((v) => (
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
        i % xEvery === 0 ? (
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
}: {
  weeks: string[];
  panels: { label: string; values: number[]; max: number; step: number }[];
}): ReactNode {
  const gap = 20;
  const panelWidth = (CHART_WIDTH - gap * (panels.length - 1)) / panels.length;
  return (
    <div style={{ display: "flex", width: CHART_WIDTH, height: CHART_HEIGHT }}>
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
          <OgLines
            weeks={weeks}
            series={[
              {
                label: p.label,
                color: LINE_BLUE,
                values: p.values,
              },
            ]}
            yMax={p.max}
            yStep={p.step}
            formatY={formatSpend}
            width={panelWidth}
            height={CHART_HEIGHT - 60}
            compact
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
