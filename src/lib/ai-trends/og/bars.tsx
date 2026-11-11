import type { ReactNode } from "react";

import type { MetricBar } from "@/lib/ai-trends/compute";

const BAR_FILL = 0.7;

/** A top-N ranking as bare horizontal bars from zero, longest value full width. */
export function OgTopBars({
  bars,
  width,
  height,
}: {
  bars: MetricBar[];
  width: number;
  height: number;
}): ReactNode {
  const max = Math.max(...bars.map(({ value }) => value));
  const row = height / bars.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {bars.map((bar, i) => (
        <rect
          key={bar.label}
          x={0}
          y={i * row + (row * (1 - BAR_FILL)) / 2}
          width={(bar.value / max) * width}
          height={row * BAR_FILL}
          fill={bar.color}
        />
      ))}
    </svg>
  );
}
