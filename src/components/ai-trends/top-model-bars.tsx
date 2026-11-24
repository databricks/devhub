import type { ReactNode } from "react";

import type { MetricBar } from "@/lib/ai-trends/compute";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";

type Unit = "percent" | "minutes" | "usd";

export type BarPanel = {
  title: string;
  caption: string;
  unit: Unit;
  bars: MetricBar[];
  missing: string[];
};

function formatValue(unit: Unit, value: number): string {
  if (unit === "percent") return `${value.toFixed(1)}%`;
  if (unit === "minutes") return `${value.toFixed(1)} min`;
  return `$${value.toFixed(2)}`;
}

function RankedPanel({ panel }: { panel: BarPanel }): ReactNode {
  const { title, caption, unit, bars, missing } = panel;
  // Pass rates share the 0-100 scale; time and cost run to the largest value.
  const scale =
    unit === "percent" ? 100 : Math.max(...bars.map(({ value }) => value));

  return (
    <div className="flex min-w-0 flex-col gap-5 py-8 first:pt-0 last:pb-0 xl:py-0 xl:pr-8 xl:last:pr-0">
      <div className="flex flex-col gap-1">
        <p className="text-lg/snug font-normal tracking-tight text-black md:text-xl/snug">
          {title}
        </p>
        <p className="text-grey-40 text-sm tracking-tight">{caption}</p>
      </div>
      <ol className="flex flex-col">
        {bars.map(({ label, harness, vendor, color, value }) => {
          const logo = getVendorLogo(vendor);
          return (
            <li key={label} className="flex flex-col">
              <div className="flex items-center gap-2 py-2.5 text-sm/none tracking-tight">
                {logo ? (
                  <img src={logo} alt="" className="size-4 shrink-0" />
                ) : (
                  <span
                    aria-hidden
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="truncate text-black">{label}</span>
                <span className="text-grey-40 min-w-0 flex-1 truncate text-xs/none">
                  {harness}
                </span>
                <span className="font-mono text-xs/none text-black tabular-nums">
                  {formatValue(unit, value)}
                </span>
              </div>
              {/* The row rule doubles as a meter of the row's value. */}
              <div aria-hidden className="h-0.5 bg-black/10">
                <div
                  className="h-full"
                  style={{
                    width: `${(value / scale) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ol>
      {missing.length > 0 ? (
        <p className="text-grey-40 text-sm tracking-tight">
          Not ranked, no timing data: {missing.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}

export function TopModelBars({ panels }: { panels: BarPanel[] }): ReactNode {
  return (
    <div className="divide-foreground/10 grid grid-cols-1 divide-y xl:grid-cols-3 xl:gap-8 xl:divide-x xl:divide-y-0">
      {panels.map((panel) => (
        <RankedPanel key={panel.title} panel={panel} />
      ))}
    </div>
  );
}
