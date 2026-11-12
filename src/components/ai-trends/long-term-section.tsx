import type { ReactNode } from "react";

import {
  getAtLeastLayers,
  getLegendGroups,
  getSeriesLayers,
} from "@/lib/ai-trends/compute";
import type { StackSeries } from "@/lib/ai-trends/schema";
import { getShareTitle } from "@/lib/ai-trends/share-cards";

import { ChartCard } from "./chart-card";
import { ShareAreaChart } from "./share-area-chart";
import { StackedShareChart } from "./stacked-share-chart";

type ChartCopy = { title: string; note?: string; legend: string };

export function LongTermSection({
  weeks,
  updated,
  providers,
  openWeight,
}: {
  weeks: string[];
  updated: string;
  providers: { copy: ChartCopy; series: StackSeries[] };
  openWeight: { copy: ChartCopy; series: StackSeries[] };
}): ReactNode {
  const providerLayers = getAtLeastLayers(
    providers.series,
    providers.copy.legend,
  );
  const openWeightLayers = getSeriesLayers(
    openWeight.series,
    openWeight.copy.legend,
  );
  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <ChartCard
        className="h-full"
        title={providers.copy.title}
        updated={updated}
        note={providers.copy.note}
        shareSlug="providers-used"
        shareTitle={getShareTitle("providers-used")}
      >
        <ShareAreaChart
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
        shareTitle={getShareTitle("open-weight-share")}
      >
        <StackedShareChart
          weeks={weeks}
          layers={openWeightLayers}
          legend={getLegendGroups(openWeightLayers)}
          canvasId="openWeightShareChart"
          yAxisTitle="% of token volume"
          showHalfLine
        />
      </ChartCard>
    </div>
  );
}
