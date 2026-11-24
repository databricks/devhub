import type { ReactNode } from "react";

import type { QualityAxis } from "@/lib/ai-trends/compute";
import { placeLabels } from "@/lib/ai-trends/label-placement";
import type { BenchmarkModel } from "@/lib/ai-trends/schema";

import {
  CHART_HEIGHT,
  CHART_WIDTH,
  GRID,
  INK,
  LAVA,
  MUTED,
  OgLabel,
  PAPER,
} from "./frame";
import { formatUsd, linear, logScale, logTicks, shortName } from "./scale";

const PLOT = { left: 56, right: 12, top: 8, bottom: 30 };
const Y_STEP = 5;
const LOGO_SIZE = 22;
const FRONTIER_LOGO_SIZE = 28;
/** Paper disc behind a logo, so grid lines and the frontier don't cut it. */
const LOGO_HALO = 3;
const LABEL_SIZE = 14;
const LABEL_HEIGHT = LABEL_SIZE * 1.3;
const LABEL_OFFSET = 11;
/** The image renderer can't measure text; this is the label font's mean glyph width. */
const GLYPH_WIDTH = LABEL_SIZE * 0.6;

/**
 * The page's frontier chart without its controls: a logo per model, every
 * model named (frontier names darker), and the frontier as a solid line that
 * runs flat past the best model.
 */
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
  const xMax = Math.max(...costs) * 1.6;
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
  const frontier = pareto.map((m) => `${x(m.cost)},${y(m.quality)}`);
  const best = pareto.at(-1);
  if (best) frontier.push(`${right},${y(best.quality)}`);
  const yTicks: number[] = [];
  for (let v = axis.min; v <= axis.max; v += Y_STEP) yTicks.push(v);
  const xTicks = logTicks(xMin, xMax);
  const markerSize = (m: BenchmarkModel) =>
    paretoSet.has(m.name) ? FRONTIER_LOGO_SIZE : LOGO_SIZE;

  const placements = placeLabels(
    models.map((m) => ({
      x: x(m.cost),
      y: y(m.quality),
      width: shortName(m.name).length * GLYPH_WIDTH + 8,
      height: LABEL_HEIGHT,
      marker: markerSize(m) + LOGO_HALO * 2,
      priority: (paretoSet.has(m.name) ? 1000 : 0) + m.quality,
      required: true,
    })),
    { left, top, right, bottom },
    LABEL_OFFSET,
  );
  const labels = models.flatMap((m, i) => {
    const { box, hidden, leader } = placements[i];
    return box && !hidden ? [{ model: m, box, leader }] : [];
  });

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
          points={frontier.join(" ")}
          fill="none"
          stroke={LAVA}
          strokeWidth={2.5}
        />
        {labels.map(({ model, box, leader }) =>
          leader ? (
            <line
              key={model.name}
              x1={x(model.cost)}
              y1={y(model.quality)}
              x2={Math.min(Math.max(x(model.cost), box.left), box.right)}
              y2={Math.min(Math.max(y(model.quality), box.top), box.bottom)}
              stroke={MUTED}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ) : null,
        )}
        {models.map((m) =>
          logos[m.vendor] ? (
            <circle
              key={m.name}
              cx={x(m.cost)}
              cy={y(m.quality)}
              r={markerSize(m) / 2 + LOGO_HALO}
              fill={PAPER}
            />
          ) : (
            <circle
              key={m.name}
              cx={x(m.cost)}
              cy={y(m.quality)}
              r={paretoSet.has(m.name) ? 9 : 7}
              fill={m.color}
              stroke={PAPER}
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
          width={50}
          size={15}
        >
          {`${v}%`}
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
      {labels.map(({ model, box }) => (
        <OgLabel
          key={model.name}
          x={box.left + 4}
          y={(box.top + box.bottom) / 2}
          width={box.right - box.left}
          size={LABEL_SIZE}
          color={paretoSet.has(model.name) ? INK : MUTED}
          weight={paretoSet.has(model.name) ? 600 : 400}
        >
          {shortName(model.name)}
        </OgLabel>
      ))}
    </div>
  );
}
