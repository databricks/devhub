import type { ReactNode } from "react";

import { getModelShades } from "@/lib/ai-trends/compute";
import type { ProviderShareLayer } from "@/lib/ai-trends/compute";
import { cn } from "@/lib/utils";

/**
 * Legend for a share chart drawn by model: one group per provider, in the
 * same style as `ChartLegend`. The provider name is the control (hover or
 * press to focus its models); each model shows its shade and its share for
 * the week in `caption`.
 */
export function ShareModelLegend({
  layers,
  week,
  caption,
  highlighted,
  pinned,
  onHover,
  onToggle,
}: {
  /** Provider layers, top of the stack first. */
  layers: ProviderShareLayer[];
  week: number;
  caption: string;
  highlighted: string | null;
  pinned: string | null;
  onHover: (label: string | null) => void;
  onToggle: (label: string) => void;
}): ReactNode {
  return (
    <div className="relative border-t border-black/10 pt-4">
      <ul aria-label="Chart legend" className="flex min-w-0 flex-col gap-4">
        {layers.map(({ provider, color, values, models }) => {
          const shades = getModelShades(color, models.length);
          const dimmed = highlighted !== null && highlighted !== provider;
          return (
            <li
              key={provider}
              className={cn(
                "flex flex-col gap-1.5 transition-opacity",
                dimmed && "opacity-40",
              )}
            >
              <button
                type="button"
                aria-pressed={pinned === provider}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") onHover(provider);
                }}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(provider)}
                onBlur={() => onHover(null)}
                onClick={() => onToggle(provider)}
                className={cn(
                  "outline-db-navy text-grey-40 flex min-h-6 w-fit cursor-pointer items-center gap-2 font-mono text-xs/none font-medium uppercase outline-offset-2 transition-colors hover:text-black focus-visible:outline-2",
                  pinned === provider && "text-black",
                )}
              >
                {provider}
                <span className="font-normal tabular-nums">
                  {values[week].toFixed(1)}%
                </span>
              </button>
              {/* Newest model first, matching the column from top to bottom. */}
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
                {models
                  .map((model, i) => ({ ...model, shade: shades[i] }))
                  .reverse()
                  .map(({ label, values: modelValues, shade }) => (
                    <li
                      key={label}
                      className="flex min-h-6 items-center gap-1.5 text-sm/none tracking-tight text-black/70"
                    >
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0"
                        style={{ backgroundColor: shade }}
                      />
                      {label}
                      <span className="text-grey-40 font-mono text-xs/none tabular-nums">
                        {modelValues[week].toFixed(1)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </li>
          );
        })}
      </ul>
      {/* Sits on the first provider row, so the models use the full width. */}
      <span
        aria-live="polite"
        className="text-grey-40 absolute top-4 right-0 font-mono text-xs/6 uppercase"
      >
        {caption}
      </span>
    </div>
  );
}
