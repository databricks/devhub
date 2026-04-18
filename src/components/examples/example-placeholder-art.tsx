import type { ReactNode } from "react";

/** Abstract placeholder used for examples without real screenshot pairs. */
export function ExamplePlaceholderArt(): ReactNode {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2744] to-[#0c1322]" />
      <div className="absolute left-6 top-5 h-14 w-28 rounded-md border border-white/15 bg-white/5" />
      <div className="absolute left-10 top-8 h-1.5 w-16 rounded bg-db-lava/70" />
      <div className="absolute left-10 top-12 h-1.5 w-10 rounded bg-white/20" />
      <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-white/10" />
      <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-db-lava/30" />
      <div className="absolute bottom-6 left-8 h-10 w-36 rounded-md border border-white/10 bg-white/5" />
      <div className="absolute bottom-9 left-11 h-1.5 w-20 rounded bg-white/15" />
    </div>
  );
}
