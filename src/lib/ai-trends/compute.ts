import type { BenchmarkModel, ShareGroup, StackSeries } from "./schema";

export type QualityAxis = { min: number; max: number };

export type StackLayer = {
  label: string;
  provider: string;
  color: string;
  token: number[];
  wallet: number[];
};

/** One stacked series as a chart draws it: a value per week. */
export type ChartLayer = {
  label: string;
  group: string;
  tooltip: string;
  color: string;
  values: number[];
};

export type LegendGroup = {
  provider: string;
  items: { label: string; color: string }[];
};

export type FamilyOption = { label: string; color: string };

export function getPricedModels(models: BenchmarkModel[]): BenchmarkModel[] {
  return models.filter((m) => m.cost > 0);
}

export function getParetoNames(models: BenchmarkModel[]): string[] {
  const pm = getPricedModels(models);
  return pm
    .filter(
      (m) =>
        !pm.some(
          (o) =>
            o !== m &&
            o.cost <= m.cost &&
            o.quality >= m.quality &&
            (o.cost < m.cost || o.quality > m.quality),
        ),
    )
    .map((m) => m.name);
}

/** Model name without its trailing harness tag, e.g. "GLM 5.3 (codex)" -> "GLM 5.3". */
function modelName(configName: string): string {
  return configName.replace(/\s+\([^)]*\)$/, "");
}

/**
 * Distance from a configuration to the frontier line as the chart draws it:
 * log10 cost on x and quality on y, each scaled to its spread so a decade of
 * cost and the quality range weigh the same.
 */
function frontierDistance(
  m: BenchmarkModel,
  frontier: BenchmarkModel[],
  span: { x: number; y: number },
): number {
  const point = (o: BenchmarkModel) => ({
    x: Math.log10(o.cost) / span.x,
    y: o.quality / span.y,
  });
  const p = point(m);
  if (frontier.length === 1) {
    const a = point(frontier[0]);
    return Math.hypot(p.x - a.x, p.y - a.y);
  }
  let best = Infinity;
  for (let i = 0; i + 1 < frontier.length; i++) {
    const [a, b] = [point(frontier[i]), point(frontier[i + 1])];
    const [dx, dy] = [b.x - a.x, b.y - a.y];
    const t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)),
    );
    best = Math.min(
      best,
      Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)),
    );
  }
  return best;
}

/**
 * One configuration per model: the harness whose point sits closest to the
 * Pareto frontier of all priced configurations. Ties go to higher quality,
 * then lower cost. Input order is preserved.
 */
export function getBestPerModel(models: BenchmarkModel[]): BenchmarkModel[] {
  const priced = getPricedModels(models);
  if (priced.length === 0) return [];
  const paretoSet = new Set(getParetoNames(priced));
  const frontier = priced
    .filter((m) => paretoSet.has(m.name))
    .sort((a, b) => a.cost - b.cost);
  const logCosts = priced.map((m) => Math.log10(m.cost));
  const qualities = priced.map((m) => m.quality);
  const span = {
    x: Math.max(Math.max(...logCosts) - Math.min(...logCosts), 1e-9),
    y: Math.max(Math.max(...qualities) - Math.min(...qualities), 1e-9),
  };
  const winners = new Map<
    string,
    { model: BenchmarkModel; distance: number }
  >();
  for (const model of priced) {
    const distance = frontierDistance(model, frontier, span);
    const key = modelName(model.name);
    const current = winners.get(key);
    const better =
      !current ||
      distance < current.distance - 1e-12 ||
      (Math.abs(distance - current.distance) <= 1e-12 &&
        (model.quality > current.model.quality ||
          (model.quality === current.model.quality &&
            model.cost < current.model.cost)));
    if (better) winners.set(key, { model, distance });
  }
  const kept = new Set([...winners.values()].map(({ model }) => model));
  return priced.filter((m) => kept.has(m));
}

export type MetricBar = {
  label: string;
  harness: string;
  vendor: string;
  color: string;
  value: number;
};

export type TopModelPanels = {
  quality: MetricBar[];
  time: MetricBar[];
  cost: MetricBar[];
  /** Models with no timing data in any harness, left out of `time`. */
  missingTime: string[];
};

/**
 * The `count` best models on one metric, one bar per model: each model is
 * shown in whichever harness scores best on that metric.
 */
