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

const CARDS: ShareCard[] = [
  {
    slug: "scatter",
    title: charts.scatter.title,
    description: charts.scatter.description,
    updated: formatDate(benchmarkData.run_date),
  },
  {
    slug: "token-share",
    title: `Proprietary ${charts.token_share.title.toLowerCase()}`,
    description: charts.token_share.description,
    updated: shareUpdated,
  },
  {
    slug: "wallet-share",
    title: `Proprietary ${charts.wallet_share.title.toLowerCase()}`,
    description: charts.wallet_share.description,
    updated: shareUpdated,
    placeholder: walletPlaceholder,
  },
  {
    slug: "open-source-token-share",
    title: `Open-weight ${charts.open_source_token_share.title.toLowerCase()}`,
    description: charts.open_source_token_share.description,
    updated: shareUpdated,
  },
  {
    slug: "open-source-wallet-share",
    title: `Open-weight ${charts.open_source_wallet_share.title.toLowerCase()}`,
    description: charts.open_source_wallet_share.description,
    updated: shareUpdated,
    placeholder: walletPlaceholder,
  },
  {
    slug: "providers-used",
    title: charts.providers_used.title,
    description: charts.providers_used.description,
    updated: longTermUpdated,
  },
  {
    slug: "open-weight-share",
    title: charts.open_weight_share.title,
    description: charts.open_weight_share.description,
    updated: longTermUpdated,
  },
  {
    slug: "spend",
    title: charts.spend.title,
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

export function getSharePath(slug: string): string {
  return `/ai-index/share/${slug}`;
}
