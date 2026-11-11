import type { ReactElement, ReactNode } from "react";

import {
  getBestPerModel,
  getFamilies,
  getLegendGroups,
  getNiceMax,
  getParetoNames,
  getQualityAxis,
  getShownRuns,
  getStackLayers,
} from "@/lib/ai-trends/compute";
import { benchmarkData, contentData, industryData } from "@/lib/ai-trends/data";
import type { ShareCard } from "@/lib/ai-trends/share-cards";

import { OgFrame } from "./frame";
import { OgSpendPanels } from "./lines";
import { OgScatter } from "./scatter";
import { OgStackedBars } from "./stacked";

const QUALITY_AXIS_STEP = 5;
const SPEND_TICKS = 2;

function renderStackedShare(
  group: keyof typeof industryData.share.groups,
  metric: "token" | "wallet",
): ReactNode {
  const brandColors = Object.fromEntries(
    getFamilies(benchmarkData.models).map(({ label, color }) => [label, color]),
  );
  const layers = getStackLayers(industryData.share.groups[group], brandColors);
  return (
    <OgStackedBars
      weeks={industryData.share.weeks}
      layers={layers}
      legend={getLegendGroups(layers)}
      metric={metric}
      showHalfLine={group === "proprietary"}
    />
  );
}

function renderChart(slug: string, logos: Record<string, string>): ReactNode {
  const { models } = benchmarkData;

  switch (slug) {
    case "scatter": {
      const priced = getBestPerModel(getShownRuns(models));
      return (
        <OgScatter
          models={priced}
          axis={getQualityAxis(
            priced.map(({ quality }) => quality),
            QUALITY_AXIS_STEP,
          )}
          paretoNames={getParetoNames(priced)}
          logos={logos}
        />
      );
    }
    case "token-share":
      return renderStackedShare("proprietary", "token");
    case "wallet-share":
      return renderStackedShare("proprietary", "wallet");
    case "open-weight-token-share":
      return renderStackedShare("open_source", "token");
    case "open-weight-wallet-share":
      return renderStackedShare("open_source", "wallet");
    case "spend": {
      const { spend } = industryData;
      const labels = contentData.charts.spend.panel_labels;
      const panel = (label: string, values: number[]) => {
        const max = getNiceMax(values);
        return { label, values, max, step: max / SPEND_TICKS };
      };
      return (
        <OgSpendPanels
          weeks={spend.weeks}
          panels={[
            panel(labels.p50, spend.p50),
            panel(labels.p90, spend.p90),
            panel(labels.p99, spend.p99),
          ]}
        />
      );
    }
    default:
      return null;
  }
}

/**
 * `logos` maps vendor name to a logo image source (a data URI, since the image
 * renderer can't fetch site-relative paths).
 */
export function renderShareCard(
  card: ShareCard,
  logos: Record<string, string>,
): ReactElement {
  return (
    <OgFrame
      title={card.title}
      updated={card.updated}
      placeholder={card.placeholder}
    >
      {renderChart(card.slug, logos)}
    </OgFrame>
  );
}
