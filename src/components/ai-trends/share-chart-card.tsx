import type { ComponentProps, ReactNode } from "react";

import type { ProviderShareLayer } from "@/lib/ai-trends/compute";

import { ChartCard } from "./chart-card";
import { StackedShareChart } from "./stacked-share-chart";

/**
 * A provider share card. The chart always shows the model breakdown, with
 * one legend row per provider, so there is no Providers / Models switch.
 */
export function ShareChartCard({
  card,
  chart,
}: {
  card: Omit<ComponentProps<typeof ChartCard>, "actions" | "children">;
  chart: {
    weeks: string[];
    layers: ProviderShareLayer[];
    canvasId: string;
    yAxisTitle: string;
    metricLabel: string;
    showHalfLine: boolean;
  };
}): ReactNode {
  return (
    <ChartCard {...card}>
      <StackedShareChart {...chart} byModel />
    </ChartCard>
  );
}
