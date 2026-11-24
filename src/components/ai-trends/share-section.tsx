import type { ReactNode } from "react";

import { getProviderShareLayers } from "@/lib/ai-trends/compute";
import type { ShareGroup } from "@/lib/ai-trends/schema";
import { getShareTitle, getShareVersion } from "@/lib/ai-trends/share-cards";

import { ShareChartCard } from "./share-chart-card";

type ChartCopy = { heading: string; note?: string };

export function ShareSection({
  weeks,
  group,
  brandColors,
  token,
  wallet,
  slugs,
  canvasIds,
  showHalfLine,
  walletPlaceholder,
}: {
  weeks: string[];
  group: ShareGroup;
  brandColors: Record<string, string>;
  token: ChartCopy;
  wallet: ChartCopy;
  slugs: { token: string; wallet: string };
  canvasIds: { token: string; wallet: string };
  showHalfLine: boolean;
  walletPlaceholder: boolean;
}): ReactNode {
  const cards = [
    {
      metric: "token",
      copy: token,
      yAxisTitle: "% of token volume",
      label: "Token share",
    },
    {
      metric: "wallet",
      copy: wallet,
      yAxisTitle: "% of spend",
      label: "Wallet share",
    },
  ] as const;

  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
      {cards.map(({ metric, copy, yAxisTitle, label }) => (
        <ShareChartCard
          key={metric}
          card={{
            className: "h-full",
            title: copy.heading,
            placeholder: metric === "wallet" && walletPlaceholder,
            note: copy.note,
            shareSlug: slugs[metric],
            shareVersion: getShareVersion(slugs[metric]),
            shareTitle: getShareTitle(slugs[metric]),
          }}
          chart={{
            weeks,
            layers: getProviderShareLayers(group, metric, brandColors),
            canvasId: canvasIds[metric],
            yAxisTitle,
            metricLabel:
              metric === "wallet" && walletPlaceholder
                ? `${label} (placeholder)`
                : label,
            showHalfLine,
          }}
        />
      ))}
    </div>
  );
}
