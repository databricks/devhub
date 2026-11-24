import { useState } from "react";
import type { ReactNode } from "react";
import type { ChartType, TooltipItem, TooltipOptions } from "chart.js";

export const CHART_TOOLTIP_SURFACE =
  "border-db-navy w-64 rounded-none border bg-white text-sm text-[color:var(--db-navy)] shadow-[4px_4px_0_0_rgba(11,32,38,0.12)]";

type TooltipRow = {
  label: string;
  value: string;
  /** Swatch before the label, for a row that stands for a chart series. */
  color?: string;
  /** Image before the value, such as a provider logo. */
  icon?: string;
};
type TooltipContent = {
  title: string;
  date: string;
  rows: TooltipRow[];
  note?: string;
};
type TooltipPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Index of the hovered data point, when the tooltip follows the chart. */
  index?: number;
};
type PointTooltip = TooltipContent & TooltipPosition;

export function ChartTooltipHeader({
  title,
  date,
}: {
  title: string;
  date: string;
}): ReactNode {
  return (
    <div className="border-db-navy/15 bg-db-paper sticky top-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b px-3 py-2.5">
      <p className="text-sm/none font-medium tracking-tight">{title}</p>
      <span className="text-grey-40 font-mono text-xs/none whitespace-nowrap uppercase">
        {date}
      </span>
    </div>
  );
}

export function ChartPointTooltip({
  tooltip,
}: {
  tooltip: PointTooltip | null;
}): ReactNode {
  if (!tooltip) return null;
  const { x, y, width, height, title, date, rows, note } = tooltip;
  const panelWidth = Math.min(256, width);
  const above = y > height / 2;
  const left =
    x + panelWidth + 8 <= width ? x + 8 : Math.max(0, x - panelWidth - 8);

  return (
    <div
      role="tooltip"
      className={`${CHART_TOOLTIP_SURFACE} pointer-events-none absolute z-10`}
      style={{
        width: panelWidth,
        left,
        top: y + (above ? -8 : 8),
        transform: above ? "translateY(-100%)" : undefined,
      }}
    >
      <ChartTooltipHeader title={title} date={date} />
      <dl className="space-y-1 px-3 py-2.5 text-xs/5">
        {rows.map(({ label, value, color, icon }) => (
          <div
            className="flex items-baseline justify-between gap-3"
            key={label}
          >
            <dt className="flex items-center gap-2">
              {color && (
                <span
                  aria-hidden
                  className="size-2 shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
              {label}
            </dt>
            <dd className="flex shrink-0 items-center gap-1.5 font-mono tabular-nums">
              {icon && <img src={icon} alt="" className="size-3.5 shrink-0" />}
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {note && (
        <p className="border-db-navy/15 border-t px-3 py-2 text-xs font-medium">
          {note}
        </p>
      )}
    </div>
  );
}

export function useChartTooltip<T extends ChartType>(
  content: (items: TooltipItem<T>[]) => TooltipContent,
) {
  const [tooltip, setTooltip] = useState<PointTooltip | null>(null);
  const external: TooltipOptions<T>["external"] = ({
    chart,
    tooltip: model,
  }) => {
    if (!model.opacity || !model.dataPoints?.length) {
      setTooltip(null);
      return;
    }
    setTooltip({
      ...content(model.dataPoints),
      index: model.dataPoints[0].dataIndex,
      x: model.caretX,
      y: model.caretY,
      width: chart.width,
      height: chart.height,
    });
  };
  return { tooltip, external };
}
