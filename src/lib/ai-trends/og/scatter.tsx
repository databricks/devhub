import type { ReactNode } from "react";

import type { QualityAxis } from "@/lib/ai-trends/compute";
import type { BenchmarkModel } from "@/lib/ai-trends/schema";

import {
  BACKGROUND,
  CHART_HEIGHT,
  CHART_WIDTH,
  GRID,
  INK,
  MUTED,
  OgLabel,
} from "./frame";
import { formatUsd, linear, logScale, logTicks, shortName } from "./scale";

const PLOT = { left: 56, right: 12, top: 8, bottom: 30 };
const Y_STEP = 5;
const LOGO_SIZE = 26;
const FRONTIER_LOGO_SIZE = 32;

export function OgScatter({
  models,
  axis,
  paretoNames,
  logos,
}: {
  models: BenchmarkModel[];
  axis: QualityAxis;
  paretoNames: string[];
  /** Vendor name to logo image source; vendors without one get a dot. */
  logos: Record<string, string>;
}): ReactNode {
  const costs = models.map((m) => m.cost);
  const xMin = Math.min(...costs) * 0.55;
  const xMax = Math.max(...costs) * 1.25;
  const left = PLOT.left;
  const right = CHART_WIDTH - PLOT.right;
  const top = PLOT.top;
  const bottom = CHART_HEIGHT - PLOT.bottom;
  const x = logScale(xMin, xMax, left, right);
  const y = linear(axis.min, axis.max, bottom, top);
  const paretoSet = new Set(paretoNames);
  const pareto = models
    .filter((m) => paretoSet.has(m.name))
    .sort((a, b) => a.cost - b.cost);
  const yTicks: number[] = [];
  for (let v = axis.min; v <= axis.max; v += Y_STEP) yTicks.push(v);
  const xTicks = logTicks(xMin, xMax);
  const markerSize = (m: BenchmarkModel) =>
    paretoSet.has(m.name) ? FRONTIER_LOGO_SIZE : LOGO_SIZE;

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
      }}
    >
      <svg
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {yTicks.map((v) => (
          <line
            key={v}
            x1={left}
            x2={right}
            y1={y(v)}
            y2={y(v)}
            stroke={GRID}
            strokeWidth={1}
          />
        ))}
        {xTicks.map((v) => (
          <line
            key={v}
            x1={x(v)}
            x2={x(v)}
            y1={top}
            y2={bottom}
            stroke={GRID}
            strokeWidth={1}
          />
        ))}
        <polyline
          points={pareto.map((m) => `${x(m.cost)},${y(m.quality)}`).join(" ")}
          fill="none"
          stroke={INK}
          strokeWidth={2}
          strokeDasharray="7 6"
        />
        {models.map((m) =>
          logos[m.vendor] ? (
            // Background disc so the frontier line passes beneath the logo.
            <circle
              key={m.name}
              cx={x(m.cost)}
              cy={y(m.quality)}
              r={markerSize(m) / 2 + 1}
              fill={BACKGROUND}
            />
          ) : (
            <circle
              key={m.name}
              cx={x(m.cost)}
              cy={y(m.quality)}
              r={paretoSet.has(m.name) ? 9 : 7}
              fill={m.color}
              stroke={BACKGROUND}
              strokeWidth={1.5}
            />
          ),
        )}
      </svg>
      {models.map((m) => {
        const src = logos[m.vendor];
        if (!src) return null;
        const size = markerSize(m);
        return (
          <img
            key={m.name}
            src={src}
            alt=""
            width={size}
            height={size}
            style={{
              position: "absolute",
              left: x(m.cost) - size / 2,
              top: y(m.quality) - size / 2,
            }}
          />
        );
      })}
      {yTicks.map((v) => (
        <OgLabel
          key={v}
          x={left - 10}
          y={y(v)}
          align="right"
          width={40}
          size={15}
        >
          {v}
        </OgLabel>
      ))}
      {xTicks.map((v) => (
        <OgLabel
          key={v}
          x={x(v)}
          y={bottom + 16}
          align="center"
          width={80}
          size={15}
        >
          {formatUsd(v)}
        </OgLabel>
      ))}
      {pareto.map((m) => {
        const flip = x(m.cost) > (left + right) / 2;
        const below = !flip;
        return (
          <OgLabel
            key={m.name}
            x={x(m.cost) + (flip ? -16 : 16)}
            y={y(m.quality) + (below ? 24 : -24)}
            align={flip ? "right" : "left"}
            width={260}
            size={14}
            color={INK}
          >
            {shortName(m.name)}
          </OgLabel>
        );
      })}
      <OgLabel
        x={right}
        y={bottom - 10}
        align="right"
        width={300}
        size={13}
        color={MUTED}
      >
        Cost per task (log scale) →
      </OgLabel>
      <OgLabel x={left + 8} y={top + 10} width={300} size={13} color={MUTED}>
        ↑ Quality (pass rate %)
      </OgLabel>
    </div>
  );
}
