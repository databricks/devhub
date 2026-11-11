import type { ReactNode } from "react";

import type { LegendGroup } from "@/lib/ai-trends/compute";

/** Per-card legend, placed beside its chart. */
export function ShareLegend({ groups }: { groups: LegendGroup[] }): ReactNode {
  return (
    <ul
      className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-black/70 lg:flex lg:flex-col"
      aria-label="Chart legend"
    >
      {groups.map((group) => (
        <li key={group.provider}>
          <p className="mb-1 font-semibold text-black">{group.provider}</p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[2px]"
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
