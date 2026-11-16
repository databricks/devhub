import type { ReactNode } from "react";

import type { LegendGroup } from "@/lib/ai-trends/compute";

/** Per-card legend, placed under its chart: one wrapping row per provider. */
export function ShareLegend({ groups }: { groups: LegendGroup[] }): ReactNode {
  return (
    <ul
      className="flex flex-col gap-4 border-t border-black/10 pt-4 text-sm/none tracking-tight text-black/70"
      aria-label="Chart legend"
    >
      {groups.map((group) => (
        <li key={group.provider}>
          <p className="mb-2 font-medium text-black">{group.provider}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {group.items.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
