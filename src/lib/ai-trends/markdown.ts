import {
  getAtLeastLayers,
  getBestPerModel,
  getParetoNames,
  getShownRuns,
  getTopModelPanels,
  type MetricBar,
} from "./compute";
import { benchmarkData, contentData, industryData } from "./data";
import { formatDate } from "./format";
import type { ShareGroup } from "./schema";
import { getShareCard, getSharePath, type ShareSlug } from "./share-cards";

const TOP_COUNT = 3;

/**
 * Next.js serves file-based metadata images under a route group at
 * `opengraph-image-<suffix>`, where the suffix is a djb2 hash of the parent app
 * path (`getMetadataRouteSuffix` in next/dist/lib/metadata, not exported).
 */
function openGraphImagePath(appDir: string, urlPath: string): string {
  let hash = 5381;
  for (const char of appDir) {
    hash = ((hash << 5) + hash + char.charCodeAt(0)) & 0xffffffff;
  }
  const suffix = (hash >>> 0).toString(36).slice(0, 6);
  return `${urlPath}/opengraph-image-${suffix}`;
}

const list = new Intl.ListFormat("en-US", {
  style: "long",
  type: "conjunction",
});

function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function usd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function minutes(value: number): string {
  return `${value.toFixed(1)} min`;
}

function last<T>(values: readonly T[]): T {
  const value = values.at(-1);
  if (value === undefined) throw new Error("Expected a non-empty series");
  return value;
}

function shareImageLinks(slug: ShareSlug): string[] {
  const card = getShareCard(slug);
  if (!card) throw new Error(`Missing AI Index share card "${slug}"`);
  const path = getSharePath(slug);
  return [
    `![${card.title}](${openGraphImagePath("/(website)/ai-index/share/[chart]", path)})`,
    "",
    `[Share page for this chart](${path})`,
  ];
}

function describeShare(
  group: ShareGroup,
  metric: "token" | "wallet",
  weeks: readonly string[],
): string {
  const latestWeek = last(weeks);
  const firstWeek = weeks[0];
  const noun = metric === "token" ? "token shares" : "shares of wallet";

  const leaders = [...group.series]
    .sort((a, b) => last(b[metric]) - last(a[metric]))
    .slice(0, TOP_COUNT)
    .map((series) => `${series.label} (${percent(last(series[metric]))})`);

  const providers = group.providers
    .map(({ name }) => {
      const series = group.series.filter((s) => s.provider === name);
      const sum = (pick: (values: number[]) => number) =>
        series.reduce((total, s) => total + pick(s[metric]), 0);
      return { name, first: sum((v) => v[0]), latest: sum(last) };
    })
    .sort((a, b) => b.latest - a.latest)
    .map(
      (p) =>
        `${p.name} ${percent(p.latest)} (${percent(p.first)} in the week of ${firstWeek})`,
    );

  const changes = group.series
    .map((s) => ({
      label: s.label,
      first: s[metric][0],
      latest: last(s[metric]),
    }))
    .sort((a, b) => b.latest - b.first - (a.latest - a.first));
  const gainer = changes[0];
  const loser = last(changes);

  const sentences = [
    `In the week of ${latestWeek}, the largest ${noun} were ${list.format(leaders)}.`,
    `Provider totals: ${list.format(providers)}.`,
  ];
  if (gainer.latest > gainer.first && loser.latest < loser.first) {
    sentences.push(
      `Since the week of ${firstWeek}, ${gainer.label} gained the most (${percent(gainer.first)} to ${percent(gainer.latest)}) and ${loser.label} lost the most (${percent(loser.first)} to ${percent(loser.latest)}).`,
    );
  }
  return sentences.join(" ");
}

function shareChartSection(
  copy: { title: string; description: string; note?: string },
  slug: ShareSlug,
  description: string,
  asOf = industryData.share.as_of,
): string[] {
  return [
    `### ${copy.title}`,
    "",
    `${copy.description} Updated ${formatDate(asOf)}.`,
    "",
    description,
    "",
    ...(copy.note ? [copy.note, ""] : []),
    ...shareImageLinks(slug),
    "",
  ];
}

function shareGroupSections(
  group: ShareGroup,
  token: { title: string; description: string; note?: string },
  wallet: { title: string; description: string; note?: string },
  slugs: { token: ShareSlug; wallet: ShareSlug },
): string[] {
  const { weeks, wallet_placeholder: walletPlaceholder } = industryData.share;
  return [
    ...shareChartSection(
      token,
      slugs.token,
      describeShare(group, "token", weeks),
    ),
    ...shareChartSection(
      wallet,
      slugs.wallet,
      walletPlaceholder
        ? "This chart shows placeholder data."
        : describeShare(group, "wallet", weeks),
    ),
  ];
}

/** Each layer's share in the latest and first week, top of the stack first. */
function describeStack(
  series: { label: string; values: number[] }[],
  weeks: readonly string[],
): string {
  const shares = [...series]
    .reverse()
    .map(
      ({ label, values }) =>
        `${label} ${percent(last(values))} (${percent(values[0])} in the week of ${weeks[0]})`,
    );
  return `In the week of ${last(weeks)}: ${list.format(shares)}.`;
}

