import type { ReactNode } from "react";

import { getLegendGroups, getSeriesLayers } from "@/lib/ai-trends/compute";
import type { StackSeries } from "@/lib/ai-trends/schema";

import { ChartCard } from "./chart-card";
import { ShareLineChart } from "./share-line-chart";
import { StackedShareChart } from "./stacked-share-chart";

type ChartCopy = { title: string; note?: string };

export function LongTermSection({
  weeks,
  updated,
  providers,
  openWeight,
}: {
  weeks: string[];
  updated: string;
  providers: { copy: ChartCopy & { legend: string }; series: StackSeries[] };
  openWeight: { copy: ChartCopy; values: number[]; yMax: number };
}): ReactNode {
  const providerLayers = getSeriesLayers(
    providers.series,
    providers.copy.legend,
  );
  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <ChartCard
        className="h-full"
        title={providers.copy.title}
        updated={updated}
        note={providers.copy.note}
        shareSlug="providers-used"
      >
        <StackedShareChart
          weeks={weeks}
          layers={providerLayers}
          legend={getLegendGroups(providerLayers)}
          canvasId="providersUsedChart"
          yAxisTitle="% of active companies"
        />
      </ChartCard>
      <ChartCard
        className="h-full"
        title={openWeight.copy.title}
        updated={updated}
        note={openWeight.copy.note}
        shareSlug="open-weight-share"
      >
        <ShareLineChart
          weeks={weeks}
          values={openWeight.values}
          yMax={openWeight.yMax}
          label="Open-weight"
          canvasId="openWeightShareChart"
          yAxisTitle="% of token volume"
        />
      </ChartCard>
    </div>
  );
}