function getTopByMetric(
  models: BenchmarkModel[],
  count: number,
  value: (m: BenchmarkModel) => number | null,
  direction: "highest" | "lowest",
): MetricBar[] {
  const better = (a: number, b: number) =>
    direction === "highest" ? a > b : a < b;
  const best = new Map<string, { model: BenchmarkModel; value: number }>();
  for (const m of models) {
    const v = value(m);
    if (v === null) continue;
    const key = modelName(m.name);
    const current = best.get(key);
    if (!current || better(v, current.value))
      best.set(key, { model: m, value: v });
  }
  return [...best.entries()]
    .sort(([, a], [, b]) =>
      direction === "highest" ? b.value - a.value : a.value - b.value,
    )
    .slice(0, count)
    .map(([label, { model, value: v }]) => ({
      label,
      harness: model.harness,
      vendor: model.vendor,
      color: model.color,
      value: v,
    }));
}

/**
 * Three independent top-N rankings: highest quality, fastest and cheapest.
 */
export function getTopModelPanels(
  models: BenchmarkModel[],
  count: number,
): TopModelPanels {
  const timed = new Set(
    models
      .filter((m) => m.avg_latency_min !== null)
      .map((m) => modelName(m.name)),
  );
  return {
    quality: getTopByMetric(models, count, (m) => m.quality, "highest"),
    time: getTopByMetric(models, count, (m) => m.avg_latency_min, "lowest"),
    cost: getTopByMetric(
      getPricedModels(models),
      count,
      (m) => m.cost,
      "lowest",
    ),
    missingTime: [...new Set(models.map((m) => modelName(m.name)))].filter(
      (name) => !timed.has(name),
    ),
  };
}

export function getQualityAxis(values: number[], step: number): QualityAxis {
  if (values.length === 0) return { min: 0, max: 100 };
  const min = Math.min(...values);
  return { min: Math.floor(min / step) * step, max: 100 };
}

export function getNiceMax(values: number[]): number {
  if (values.length === 0) return 1;
  const rawMax = Math.max(...values);
  if (rawMax <= 0) return 1;
  const v = rawMax * 1.05;
  const magnitude = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / magnitude) * magnitude;
}

/** Chart.js `maxTicksLimit` on the page's spend panels. */
export const SPEND_MAX_TICKS = 6;

/** Chart.js `niceNum`: rounds a tick spacing up to 1, 2, 5 or 10 times a power of ten. */
function niceNum(range: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
  const fraction = range / magnitude;
  const epsilon = 1e-9;
  const nice =
    fraction <= 1 + epsilon
      ? 1
      : fraction <= 2 + epsilon
        ? 2
        : fraction <= 5 + epsilon
          ? 5
          : 10;
  return nice * magnitude;
}

/**
 * The y axis Chart.js draws for a page spend panel (min 0, `suggestedMax`
 * from getNiceMax, SPEND_MAX_TICKS), so the share card's ticks match the page.
 */
export function getSpendAxis(values: number[]): { max: number; step: number } {
  const suggested = getNiceMax(values);
  const step = niceNum(suggested / (SPEND_MAX_TICKS - 1));
  return { max: Math.ceil(suggested / step - 1e-9) * step, step };
}

export function getFamilies(models: BenchmarkModel[]): FamilyOption[] {
  const seen = new Map<string, string>();
  for (const m of models) {
    if (!seen.has(m.vendor)) seen.set(m.vendor, m.color);
  }
  return [...seen.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, color]) => ({ label, color }));
}

const MAX_LIGHTEN = 0.55;
const NEWEST_DARKEN = 0.3;
/** Palest shade must still read as a filled band on a white card. */
const MIN_SHADE_CONTRAST = 2.05;

