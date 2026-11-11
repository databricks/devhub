"use client";

import type { ReactNode } from "react";

import type { FamilyOption } from "@/lib/ai-trends/compute";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";
import { cn } from "@/lib/utils";

/**
 * Multi-select chips. An empty selection means every family is shown, so
 * "All" is active exactly when nothing is picked.
 */
export function FamilyFilter({
  families,
  selected,
  onChange,
  label,
}: {
  families: FamilyOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}): ReactNode {
  const toggle = (family: string) =>
    onChange(
      selected.includes(family)
        ? selected.filter((f) => f !== family)
        : [...selected, family],
    );

  return (
    <div
      role="group"
      aria-label={label}
      className="mb-1 flex flex-wrap items-center gap-2"
    >
      <span className="mr-0.5 text-[11px] font-semibold tracking-wider text-black/55 uppercase">
        {label}
      </span>
      <Chip active={selected.length === 0} onClick={() => onChange([])}>
        All
      </Chip>
      {families.map(({ label: family, color }) => (
        <Chip
          key={family}
          active={selected.includes(family)}
          onClick={() => toggle(family)}
        >
          <VendorMark family={family} color={color} />
          {family}
        </Chip>
      ))}
    </div>
  );
}

function VendorMark({
  family,
  color,
}: {
  family: string;
  color: string;
}): ReactNode {
  const logo = getVendorLogo(family);
  return logo ? (
    <img src={logo} alt="" aria-hidden="true" className="size-3.5" />
  ) : (
    <span
      aria-hidden="true"
      className="size-2.25 rounded-xs"
      style={{ backgroundColor: color }}
    />
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactNode {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-db-lava/30 bg-db-lava/10 text-db-lava font-medium"
          : "border-black/10 text-black/60 hover:border-black/25 hover:text-black",
      )}
    >
      {children}
    </button>
  );
}
