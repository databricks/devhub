import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Legend under a chart that doubles as its controls: each series shows its
 * value for the week in `caption`, and hovering or pressing one focuses it.
 */
export function ChartLegend({
  label,
  caption,
  items,
  highlighted,
  pinned,
  onHover,
  onToggle,
}: {
  label?: string;
  caption: string;
  items: { label: string; color: string; value: string }[];
  highlighted: string | null;
  pinned: string | null;
  onHover: (label: string | null) => void;
  onToggle: (label: string) => void;
}): ReactNode {
  return (
    <div className="flex items-start justify-between gap-x-4 border-t border-black/10 pt-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {label ? (
          <span className="text-grey-40 font-mono text-xs/none font-medium uppercase">
            {label}:
          </span>
        ) : null}
        <ul
          aria-label="Chart legend"
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          {items.map(({ label: name, color, value }) => (
            <li key={name}>
              <button
                type="button"
                aria-pressed={pinned === name}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") onHover(name);
                }}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(name)}
                onBlur={() => onHover(null)}
                onClick={() => onToggle(name)}
                className={cn(
                  "outline-db-navy flex min-h-6 cursor-pointer items-center gap-1.5 text-sm/none tracking-tight text-black/70 outline-offset-2 transition-opacity hover:text-black focus-visible:outline-2",
                  highlighted && highlighted !== name && "opacity-40",
                  pinned === name && "text-black",
                )}
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0"
                  style={{ backgroundColor: color }}
                />
                {name}
                <span className="text-grey-40 font-mono text-xs/none tabular-nums">
                  {value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <span
        aria-live="polite"
        className="text-grey-40 shrink-0 font-mono text-xs/6 uppercase"
      >
        {caption}
      </span>
    </div>
  );
}
