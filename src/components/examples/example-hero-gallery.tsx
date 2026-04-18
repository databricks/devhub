"use client";

import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import { useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ExampleHeroVariant } from "@/lib/recipes/recipes";

type Theme = "light" | "dark";

export function ExampleHeroGallery({
  exampleName,
  variants,
}: {
  exampleName: string;
  variants: ExampleHeroVariant[];
}) {
  const first = variants[0];
  const [viewId, setViewId] = useState(first?.id ?? "");
  const { colorMode } = useColorMode();
  const [theme, setTheme] = useState<Theme>("light");
  const syncedThemeFromSite = useRef(false);

  useEffect(() => {
    if (syncedThemeFromSite.current) return;
    syncedThemeFromSite.current = true;
    setTheme(colorMode === "dark" ? "dark" : "light");
  }, [colorMode]);

  const current = variants.find((v) => v.id === viewId) ?? first;
  const rawPath =
    current && (theme === "light" ? current.imageLight : current.imageDark);
  const src = useBaseUrl(rawPath ?? "");

  if (!current || variants.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            View
          </span>
          <ToggleGroup
            type="single"
            value={viewId}
            onValueChange={(value) => {
              if (value) setViewId(value);
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Example screenshot view"
          >
            {variants.map((v) => (
              <ToggleGroupItem key={v.id} value={v.id} aria-label={v.label}>
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Appearance
          </span>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => {
              if (value === "light" || value === "dark") setTheme(value);
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Screenshot light or dark theme"
          >
            <ToggleGroupItem value="light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
        <img
          src={src}
          alt={`${exampleName} — ${current.label} (${theme} mode)`}
          className="h-auto w-full object-contain object-left object-top"
          loading="lazy"
        />
      </div>
    </div>
  );
}