type SpendKey = "p50" | "p90" | "p99";

export function describeSpend(
  spend: { weeks: string[] } & Record<SpendKey, number[]>,
  labels: Record<SpendKey, string>,
): string {
  const keys: SpendKey[] = ["p50", "p90", "p99"];
  const latest = keys.map((key) => `${usd(last(spend[key]))} (${labels[key]})`);
  const changes = keys.map((key) => {
    const first = spend[key][0];
    const current = last(spend[key]);
    if (current === first) return `${labels[key]} unchanged at ${usd(first)}`;
    const direction = current > first ? "up" : "down";
    const change =
      first > 0
        ? ` ${Math.abs(((current - first) / first) * 100).toFixed(0)}%`
        : "";
    return `${labels[key]} ${direction}${change} from ${usd(first)}`;
  });
  return [
    `In the week of ${last(spend.weeks)}, weekly spend per active user was ${list.format(latest)}.`,
    `Compared with the week of ${spend.weeks[0]}: ${list.format(changes)}.`,
  ].join(" ");
}

function describeFrontier(): string[] {
  const models = getBestPerModel(getShownRuns(benchmarkData.models));
  const frontier = new Set(getParetoNames(models));
  const label = benchmarkData.meta.quality_metric_label.toLowerCase();
  return [
    `The chart plots ${label} against average cost per task for ${models.length} models, one point each. Updated ${formatDate(benchmarkData.run_date)}.`,
    "",
    `A model is on the frontier when no other model matches or beats it on both cost and ${label}. Frontier models from lowest to highest cost:`,
    "",
    ...models
      .filter((m) => frontier.has(m.name))
      .sort((a, b) => a.cost - b.cost)
      .map(
        (m) =>
          `- ${m.name}: ${percent(m.quality)} ${label}, ${usd(m.cost)} per task`,
      ),
  ];
}

function topModelSection(
  panel: { title: string; caption: string },
  bars: MetricBar[],
  format: (value: number) => string,
  missing: string[],
): string[] {
  const leaders = bars.map(
    (bar) => `${bar.label} (${bar.harness}, ${format(bar.value)})`,
  );
  return [
    `### ${panel.title}`,
    "",
    `${panel.caption} The top three are ${list.format(leaders)}.`,
    "",
    ...(missing.length > 0
      ? [`Not ranked, no timing data: ${missing.join(", ")}.`, ""]
      : []),
  ];
}

function sectionHeading(section: { title: string; intro: string }): string[] {
  return [
    `## ${section.title}`,
    "",
    ...(section.intro ? [section.intro, ""] : []),
  ];
}

export function renderAiIndexMarkdown(): string {
  const { header, sections, charts, changelog } = contentData;
  const { proprietary, open_source: openSource } = industryData.share.groups;
  const { long_term: longTerm } = industryData;
  const top = getTopModelPanels(getShownRuns(benchmarkData.models), TOP_COUNT);
  const panels = charts.top_models.panels;

  return [
    `# ${header.title_lead} ${header.title_accent}`,
    "",
    header.intro,
    "",
    ...sectionHeading(sections.proprietary),
    ...shareGroupSections(
      proprietary,
      charts.token_share,
      charts.wallet_share,
      {
        token: "token-share",
        wallet: "wallet-share",
      },
    ),
    ...sectionHeading(sections.open_source),
    ...shareGroupSections(
      openSource,
      charts.open_source_token_share,
      charts.open_source_wallet_share,
      { token: "open-source-token-share", wallet: "open-source-wallet-share" },
    ),
    ...sectionHeading(sections.long_term),
    ...shareChartSection(
      charts.providers_used,
      "providers-used",
      describeStack(
        getAtLeastLayers(longTerm.providers_used, ""),
        longTerm.weeks,
      ),
      longTerm.as_of,
    ),
    ...shareChartSection(
      charts.open_weight_share,
      "open-weight-share",
      describeStack(longTerm.open_weight_share, longTerm.weeks),
      longTerm.as_of,
    ),
    ...sectionHeading(sections.spend),
    `### ${charts.spend.title}`,
    "",
    `${charts.spend.description} Updated ${formatDate(industryData.spend.as_of)}.`,
    "",
    describeSpend(industryData.spend, charts.spend.panel_labels),
    "",
    ...(charts.spend.note ? [charts.spend.note, ""] : []),
    ...shareImageLinks("spend"),
    "",
    ...sectionHeading(sections.frontier),
    `### ${charts.scatter.title}`,
    "",
    ...describeFrontier(),
    "",
    ...(charts.scatter.note ? [charts.scatter.note, ""] : []),
    ...shareImageLinks("scatter"),
    "",
    ...topModelSection(panels.quality, top.quality, percent, []),
    ...topModelSection(panels.time, top.time, minutes, top.missingTime),
    ...topModelSection(panels.cost, top.cost, usd, []),
    ...sectionHeading(sections.changelog),
    ...changelog.map(
      (entry) =>
        `- [${entry.title}](${entry.url}) (${formatDate(entry.date)}): ${entry.description}`,
    ),
    "",
  ].join("\n");
}
