import type { ReactNode } from "react";

import { CHART_HEIGHT, CHART_WIDTH, GRID, INK, MUTED, OgLabel } from "./frame";
import { linear } from "./scale";

type OgSeries = { label: string; color: string; values: number[] };

const PLOT = { left: 56, right: 14, top: 10, bottom: 32 };
// Same series color as the page line charts (CHART_BLUE in chart-setup.ts).
const LINE_BLUE = "#2a78d6";

/** Filled lines down to zero; series draw in order, so list the largest first. */
export function OgLines({
  weeks,
  series,
  yMax,
  yStep,
  formatY,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
}: {
  weeks: string[];
  series: OgSeries[];
  yMax: number;
  yStep: number;
  formatY: (value: number) => string;
  width?: number;
  height?: number;
}): ReactNode {
  const plotLeft = PLOT.left;
  const plotRight = width - PLOT.right;
  const top = PLOT.top;
  const bottom = height - PLOT.bottom;
  const x =
    weeks.length === 1
      ? () => (plotLeft + plotRight) / 2
      : linear(0, weeks.length - 1, plotLeft, plotRight);
  const y = linear(0, yMax, bottom, top);
  const ticks: number[] = [];
  for (let v = 0; v <= yMax + 1e-9; v += yStep) ticks.push(v);
  const size = 15;
  const xEvery = Math.ceil(weeks.length / 8);

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
            <polygon
              points={[
                `${x(0)},${bottom}`,
                ...s.values.map((v, i) => `${x(i)},${y(v)}`),
                `${x(s.values.length - 1)},${bottom}`,
              ].join(" ")}
              fill={s.color}
            />
            <polyline
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
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

type SpendPanel = {
  label: string;
  values: number[];
  max: number;
  step: number;
  formatY: (value: number) => string;
};

type Point = { x: number; y: number };

/** Chart.js `tension` spline through the points, so the card curves like the page. */
function splinePath(
  points: Point[],
  tension: number,
  top: number,
  bottom: number,
): string {
  const clampY = (y: number) => Math.min(bottom, Math.max(top, y));
  const controls = points.map((cur, i) => {
    const prev = points[i - 1] ?? cur;
    const next = points[i + 1] ?? cur;
    const d01 = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const d12 = Math.hypot(next.x - cur.x, next.y - cur.y);
    const total = d01 + d12 || 1;
    const fa = (tension * d01) / total;
    const fb = (tension * d12) / total;
    return {
      before: {
        x: cur.x - fa * (next.x - prev.x),
        y: clampY(cur.y - fa * (next.y - prev.y)),
      },
      after: {
        x: cur.x + fb * (next.x - prev.x),
        y: clampY(cur.y + fb * (next.y - prev.y)),
      },
    };
  });
  return points
    .map((p, i) =>
      i === 0
        ? `M${p.x},${p.y}`
        : `C${controls[i - 1].after.x},${controls[i - 1].after.y} ${controls[i].before.x},${controls[i].before.y} ${p.x},${p.y}`,
    )
    .join(" ");
}

const SPEND_LABEL_HEIGHT = 40;
const SPEND_AXIS_TITLE = "Spend per user (USD)";

function OgSpendArea({
  weeks,
  panel,
  width,
  height,
}: {
  weeks: string[];
  panel: SpendPanel;
  width: number;
  height: number;
}): ReactNode {
  const size = 15;
  const plotLeft = 78;
  const plotRight = width - 24;
  const top = SPEND_LABEL_HEIGHT + 10;
  const bottom = height - 30;
  const last = weeks.length - 1;
  const x = linear(0, Math.max(1, last), plotLeft, plotRight);
  const y = linear(0, panel.max, bottom, top);
  const ticks: number[] = [];
  for (let v = 0; v <= panel.max + 1e-9; v += panel.step) ticks.push(v);
  const points = panel.values.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = splinePath(points, 0.35, top, bottom);
  const area = `${line} L${points[points.length - 1].x},${bottom} L${points[0].x},${bottom} Z`;
  const xTicks = [...new Set([0, Math.round(last / 2), last])];
  const axisTitleLength = bottom - top;

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
        <line
          x1={plotLeft}
          x2={plotLeft}
          y1={top}
          y2={bottom}
          stroke={GRID}
          strokeWidth={1}
        />
        <path d={area} fill={LINE_BLUE} fillOpacity={0.2} />
        <path
          d={line}
          fill="none"
          stroke={LINE_BLUE}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <OgLabel
        x={(plotLeft + plotRight) / 2}
        y={SPEND_LABEL_HEIGHT / 2}
        align="center"
        width={plotRight - plotLeft}
        size={20}
        weight={600}
        color={INK}
      >
        {panel.label}
      </OgLabel>
      <div
        style={{
          position: "absolute",
          left: 12 - axisTitleLength / 2,
          top: (top + bottom) / 2 - 10,
          width: axisTitleLength,
          height: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 14,
          color: MUTED,
          whiteSpace: "nowrap",
          transform: "rotate(-90deg)",
        }}
      >
        {SPEND_AXIS_TITLE}
      </div>
      {ticks.map((v) => (
        <OgLabel
          key={v}
          x={plotLeft - 8}
          y={y(v)}
          align="right"
          width={52}
          size={size}
        >
          {panel.formatY(v)}
        </OgLabel>
      ))}
      {xTicks.map((i) => (
        <OgLabel
          key={weeks[i]}
          x={x(i)}
          y={bottom + 18}
          align="center"
          width={70}
          size={size}
        >
          {weeks[i]}
        </OgLabel>
      ))}
    </div>
  );
}

/** Median, P90 and P99 side by side, each a filled line on its own axis, like the page. */
export function OgSpendPanels({
  weeks,
  panels,
}: {
  weeks: string[];
  panels: SpendPanel[];
}): ReactNode {
  const gap = 24;
  const panelWidth = (CHART_WIDTH - gap * (panels.length - 1)) / panels.length;
  return (
    <div style={{ display: "flex", width: CHART_WIDTH, height: CHART_HEIGHT }}>
      {panels.map((p, i) => (
        <div key={p.label} style={{ display: "flex" }}>
          {i > 0 ? (
            <div
              style={{
                display: "flex",
                width: 1,
                height: CHART_HEIGHT,
                marginLeft: (gap - 1) / 2,
                marginRight: (gap - 1) / 2,
                background: GRID,
              }}
            />
          ) : null}
          <OgSpendArea
            weeks={weeks}
            panel={p}
            width={panelWidth}
            height={CHART_HEIGHT}
          />
        </div>
      ))}
    </div>
  );
}
