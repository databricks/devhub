import type { ReactNode } from "react";

import {
  getBestPerModel,
  getFamilies,
  getNiceMax,
  getParetoNames,
  getQualityAxis,
  getShownRuns,
  getStackLayers,
  getTopModelPanels,
} from "@/lib/ai-trends/compute";
import { benchmarkData, contentData, industryData } from "@/lib/ai-trends/data";
import { formatDate } from "@/lib/ai-trends/format";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { Changelog } from "@/components/ai-trends/changelog";
import { ChartCard } from "@/components/ai-trends/chart-card";
import { LongTermSection } from "@/components/ai-trends/long-term-section";
import { TrendsHeader } from "@/components/ai-trends/page-header";
import { ScatterCard } from "@/components/ai-trends/scatter-card";
import {
  SectionHeading,
  SubsectionTitle,
} from "@/components/ai-trends/section-heading";
import { ShareSection } from "@/components/ai-trends/share-section";
import { SpendCharts } from "@/components/ai-trends/spend-charts";
import { TopModelBars } from "@/components/ai-trends/top-model-bars";
import Footer from "@/components/footer";

const PAGE_PATH = "/ai-index";
const QUALITY_AXIS_STEP = 5;
const TOP_MODEL_COUNT = 10;

export const metadata = getMetadata({
  title: contentData.seo.title,
  description: contentData.seo.description,
  markdownPath: `${PAGE_PATH}.md`,
  pathname: PAGE_PATH,
  imagePath: null,
  noIndex: true,
});

function getTopModelBarPanels() {
  const top = getTopModelPanels(
    getShownRuns(benchmarkData.models),
    TOP_MODEL_COUNT,
  );
  const copy = contentData.charts.top_models.panels;
  return [
    {
      canvasId: "topQualityChart",
      ...copy.quality,
      unit: "percent" as const,
      bars: top.quality,
      missing: [],
    },
    {
      canvasId: "topTimeChart",
      ...copy.time,
      unit: "minutes" as const,
      bars: top.time,
      missing: top.missingTime,
    },
    {
      canvasId: "topCostChart",
      ...copy.cost,
      unit: "usd" as const,
      bars: top.cost,
      missing: [],
    },
  ];
}

export default function AiTrendsPage(): ReactNode {
  const { models, run_date: runDate } = benchmarkData;
  const { charts, sections } = contentData;
  const pricedModels = getBestPerModel(getShownRuns(models));
  const { share, spend, long_term: longTerm } = industryData;
  const brandColors = Object.fromEntries(
    getFamilies(models).map(({ label, color }) => [label, color]),
  );
  const shareUpdated = formatDate(share.as_of);
  const walletPlaceholder = share.wallet_placeholder === true;

  return (
    <main className="bg-db-paper text-foreground [--foreground:var(--db-navy)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: contentData.seo.title,
            description: contentData.seo.description,
            url: absoluteSiteUrl(PAGE_PATH),
            dateModified: runDate,
            publisher: { "@type": "Organization", name: "Databricks" },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <TrendsHeader header={contentData.header} />

      <div className="mx-auto flex w-full max-w-360 flex-col gap-10 px-5 pb-16 md:px-8 md:pb-24">
        <section id="usage" className="flex scroll-mt-24 flex-col gap-5">
          <SectionHeading
            index={1}
            eyebrow={sections.proprietary.eyebrow}
            title={sections.proprietary.title}
            intro={sections.proprietary.intro}
          />
          <ShareSection
            weeks={share.weeks}
            layers={getStackLayers(share.groups.proprietary, brandColors)}
            updated={shareUpdated}
            token={charts.token_share}
            wallet={charts.wallet_share}
            slugs={{ token: "token-share", wallet: "wallet-share" }}
            canvasIds={{ token: "tokenShareChart", wallet: "walletShareChart" }}
            showHalfLine
            walletPlaceholder={walletPlaceholder}
          />
          <div
            id="usage-open-weight"
            className="flex scroll-mt-24 flex-col gap-5 pt-5"
          >
            <SubsectionTitle title={sections.open_source.title} />
            <ShareSection
              weeks={share.weeks}
              layers={getStackLayers(share.groups.open_source, brandColors)}
              updated={shareUpdated}
              token={charts.open_source_token_share}
              wallet={charts.open_source_wallet_share}
              slugs={{
                token: "open-source-token-share",
                wallet: "open-source-wallet-share",
              }}
              canvasIds={{
                token: "ossTokenShareChart",
                wallet: "ossWalletShareChart",
              }}
              showHalfLine={false}
              walletPlaceholder={walletPlaceholder}
            />
          </div>
        </section>

        <section id="multi-ai" className="flex scroll-mt-24 flex-col gap-5">
          <SectionHeading
            index={2}
            eyebrow={sections.long_term.eyebrow}
            title={sections.long_term.title}
            intro={sections.long_term.intro}
          />
          <LongTermSection
            weeks={longTerm.weeks}
            updated={formatDate(longTerm.as_of)}
            providers={{
              copy: charts.providers_used,
              series: longTerm.providers_used,
            }}
            openWeight={{
              copy: charts.open_weight_share,
              values: longTerm.open_weight_share,
              yMax: getNiceMax(longTerm.open_weight_share),
            }}
          />
        </section>

        <section
          id="spend-trends"
          className="flex scroll-mt-24 flex-col gap-6 md:gap-8"
        >
          <SectionHeading
            index={3}
            eyebrow={sections.spend.eyebrow}
            title={sections.spend.title}
            intro={sections.spend.intro}
          />
          <ChartCard
            title={charts.spend.title}
            updated={formatDate(spend.as_of)}
            note={charts.spend.note}
            shareSlug="spend"
          >
            <SpendCharts
              weeks={spend.weeks}
              series={{ p50: spend.p50, p90: spend.p90, p99: spend.p99 }}
              maxes={{
                p50: getNiceMax(spend.p50),
                p90: getNiceMax(spend.p90),
                p99: getNiceMax(spend.p99),
              }}
              labels={charts.spend.panel_labels}
            />
          </ChartCard>
        </section>

        <section
          id="benchmark"
          className="flex scroll-mt-24 flex-col gap-6 md:gap-8"
        >
          <SectionHeading
            index={4}
            eyebrow={sections.frontier.eyebrow}
            title={sections.frontier.title}
            intro={sections.frontier.intro}
          />
          <ScatterCard
            title={charts.scatter.title}
            updated={formatDate(runDate)}
            note={charts.scatter.note}
            models={pricedModels}
            paretoNames={getParetoNames(pricedModels)}
            axis={getQualityAxis(
              pricedModels.map(({ quality }) => quality),
              QUALITY_AXIS_STEP,
            )}
            families={getFamilies(pricedModels)}
          />
          <ChartCard>
            <TopModelBars panels={getTopModelBarPanels()} />
          </ChartCard>
        </section>

        <section
          id="publications"
          className="flex scroll-mt-24 flex-col gap-6 md:gap-8"
        >
          <SectionHeading
            index={5}
            eyebrow={sections.changelog.eyebrow}
            title={sections.changelog.title}
            intro={sections.changelog.intro}
          />
          <Changelog entries={contentData.changelog} />
        </section>
      </div>

      <Footer className="max-w-none border-t border-black/10 lg:px-8" />
    </main>
  );
}
