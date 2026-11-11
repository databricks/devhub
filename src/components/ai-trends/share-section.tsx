import type { ReactNode } from "react";

import type { StackLayer } from "@/lib/ai-trends/compute";
import { getLegendGroups } from "@/lib/ai-trends/compute";

import { ChartCard } from "./chart-card";
import { StackedShareChart } from "./stacked-share-chart";

type ChartCopy = { title: string; description: string; note?: string };

export function ShareSection({
  weeks,
  layers,
  updated,
  token,
  wallet,
  slugs,
  canvasIds,
  showHalfLine,
  walletPlaceholder,
}: {
  weeks: string[];
  layers: StackLayer[];
  updated: string;
  token: ChartCopy;
  wallet: ChartCopy;
  slugs: { token: string; wallet: string };
  canvasIds: { token: string; wallet: string };
  showHalfLine: boolean;
  walletPlaceholder: boolean;
}): ReactNode {
  const legend = getLegendGroups(layers);
  const cards = [
    { metric: "token", copy: token, yAxisTitle: "% of token volume" },
    { metric: "wallet", copy: wallet, yAxisTitle: "% of spend" },
  ] as const;

  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      {cards.map(({ metric, copy, yAxisTitle }) => (
        <ChartCard
          key={metric}
          className="h-full"
          title={copy.title}
          updated={updated}
          placeholder={metric === "wallet" && walletPlaceholder}
          note={copy.note}
          shareSlug={slugs[metric]}
        >
          <StackedShareChart
            weeks={weeks}
            layers={layers}
            legend={legend}
            metric={metric}
            canvasId={canvasIds[metric]}
            yAxisTitle={yAxisTitle}
            showHalfLine={showHalfLine}
          />
        </ChartCard>
      ))}
    </div>
  );
}
