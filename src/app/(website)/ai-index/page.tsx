import type { ReactNode } from "react";

import {
  getBestPerModel,
  getFamilies,
  getNiceMax,
  getParetoNames,
  getQualityAxis,
  getTopModelPanels,
} from "@/lib/ai-trends/compute";
import { benchmarkData, contentData, industryData } from "@/lib/ai-trends/data";
import { formatDate } from "@/lib/ai-trends/format";
import { getShareTitle, getShareVersion } from "@/lib/ai-trends/share-cards";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { BrandStrip } from "@/components/ui/brand-strip";
import { Changelog } from "@/components/ai-trends/changelog";
import { ChartCard } from "@/components/ai-trends/chart-card";
import { LongTermSection } from "@/components/ai-trends/long-term-section";
import { TrendsHeader } from "@/components/ai-trends/page-header";
import { ScatterCard } from "@/components/ai-trends/scatter-card";
import { SectionHeading } from "@/components/ai-trends/section-heading";
import { ShareSection } from "@/components/ai-trends/share-section";
import { SpendCharts } from "@/components/ai-trends/spend-charts";
import { TopModelBars } from "@/components/ai-trends/top-model-bars";
import { TableOfContents } from "@/components/docs/table-of-contents";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";

const PAGE_PATH = "/ai-index";
const SECTION_CLASS = "flex scroll-mt-24 flex-col gap-6 md:gap-8";
const TOC_ITEMS = [
  { anchor: "usage", title: "Usage" },
  { anchor: "multi-ai", title: "Multi-AI" },
  { anchor: "spend-trends", title: "Spend" },
  { anchor: "benchmark", title: "Coding Frontier" },
  { anchor: "publications", title: "Publications" },
].map((item) => ({ ...item, depth: 2 }));
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
  const top = getTopModelPanels(benchmarkData.models, TOP_MODEL_COUNT);
  const copy = contentData.charts.top_models.panels;
  return [
    {
      ...copy.quality,
      unit: "percent" as const,
      bars: top.quality,
      missing: [],
    },
    {
      ...copy.time,
      unit: "minutes" as const,
      bars: top.time,
      missing: top.missingTime,
    },
    {
      ...copy.cost,
      unit: "usd" as const,
      bars: top.cost,
      missing: [],
    },
  ];
}

export default function AiTrendsPage(): ReactNode {
  const { models, run_date: runDate } = benchmarkData;
  const benchmarkDate = formatDate(runDate);
  const { charts, sections } = contentData;
  const pricedModels = getBestPerModel(models);
  const { share, spend, long_term: longTerm } = industryData;
  const brandColors = Object.fromEntries(
    getFamilies(models).map(({ label, color }) => [label, color]),
  );
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
      <BrandStrip className="h-12 md:h-12" />

      <div className="mx-auto grid w-full max-w-400 grid-cols-1 gap-x-16 px-5 pt-6 pb-16 md:px-8 md:pb-24 lg:grid-cols-[minmax(0,1fr)_12rem] xl:gap-x-20">
        <div className="flex min-w-0 flex-col gap-16 md:gap-24 xl:gap-32">
          <section id="usage" className={SECTION_CLASS}>
            <SectionHeading {...sections.proprietary} />
            <ShareSection
              weeks={share.weeks}
              group={share.groups.proprietary}
              brandColors={brandColors}
              token={charts.token_share}
              wallet={charts.wallet_share}
              slugs={{ token: "token-share", wallet: "wallet-share" }}
              canvasIds={{
                token: "tokenShareChart",
                wallet: "walletShareChart",
              }}
              showHalfLine
              walletPlaceholder={walletPlaceholder}
            />
            <div
              id="usage-open-weight"
              className={`${SECTION_CLASS} pt-6 md:pt-12`}
            >
              <SectionHeading {...sections.open_source} eyebrow={undefined} />
              <ShareSection
                weeks={share.weeks}
                group={share.groups.open_source}
                brandColors={brandColors}
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

          <section id="multi-ai" className={SECTION_CLASS}>
            <SectionHeading {...sections.long_term} />
            <LongTermSection
              weeks={longTerm.weeks}
              providers={{
                copy: charts.providers_used,
                series: longTerm.providers_used,
              }}
              openWeight={{
                copy: charts.open_weight_share,
                series: longTerm.open_weight_share,
              }}
            />
          </section>

          <section id="spend-trends" className={SECTION_CLASS}>
            <SectionHeading {...sections.spend} />
            <ChartCard
              title={charts.spend.heading}
              note={charts.spend.note}
              shareSlug="spend"
              shareVersion={getShareVersion("spend")}
              shareTitle={getShareTitle("spend")}
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

          <section id="benchmark" className={SECTION_CLASS}>
            <SectionHeading {...sections.frontier} />
            <ScatterCard
              title={charts.scatter.title}
              heading={charts.scatter.heading}
              note={charts.scatter.note}
              shareVersion={getShareVersion("scatter")}
              models={pricedModels}
              benchmarkDate={benchmarkDate}
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

          <section id="publications" className={`${SECTION_CLASS} md:gap-16`}>
            <SectionHeading {...sections.changelog} />
            <Changelog entries={contentData.changelog} />
          </section>
        </div>

        <aside className="hidden lg:block">
          <TableOfContents
            title="On this page"
            tone="light"
            items={TOC_ITEMS}
            className="sticky top-[calc(var(--sticky-header-height)+2rem)]"
          />
        </aside>
      </div>

      <CTA
        label="Start building"
        title="Ready to ship your next agentic app in minutes?"
        className="mx-auto mt-8 max-w-432 pt-1.5 pb-16 md:mt-12 lg:pb-22"
      />
      <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
    </main>
  );
}
