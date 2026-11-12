import type { ReactElement, ReactNode } from "react";

import {
  getAtLeastLayers,
  getBestPerModel,
  getFamilies,
  getLegendGroups,
  getMetricLayers,
  getParetoNames,
  getQualityAxis,
  getSeriesLayers,
  getSpendAxis,
  getStackLayers,
} from "@/lib/ai-trends/compute";
import { benchmarkData, contentData, industryData } from "@/lib/ai-trends/data";
import {
  formatDate,
  formatSpendCentsTick,
  formatSpendTick,
} from "@/lib/ai-trends/format";
import type { ShareCard } from "@/lib/ai-trends/share-cards";

import {
  CHART_HEIGHT,
  CHART_WIDTH,
  INK,
  LAVA,
  MUTED,
  OgAccent,
  OgFrame,
  OgPage,
} from "./frame";
import { OgLines, OgSpendPanels } from "./lines";
import { OgScatter } from "./scatter";
import { OgStackedBars } from "./stacked";

const QUALITY_AXIS_STEP = 5;

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

const OG_LEGEND_HEIGHT = 34;

function renderOpenWeightShare(): ReactNode {
  const layers = getSeriesLayers(
    industryData.long_term.open_weight_share,
    contentData.charts.open_weight_share.legend,
  );
  return (
    <OgStackedBars
      weeks={industryData.long_term.weeks}
      layers={layers}
      legend={getLegendGroups(layers)}
      showHalfLine
    />
  );
}

/** Nested areas, largest drawn first, with a one-row legend above. */
function renderProvidersUsed(): ReactNode {
  const { weeks, providers_used: buckets } = industryData.long_term;
  const layers = getAtLeastLayers(
    buckets,
    contentData.charts.providers_used.legend,
  ).reverse();
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          height: OG_LEGEND_HEIGHT,
          alignItems: "center",
          fontSize: 15,
          color: INK,
        }}
      >
        {layers.map(({ label, color }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", marginRight: 24 }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                marginRight: 8,
                background: color,
              }}
            />
            {label}
          </div>
        ))}
      </div>
      <OgLines
        weeks={weeks}
        series={layers}
        yMax={100}
        yStep={25}
        formatY={(v) => `${v}%`}
        height={CHART_HEIGHT - OG_LEGEND_HEIGHT}
        fill
      />
    </div>
  );
}

function renderChart(slug: string, logos: Record<string, string>): ReactNode {
  const { models } = benchmarkData;

  switch (slug) {
    case "scatter": {
      const priced = getBestPerModel(models);
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
      const panel = (
        label: string,
        values: number[],
        formatY: (value: number) => string,
      ) => ({ label, values, formatY, ...getSpendAxis(values) });
      return (
        <OgSpendPanels
          weeks={spend.weeks}
          panels={[
            panel(labels.p50, spend.p50, formatSpendCentsTick),
            panel(labels.p90, spend.p90, formatSpendTick),
            panel(labels.p99, spend.p99, formatSpendTick),
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