function mixHex(hex: string, target: number, amount: number): string {
  const channels = [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  );
  return (
    "#" +
    channels
      .map((c) =>
        Math.round(c + (target - c) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map(
    (start) => parseInt(hex.slice(start, start + 2), 16) / 255,
  );
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Lightest tint of `baseColor` that still clears MIN_SHADE_CONTRAST on white.
 * Light hues (yellow, aqua) reach that limit sooner than dark ones, so the
 * headroom is measured per hue rather than fixed.
 */
function lightenHeadroom(baseColor: string): number {
  let lo = 0;
  let hi = MAX_LIGHTEN;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const contrast = 1.05 / (luminance(mixHex(baseColor, 255, mid)) + 0.05);
    if (contrast >= MIN_SHADE_CONTRAST) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function getModelShades(baseColor: string, count: number): string[] {
  if (count === 1) return [baseColor];
  const lighten = lightenHeadroom(baseColor);
  return Array.from({ length: count }, (_, i) => {
    const amount = lighten - (lighten + NEWEST_DARKEN) * (i / (count - 1));
    return amount >= 0
      ? mixHex(baseColor, 255, amount)
      : mixHex(baseColor, 0, -amount);
  });
}

/**
 * Provider names ordered by descending token share in the latest week, so
 * the reading order (legend, stacking) reflects current data rather than a
 * fixed list. Ties keep their relative order from `group.providers`.
 */
export function getProviderOrder(group: ShareGroup): string[] {
  const latestTokenShare = new Map<string, number>();
  for (const { provider, token } of group.series) {
    const latest = token[token.length - 1] ?? 0;
    latestTokenShare.set(
      provider,
      (latestTokenShare.get(provider) ?? 0) + latest,
    );
  }
  return group.providers
    .map(({ name }) => name)
    .sort(
      (a, b) => (latestTokenShare.get(b) ?? 0) - (latestTokenShare.get(a) ?? 0),
    );
}

/**
 * Layers in stacking order, bottom to top. Providers are ordered top to
 * bottom by `getProviderOrder`, so the last provider sits at the bottom;
 * within a provider the oldest model is lowest and the newest highest.
 * Colors depend only on the group, so the token and wallet charts share them.
 */
export function getStackLayers(
  group: ShareGroup,
  brandColors: Record<string, string> = {},
): StackLayer[] {
  const providersByName = new Map(group.providers.map((p) => [p.name, p]));
  return [...getProviderOrder(group)].reverse().flatMap((name) => {
    const provider = providersByName.get(name);
    if (!provider) return [];
    const models = group.series.filter((s) => s.provider === provider.name);
    const shades = getModelShades(
      brandColors[provider.name] ?? provider.color,
      models.length,
    );
    return models.map(({ label, token, wallet }, i) => ({
      label,
      provider: provider.name,
      color: shades[i],
      token,
      wallet,
    }));
  });
}

/** Legend entries top to bottom, matching the visual stacking order. */
export function getMetricLayers(
  layers: StackLayer[],
  metric: "token" | "wallet",
): ChartLayer[] {
  return layers.map(({ label, provider, color, ...values }) => ({
    label,
    group: provider,
    tooltip: `${label} · ${provider}`,
    color,
    values: values[metric],
  }));
}

/** Layers for a stack with no provider grouping; `group` titles the legend. */
export function getSeriesLayers(
  series: StackSeries[],
  group: string,
): ChartLayer[] {
  return series.map(({ label, color, values }) => ({
    label,
    group,
    tooltip: label,
    color,
    values,
  }));
}

/**
 * Turns "exactly N providers" buckets (bottom of the stack first, ending with
 * the single-provider bucket) into "at least N" layers: 4+, then 3+ (4+ plus
 * 3), then 2+. Smallest first, which is the order nested areas draw in. The
 * widest layer is everyone outside the single-provider bucket, so rounding in
 * the buckets doesn't move the headline number.
 */
export function getAtLeastLayers(
  series: StackSeries[],
  group: string,
): ChartLayer[] {
  const round = (v: number) => Math.round(v * 10) / 10;
  const single = series.at(-1)?.values ?? [];
  const kept = series.slice(0, -1);
  let running = single.map(() => 0);
  return kept.map(({ label, color, values }, k) => {
    running =
      k === kept.length - 1
        ? single.map((v) => round(100 - v))
        : running.map((sum, i) => round(sum + values[i]));
    const atLeast = `${parseInt(label, 10)}+ providers`;
    return { label: atLeast, group, tooltip: atLeast, color, values: running };
  });
}

export function getLegendGroups(layers: ChartLayer[]): LegendGroup[] {
  const groups: LegendGroup[] = [];
  for (const layer of [...layers].reverse()) {
    const item = { label: layer.label, color: layer.color };
    const last = groups[groups.length - 1];
    if (last?.provider === layer.group) last.items.push(item);
    else groups.push({ provider: layer.group, items: [item] });
  }
  return groups;
}
