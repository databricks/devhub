import type { ReactElement, ReactNode } from "react";

import {
  getBestPerModel,
  getFamilies,
  getLegendGroups,
  getMetricLayers,
  getNiceMax,
  getParetoNames,
  getQualityAxis,
  getSeriesLayers,
  getShownRuns,
  getStackLayers,
} from "@/lib/ai-trends/compute";
import { benchmarkData, contentData, industryData } from "@/lib/ai-trends/data";
import { formatDate } from "@/lib/ai-trends/format";
import type { ShareCard } from "@/lib/ai-trends/share-cards";

import {
  CHART_HEIGHT,
  CHART_WIDTH,
  LAVA,
  MUTED,
  OgAccent,
  OgFrame,
  OgPage,
} from "./frame";
import { LINE_BLUE, OgLines, OgSpendPanels } from "./lines";
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
  const layers = getMetricLayers(
    getStackLayers(industryData.share.groups[group], brandColors),
    metric,
  );
  return (
    <OgStackedBars
      weeks={industryData.share.weeks}
      layers={layers}
      legend={getLegendGroups(layers)}
      showHalfLine={group === "proprietary"}
    />
  );
}

const OPEN_WEIGHT_TICKS = 4;

function renderOpenWeightShare(): ReactNode {
  const { weeks, open_weight_share: values } = industryData.long_term;
  const max = getNiceMax(values);
  return (
    <OgLines
      weeks={weeks}
      series={[{ label: "Open-weight", color: LINE_BLUE, values }]}
      yMax={max}
      yStep={max / OPEN_WEIGHT_TICKS}
      formatY={(v) => `${v}%`}
    />
  );
}

function renderProvidersUsed(): ReactNode {
  const { long_term: longTerm } = industryData;
  const layers = getSeriesLayers(
    longTerm.providers_used,
    contentData.charts.providers_used.legend,
  );
  return (
    <OgStackedBars
      weeks={longTerm.weeks}
      layers={layers}
      legend={getLegendGroups(layers)}
      showHalfLine={false}
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
    case "open-source-token-share":
      return renderStackedShare("open_source", "token");
    case "open-source-wallet-share":
      return renderStackedShare("open_source", "wallet");
    case "open-weight-share":
      return renderOpenWeightShare();
    case "providers-used":
      return renderProvidersUsed();
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

/** The bold lead of the page intro, e.g. "Explore the tokenomics of enterprise AI". */
function getIntroLead(): string {
  const lead = contentData.header.intro.match(/^\*\*(.+?):?\*\*/)?.[1];
  if (!lead) throw new Error("content.json header.intro has no bold lead");
  return lead;
}

/**
 * The /ai-index page card: the index title and intro lead over the
 * proprietary token share chart, which illustrates the page as a whole.
 */
export function renderIndexCard(): ReactElement {
  const { header } = contentData;
  const updated = [
    industryData.share.as_of,
    industryData.spend.as_of,
    benchmarkData.run_date,
  ].sort()[2];
  return (
    <OgPage>
      <OgAccent />
      <div
        style={{
          display: "flex",
          marginTop: 18,
          fontSize: 56,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: -1.6,
        }}
      >
        <span>{header.title_lead}</span>
        <span style={{ color: LAVA, marginLeft: 14 }}>
          {header.title_accent}
        </span>
      </div>
      <div
        style={{ display: "flex", marginTop: 8, fontSize: 22, color: MUTED }}
      >
        {`${getIntroLead()} · Updated ${formatDate(updated)}`}
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: CHART_WIDTH,
          height: CHART_HEIGHT,
          marginTop: 26,
        }}
      >
        {renderStackedShare("proprietary", "token")}
      </div>
    </OgPage>
  );
}
