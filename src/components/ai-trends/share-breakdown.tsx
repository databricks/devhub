import type { ReactNode } from "react";

import { getModelShades } from "@/lib/ai-trends/compute";
import type { ProviderShareLayer } from "@/lib/ai-trends/compute";

import { ChartTooltipHeader } from "./chart-tooltip";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
/** Rows below this share of the week would read as 0.0% and are left out. */
const MIN_SHARE = 0.05;

export function ShareBreakdown({
  layers,
  metricLabel,
  week,
  weekIndex,
  showModelColors,
  onlyProvider,
}: {
  layers: ProviderShareLayer[];
  metricLabel: string;
  week: string;
  weekIndex: number;
  /** Marks each model with its shade, when the chart draws models. */
  showModelColors: boolean;
  /** The provider pinned in the legend; the others are left out. */
  onlyProvider: string | null;
}): ReactNode {
  return (
    <>
      <ChartTooltipHeader title={metricLabel} date={`Week of ${week}`} />
      <ul className="divide-db-navy/15 divide-y px-3 text-sm">
        {[...layers]
          .reverse()
          .filter(
            ({ provider, values }) =>
              values[weekIndex] >= MIN_SHARE &&
              (onlyProvider === null || provider === onlyProvider),
          )
          .map(({ provider, color, values, models }) => {
            const shades = getModelShades(color, models.length);
            const shown = models
              .map((model, i) => ({ ...model, shade: shades[i] }))
              .filter((model) => model.values[weekIndex] >= MIN_SHARE)
              .sort((a, b) => b.values[weekIndex] - a.values[weekIndex]);
            return (
              <li key={provider} className="py-2.5">
                <div className="flex items-baseline justify-between gap-3 text-sm/none font-medium">
                  <span>{provider}</span>
                  <span className="font-mono tabular-nums">
                    {percent.format(values[weekIndex] / 100)}
                  </span>
                </div>
                <div aria-hidden className="bg-db-navy/10 mt-2 h-1">
                  <div
                    className="h-full"
                    style={{
                      width: `${values[weekIndex]}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                {shown.length > 0 ? (
                  <dl className="text-grey-40 mt-2 space-y-1 text-xs/4">
                    {shown.map(({ label, shade, values: modelValues }) => (
                      <div key={label} className="flex justify-between gap-3">
                        <dt className="flex min-w-0 items-center gap-1.5">
                          {showModelColors ? (
                            <span
                              aria-hidden
                              className="size-2 shrink-0"
                              style={{ backgroundColor: shade }}
                            />
                          ) : null}
                          <span className="truncate">{label}</span>
                        </dt>
                        <dd className="shrink-0 font-mono tabular-nums">
                          {percent.format(modelValues[weekIndex] / 100)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </li>
            );
          })}
      </ul>
    </>
  );
}
