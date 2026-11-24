import type { ReactNode } from "react";

import { getAtLeastLayers, getSeriesLayers } from "@/lib/ai-trends/compute";
import type { StackSeries } from "@/lib/ai-trends/schema";
import { getShareTitle, getShareVersion } from "@/lib/ai-trends/share-cards";

import { ChartCard } from "./chart-card";
import { ShareAreaChart } from "./share-area-chart";
import { StackedShareChart } from "./stacked-share-chart";

type ChartCopy = { heading: string; note?: string; legend: string };

export function LongTermSection({
  weeks,
  providers,
  openWeight,
}: {
  weeks: string[];
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
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
      <ChartCard
        className="h-full"
        title={providers.copy.heading}
        note={providers.copy.note}
        shareSlug="providers-used"
        shareVersion={getShareVersion("providers-used")}
        shareTitle={getShareTitle("providers-used")}
      >
        <ShareAreaChart
          weeks={weeks}
          layers={providerLayers}
          canvasId="providersUsedChart"
          yAxisTitle="% of active companies"
        />
      </ChartCard>
      <ChartCard
        className="h-full"
        title={openWeight.copy.heading}
        note={openWeight.copy.note}
        shareSlug="open-weight-share"
        shareVersion={getShareVersion("open-weight-share")}
        shareTitle={getShareTitle("open-weight-share")}
      >
        <StackedShareChart
          weeks={weeks}
          layers={openWeightLayers}
          canvasId="openWeightShareChart"
          yAxisTitle="% of token volume"
          tooltipTitle="Token share by model type"
          showHalfLine
        />
      </ChartCard>
    </div>
  );
}
