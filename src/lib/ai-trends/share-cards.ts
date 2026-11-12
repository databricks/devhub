import { getFamilies } from "./compute";
import { benchmarkData, contentData, industryData } from "./data";
import { formatDate } from "./format";
import { getVendorLogoEntries } from "./vendor-logos";

export type ShareSlug =
  | "scatter"
  | "token-share"
  | "wallet-share"
  | "open-source-token-share"
  | "open-source-wallet-share"
  | "open-weight-share"
  | "providers-used"
  | "spend";

export type ShareCard = {
  slug: ShareSlug;
  title: string;
  description: string;
  updated: string;
  placeholder?: boolean;
};

const { charts } = contentData;
const shareUpdated = formatDate(industryData.share.as_of);
const longTermUpdated = formatDate(industryData.long_term.as_of);
const walletPlaceholder = industryData.share.wallet_placeholder === true;
const GATEWAY = "Unity Gateway";

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

const CARDS: ShareCard[] = [
  {
    slug: "scatter",
    title: charts.scatter.title,
    description: charts.scatter.description,
    updated: formatDate(benchmarkData.run_date),
  },
  {
    slug: "token-share",
    title: `${GATEWAY} proprietary ${lowerFirst(charts.token_share.title)}`,
    description: charts.token_share.description,
    updated: shareUpdated,
  },
  {
    slug: "wallet-share",
    title: `${GATEWAY} proprietary ${lowerFirst(charts.wallet_share.title)}`,
    description: charts.wallet_share.description,
    updated: shareUpdated,
    placeholder: walletPlaceholder,
  },
  {
    slug: "open-source-token-share",
    title: `${GATEWAY} open-weight ${lowerFirst(charts.open_source_token_share.title)}`,
    description: charts.open_source_token_share.description,
    updated: shareUpdated,
  },
  {
    slug: "open-source-wallet-share",
    title: `${GATEWAY} open-weight ${lowerFirst(charts.open_source_wallet_share.title)}`,
    description: charts.open_source_wallet_share.description,
    updated: shareUpdated,
    placeholder: walletPlaceholder,
  },
  {
    slug: "providers-used",
    title: `${charts.providers_used.title} on ${GATEWAY}`,
    description: charts.providers_used.description,
    updated: longTermUpdated,
  },
  {
    slug: "open-weight-share",
    title: `${GATEWAY} ${charts.open_weight_share.title.toLowerCase()}`,
    description: charts.open_weight_share.description,
    updated: longTermUpdated,
  },
  {
    slug: "spend",
    title: `${GATEWAY} ${charts.spend.title.toLowerCase()}`,
    description: charts.spend.description,
    updated: formatDate(industryData.spend.as_of),
  },
];

export function getShareSlugs(): string[] {
  return CARDS.map(({ slug }) => slug);
}

export function getShareCard(slug: string): ShareCard | undefined {
  return CARDS.find((card) => card.slug === slug);
}

export function getShareTitle(slug: string): string {
  const card = getShareCard(slug);
  if (!card) throw new Error(`No AI Index share card for "${slug}"`);
  return card.title;
}

export function getSharePath(slug: string): string {
  return `/ai-index/share/${slug}`;
}

function getShareGroupData(
  group: keyof typeof industryData.share.groups,
  metric: "token" | "wallet",
) {
  const { weeks, groups } = industryData.share;
  const { providers, series } = groups[group];
  const brandColors = Object.fromEntries(
    getFamilies(benchmarkData.models).map(({ label, color }) => [label, color]),
  );
  return {
    weeks,
    providers: providers.map((p) => ({ ...p, brand: brandColors[p.name] })),
    series: series.map(({ token, wallet, ...rest }) => ({
      ...rest,
      values: { token, wallet }[metric],
    })),
  };
}

/** The data each card's chart reads, so editing one chart leaves the others' versions alone. */
function getChartData(slug: ShareSlug): unknown {
  const { long_term: longTerm, spend } = industryData;
  switch (slug) {
    case "scatter":
      return { models: benchmarkData.models, logos: getVendorLogoEntries() };
    case "token-share":
      return getShareGroupData("proprietary", "token");
    case "wallet-share":
      return getShareGroupData("proprietary", "wallet");
    case "open-source-token-share":
      return getShareGroupData("open_source", "token");
    case "open-source-wallet-share":
      return getShareGroupData("open_source", "wallet");
    case "open-weight-share":
      return {
        weeks: longTerm.weeks,
        series: longTerm.open_weight_share,
        legend: charts.open_weight_share.legend,
      };
    case "providers-used":
      return {
        weeks: longTerm.weeks,
        series: longTerm.providers_used,
        legend: charts.providers_used.legend,
      };
    case "spend":
      return { spend, labels: charts.spend.panel_labels };
  }
}

/** 32-bit FNV-1a, in base 36. */
function hash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/**
 * Changes whenever the card's copy, date, or chart data changes. X caches
 * link cards and their images by URL, so share links carry it as `?v=` to
 * get a fresh preview after a data update.
 */
export function getShareVersion(slug: string): string {
  const card = getShareCard(slug);
  if (!card) throw new Error(`No AI Index share card for "${slug}"`);
  return hash(JSON.stringify([card, getChartData(card.slug)]));
}
