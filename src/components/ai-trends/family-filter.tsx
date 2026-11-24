"use client";

import type { ReactNode } from "react";

import type { FamilyOption } from "@/lib/ai-trends/compute";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";
import { cn } from "@/lib/utils";

/**
 * Multi-select mono toggles in brackets, each with its provider logo, in the
 * DevHub kicker style. An empty selection shows every family.
 */
export function FamilyFilter({
  families,
  selected,
  onChange,
  onPreviewChange,
  label,
}: {
  families: FamilyOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onPreviewChange: (family: string | null) => void;
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
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <span className="text-grey-40 font-mono text-sm/none font-medium uppercase">
        {label}:
      </span>
      {families.map(({ label: family }) => (
        <Toggle
          key={family}
          active={selected.includes(family)}
          logo={getVendorLogo(family)}
          onClick={() => toggle(family)}
          onPreview={(preview) => onPreviewChange(preview ? family : null)}
        >
          {family}
        </Toggle>
      ))}
    </div>
  );
}

function Toggle({
  active,
  logo,
  onClick,
  onPreview,
  children,
}: {
  active: boolean;
  logo?: string;
  onClick: () => void;
  onPreview: (preview: boolean) => void;
  children: string;
}): ReactNode {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") onPreview(true);
      }}
      onPointerLeave={() => onPreview(false)}
      onPointerCancel={() => onPreview(false)}
      className={cn(
        "inline-flex min-h-7 items-center font-mono text-sm/none font-medium uppercase transition-colors",
        active ? "text-orange" : "text-grey-40 hover:text-black",
      )}
    >
      <span aria-hidden="true">[</span>
      {logo ? (
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          width={14}
          height={14}
          className="mx-1 size-3.5 shrink-0"
        />
      ) : null}
      <span>{children}</span>
      <span aria-hidden="true">]</span>
    </button>
  );
}
