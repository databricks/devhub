import { benchmarkData, contentData, industryData } from "./data";
import { formatDate } from "./format";

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

const CARDS: ShareCard[] = [
  {
    slug: "scatter",
    title: charts.scatter.title,
    description: charts.scatter.description,
    updated: formatDate(benchmarkData.run_date),
  },
  {
    slug: "token-share",
    title: `${GATEWAY} proprietary ${charts.token_share.title.toLowerCase()}`,
    description: charts.token_share.description,
    updated: shareUpdated,
  },
  {
    slug: "wallet-share",
    title: `${GATEWAY} proprietary ${charts.wallet_share.title.toLowerCase()}`,
    description: charts.wallet_share.description,
    updated: shareUpdated,
    placeholder: walletPlaceholder,
  },
  {
    slug: "open-source-token-share",
    title: `${GATEWAY} open-weight ${charts.open_source_token_share.title.toLowerCase()}`,
    description: charts.open_source_token_share.description,
    updated: shareUpdated,
  },
  {
    slug: "open-source-wallet-share",
    title: `${GATEWAY} open-weight ${charts.open_source_wallet_share.title.toLowerCase()}`,
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
