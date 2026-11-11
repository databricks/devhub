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
  getTopModelPanels,
} from "@/lib/ai-trends/compute";
import { benchmarkData, contentData, industryData } from "@/lib/ai-trends/data";
import { formatDate } from "@/lib/ai-trends/format";
import type { ShareCard } from "@/lib/ai-trends/share-cards";

import { OgTopBars } from "./bars";
import {
  CARD,
  CHART_WIDTH,
  GRID,
  LAVA,
  MUTED,
  OG_BODY_HEIGHT,
  OgAccent,
  OgFrame,
  OgPage,
} from "./frame";
import { OgSpendPanels } from "./lines";
import { OgScatter } from "./scatter";
import { OgStackedBars } from "./stacked";

const QUALITY_AXIS_STEP = 5;
const SPEND_TICKS = 2;
const TOP_MODEL_COUNT = 10;

type ChartSize = { width?: number; height?: number; bare?: boolean };

function renderStackedShare(
  group: keyof typeof industryData.share.groups,
  metric: "token" | "wallet",
  size: ChartSize,
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
      {...size}
    />
  );
}

function renderChart(
  slug: string,
  logos: Record<string, string>,
  size: ChartSize = {},
): ReactNode {
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
          {...size}
        />
      );
    }
    case "token-share":
      return renderStackedShare("proprietary", "token", size);
    case "wallet-share":
      return renderStackedShare("proprietary", "wallet", size);
    case "open-source-token-share":
      return renderStackedShare("open_source", "token", size);
    case "open-source-wallet-share":
      return renderStackedShare("open_source", "wallet", size);
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
          {...size}
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

const INDEX = {
  titleWidth: 344,
  gap: 14,
  footerGap: 22,
  padding: 14,
  border: 1,
  labelHeight: 36,
  chartGap: 24,
  topBarsWidth: 84,
};

function IndexSection({
  label,
  height,
  children,
}: {
  label: string;
  height: number;
  children: ReactNode;
}): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height,
        padding: INDEX.padding,
        background: CARD,
        border: `${INDEX.border}px solid ${GRID}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          height: INDEX.labelHeight,
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: INDEX.chartGap }}>{children}</div>
    </div>
  );
}

function IndexTitle({ updated }: { updated: string }): ReactNode {
  const { header } = contentData;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: INDEX.titleWidth,
        height: OG_BODY_HEIGHT - INDEX.footerGap,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <OgAccent />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: -2,
          }}
        >
          <div style={{ display: "flex" }}>{header.title_lead}</div>
          <div style={{ display: "flex", color: LAVA }}>
            {header.title_accent}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 22, color: MUTED }}>
        {`Updated ${updated}`}
      </div>
    </div>
  );
}

/**
 * The /ai-index page card: the index title beside one card per page section,
 * each holding that section's charts without labels or axes so they still
 * read as shapes at feed size.
 */
export function renderIndexCard(logos: Record<string, string>): ReactElement {
  const { sections } = contentData;
  const sectionsWidth = CHART_WIDTH - INDEX.titleWidth - INDEX.chartGap * 2;
  const sectionHeight = (OG_BODY_HEIGHT - INDEX.footerGap - INDEX.gap * 2) / 3;
  const inset = (INDEX.padding + INDEX.border) * 2;
  const chartWidth = sectionsWidth - inset;
  const chartHeight = sectionHeight - inset - INDEX.labelHeight;
  const halfWidth = (chartWidth - INDEX.chartGap) / 2;
  const scatterWidth = chartWidth - 3 * (INDEX.topBarsWidth + INDEX.chartGap);
  const bare = (slug: string, width: number) =>
    renderChart(slug, logos, { width, height: chartHeight, bare: true });
  const top = getTopModelPanels(
    getShownRuns(benchmarkData.models),
    TOP_MODEL_COUNT,
  );
  const updated = [
    industryData.share.as_of,
    industryData.spend.as_of,
    benchmarkData.run_date,
  ].sort()[2];

  return (
    <OgPage>
      <div style={{ display: "flex", gap: INDEX.chartGap * 2 }}>
        <IndexTitle updated={formatDate(updated)} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: sectionsWidth,
            gap: INDEX.gap,
          }}
        >
          <IndexSection
            label={sections.proprietary.eyebrow}
            height={sectionHeight}
          >
            {bare("token-share", halfWidth)}
            {bare("open-source-token-share", halfWidth)}
          </IndexSection>
          <IndexSection label={sections.spend.eyebrow} height={sectionHeight}>
            {bare("spend", chartWidth)}
          </IndexSection>
          <IndexSection
            label={sections.frontier.eyebrow}
            height={sectionHeight}
          >
            {bare("scatter", scatterWidth)}
            {[top.quality, top.time, top.cost].map((bars, i) => (
              <OgTopBars
                key={i}
                bars={bars}
                width={INDEX.topBarsWidth}
                height={chartHeight}
              />
            ))}
          </IndexSection>
        </div>
      </div>
    </OgPage>
  );
}
