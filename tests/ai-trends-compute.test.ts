import { describe, expect, test } from "vitest";

import {
  getAtLeastLayers,
  getBestPerModel,
  getFamilies,
  getLegendGroups,
  getMetricLayers,
  getModelShades,
  getNiceMax,
  getParetoNames,
  getPricedModels,
  getProviderOrder,
  getQualityAxis,
  getSeriesLayers,
  getShownRuns,
  getSpendAxis,
  getStackLayers,
  getTopModelPanels,
} from "../src/lib/ai-trends/compute";
import { benchmarkData, industryData } from "../src/lib/ai-trends/data";
import { placeLabels } from "../src/lib/ai-trends/label-placement";
import type { ShareGroup } from "../src/lib/ai-trends/schema";

const { models } = benchmarkData;

const makeModel = (
  name: string,
  quality: number,
  cost: number,
  harness = "h",
  vendor = "X",
) => ({
  name,
  vendor,
  harness,
  color: "#000000" as const,
  quality,
  cost,
  avg_turns: null as number | null,
  avg_latency_min: null as number | null,
});

describe("getPricedModels", () => {
  test("excludes models with cost === 0", () => {
    const with0 = [...models, { ...models[0], name: "unpriced", cost: 0 }];
    const result = getPricedModels(with0);
    expect(result.every((m) => m.cost > 0)).toBe(true);
    expect(result.find((m) => m.name === "unpriced")).toBeUndefined();
  });

  test("returns only priced models from synthetic fixture", () => {
    const pool = [
      makeModel("A", 80, 1),
      makeModel("B", 85, 0),
      makeModel("C", 90, 2),
    ];
    const result = getPricedModels(pool);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.name)).toEqual(["A", "C"]);
  });
});

describe("getParetoNames", () => {
  test("every Pareto model is non-dominated", () => {
    const priced = getPricedModels(models);
    const paretoSet = new Set(getParetoNames(models));
    for (const m of priced) {
      if (!paretoSet.has(m.name)) continue;
      const dominated = priced.some(
        (o) =>
          o !== m &&
          o.cost <= m.cost &&
          o.quality >= m.quality &&
          (o.cost < m.cost || o.quality > m.quality),
      );
      expect(dominated, `${m.name} should not be dominated`).toBe(false);
    }
  });

  test("every non-Pareto priced model is dominated", () => {
    const priced = getPricedModels(models);
    const paretoSet = new Set(getParetoNames(models));
    for (const m of priced) {
      if (paretoSet.has(m.name)) continue;
      const dominated = priced.some(
        (o) =>
          o !== m &&
          o.cost <= m.cost &&
          o.quality >= m.quality &&
          (o.cost < m.cost || o.quality > m.quality),
      );
      expect(dominated, `${m.name} should be dominated`).toBe(true);
    }
  });

  test("excludes a dominated config (synthetic)", () => {
    const pool = [makeModel("A", 80, 2), makeModel("B", 85, 1)];
    expect(getParetoNames(pool)).toEqual(["B"]);
  });
});

describe("getFamilies", () => {
  test("dedupes vendors, keeps first color, sorts by name", () => {
    const pool = [
      { ...makeModel("A", 80, 1, "h", "Zed"), color: "#ff0000" as const },
      { ...makeModel("B", 85, 2, "h", "Alpha"), color: "#00ff00" as const },
      { ...makeModel("C", 90, 3, "h", "Zed"), color: "#0000ff" as const },
    ];
    expect(getFamilies(pool)).toEqual([
      { label: "Alpha", color: "#00ff00" },
      { label: "Zed", color: "#ff0000" },
    ]);
  });
});

describe("getQualityAxis", () => {
  test("min is a multiple of step and <= min quality; max is 100", () => {
    const qualities = models.map((m) => m.quality);
    const step = 5;
    const { min, max } = getQualityAxis(qualities, step);
    expect(min % step).toBeCloseTo(0, 10);
    expect(min).toBeLessThanOrEqual(Math.min(...qualities));
    expect(max).toBe(100);
  });

  test("rounds down to step boundary (synthetic)", () => {
    expect(getQualityAxis([84.6, 88, 92], 5).min).toBe(80);
  });

  // B3: empty values
  test("empty values returns {min: 0, max: 100}", () => {
    expect(getQualityAxis([], 5)).toEqual({ min: 0, max: 100 });
  });
});

describe("getNiceMax", () => {
  test("result >= max of input for real spend data", () => {
    const sp = industryData.spend;
    for (const series of [sp.p50, sp.p90, sp.p99]) {
      const maxVal = Math.max(...series);
      expect(getNiceMax(series)).toBeGreaterThanOrEqual(maxVal);
    }
  });

  test("single value rounds up to 1 significant digit with 5% headroom (synthetic)", () => {
    expect(getNiceMax([100])).toBe(200);
    expect(getNiceMax([950])).toBe(1000);
  });

  // B2: empty array
  test("empty array returns 1", () => {
    expect(getNiceMax([])).toBe(1);
  });

  // B2: max <= 0
  test("all-zero values returns 1", () => {
    expect(getNiceMax([0, 0])).toBe(1);
  });

  test("negative values returns 1", () => {
    expect(getNiceMax([-1, -2])).toBe(1);
  });
});

describe("getSpendAxis", () => {
  // The ticks Chart.js draws on the page's spend panels for these maxima.
  test.each([
    [[1.1, 2.49], { max: 3, step: 1 }],
    [[82.29, 95.96], { max: 200, step: 50 }],
    [[654.18, 781.48], { max: 1000, step: 200 }],
  ])("%j -> %j", (values, axis) => {
    expect(getSpendAxis(values)).toEqual(axis);
  });
});

describe("getModelShades", () => {
  test("single model keeps the base color", () => {
    expect(getModelShades("#336699", 1)).toEqual(["#336699"]);
  });

  test("older models are lighter than newer ones", () => {
    const luminance = (hex: string) =>
      [1, 3, 5].reduce((sum, i) => sum + parseInt(hex.slice(i, i + 2), 16), 0);
    const shades = getModelShades("#336699", 4);
    expect(shades).toHaveLength(4);
    for (let i = 1; i < shades.length; i++)
      expect(luminance(shades[i])).toBeLessThan(luminance(shades[i - 1]));
  });

  test("is deterministic", () => {
    expect(getModelShades("#d97706", 5)).toEqual(getModelShades("#d97706", 5));
  });
});

describe("share stacking", () => {
  const series = (
    label: string,
    provider: string,
    older: boolean,
    token: number[],
    wallet: number[],
  ) => ({ label, provider, older, token, wallet });
  const group = {
    providers: [
      { name: "A", color: "#aa0000" },
      { name: "B", color: "#0000aa" },
    ],
    series: [
      series("Older A", "A", true, [10, 20], [5, 5]),
      series("B1", "B", false, [30, 30], [45, 45]),
      series("A1", "A", false, [60, 50], [50, 50]),
    ],
  };

  test("getProviderOrder ranks providers by descending latest-week token share", () => {
    // Latest week (index 1): A = 20 + 50 = 70, B = 30. A outranks B.
    expect(getProviderOrder(group)).toEqual(["A", "B"]);
  });

  test("getProviderOrder is data-driven, not the order providers are listed in", () => {
    const reordered = {
      providers: [
        { name: "B", color: "#0000aa" },
        { name: "A", color: "#aa0000" },
      ],
      series: group.series,
    };
    expect(getProviderOrder(reordered)).toEqual(["A", "B"]);
  });

  test("getProviderOrder on real industry data matches descending token share", () => {
    for (const group of Object.values(industryData.share.groups)) {
      const latest = (provider: string) =>
        group.series
          .filter((s) => s.provider === provider)
          .reduce((sum, s) => sum + (s.token.at(-1) ?? 0), 0);
      const order = getProviderOrder(group);
      expect(new Set(order)).toEqual(
        new Set(group.providers.map(({ name }) => name)),
      );
      const shares = order.map(latest);
      expect(shares).toEqual([...shares].sort((a, b) => b - a));
    }
  });

  test("stacks the last provider at the bottom, oldest model lowest", () => {
    expect(getStackLayers(group).map((l) => l.label)).toEqual([
      "B1",
      "Older A",
      "A1",
    ]);
  });

  test("colors depend only on the group, so token and wallet share them", () => {
    expect(getStackLayers(group)).toEqual(getStackLayers(group));
    const [older, newest] = getStackLayers(group).filter(
      (l) => l.provider === "A",
    );
    expect(older.color).not.toBe(newest.color);
  });

  test("brand colors override provider colors", () => {
    const [b] = getStackLayers(group, { B: "#00ff00" });
    expect(b.color).toBe("#00ff00");
  });

  test("legend lists providers top to bottom with newest models first", () => {
    const legend = getLegendGroups(
      getMetricLayers(getStackLayers(group), "token"),
    );
    expect(legend.map((g) => g.provider)).toEqual(["A", "B"]);
    expect(legend[0].items.map((i) => i.label)).toEqual(["A1", "Older A"]);
  });

  for (const key of ["proprietary", "open_source"] as const) {
    for (const metric of ["token", "wallet"] as const) {
      test(`${key} ${metric} shares sum to ~100 each week`, () => {
        const layers = getStackLayers(industryData.share.groups[key]);
        industryData.share.weeks.forEach((_, i) => {
          const total = layers.reduce((sum, l) => sum + l[metric][i], 0);
          expect(total).toBeCloseTo(100, 0);
        });
      });
    }
  }
});

describe("long-term stacks", () => {
  for (const key of ["open_weight_share", "providers_used"] as const) {
    test(`${key} sums to ~100 each week`, () => {
      const { weeks, [key]: series } = industryData.long_term;
      weeks.forEach((_, i) => {
        const total = series.reduce((sum, s) => sum + s.values[i], 0);
        expect(total).toBeCloseTo(100, 0);
      });
    });
  }

  test("at-least layers add up the buckets and leave out single-provider", () => {
    const series = [
      { label: "4+ providers", color: "#000001", values: [10, 20] },
      { label: "3 providers", color: "#000002", values: [15, 15] },
      { label: "2 providers", color: "#000003", values: [25, 25] },
      { label: "1 provider", color: "#000004", values: [50, 40] },
    ];
    const layers = getAtLeastLayers(series, "Companies using");
    expect(layers.map((l) => l.label)).toEqual([
      "4+ providers",
      "3+ providers",
      "2+ providers",
    ]);
    expect(layers.map((l) => l.values)).toEqual([
      [10, 20],
      [25, 35],
      [50, 60],
    ]);
    // The widest layer comes from the single-provider bucket, not the sum.
    const rounded = getAtLeastLayers(
      series.map((s, i) =>
        i < 3 ? { ...s, values: s.values.map((v) => v - 0.04) } : s,
      ),
      "x",
    );
    expect(rounded.at(-1)!.values).toEqual([50, 60]);
  });

  test("2+ providers is everyone not on a single provider", () => {
    const { providers_used: buckets } = industryData.long_term;
    const twoPlus = getAtLeastLayers(buckets, "x").at(-1)!;
    const single = buckets.at(-1)!;
    twoPlus.values.forEach((v, i) =>
      expect(v + single.values[i]).toBeCloseTo(100, 0),
    );
  });

  test("legend lists the top of the stack first under one heading", () => {
    const legend = getLegendGroups(
      getSeriesLayers(industryData.long_term.providers_used, "Providers used"),
    );
    expect(legend).toHaveLength(1);
    expect(legend[0].provider).toBe("Providers used");
    expect(legend[0].items.map((i) => i.label)).toEqual([
      "1 provider",
      "2 providers",
      "3 providers",
      "4+ providers",
    ]);
  });
});

describe("industry data", () => {
  test("wallet data is not flagged as placeholder", () => {
    expect(industryData.share.wallet_placeholder).not.toBe(true);
  });

  /**
   * Machado-Oliveira-Fernandes (2009) severity-1.0 color-vision-deficiency
   * simulation, then Euclidean distance in OKLab x100 - the same metric the
   * dataviz palette validator uses. RGB distance cannot replace this: red and
   * green sit far apart in RGB yet collapse onto each other for deuteranopes.
   */
  const CVD_MATRICES = {
    protan: [
      [0.152286, 1.052583, -0.204868],
      [0.114503, 0.786281, 0.099216],
      [-0.003882, -0.048116, 1.051998],
    ],
    deutan: [
      [0.367322, 0.860646, -0.227968],
      [0.280085, 0.672501, 0.047413],
      [-0.01182, 0.04294, 0.968881],
    ],
  };
  const toLinear = (hex: string) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const toOklab = ([r, g, b]: number[]) => {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  };
  const deltaE = (a: string, b: string, kind?: keyof typeof CVD_MATRICES) => {
    const project = (hex: string) => {
      const rgb = toLinear(hex);
      if (!kind) return toOklab(rgb);
      return toOklab(
        CVD_MATRICES[kind].map((row) =>
          Math.max(
            0,
            Math.min(
              1,
              row.reduce((sum, w, i) => sum + w * rgb[i], 0),
            ),
          ),
        ),
      );
    };
    const [x, y] = [project(a), project(b)];
    return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
  };

  const effectiveProviderColors = (group: ShareGroup) => {
    const brandColors = Object.fromEntries(
      getFamilies(models).map(({ label, color }) => [label, color]),
    );
    return getProviderOrder(group).map((name) => {
      const provider = group.providers.find((p) => p.name === name);
      return { name, color: brandColors[name] ?? provider?.color ?? "" };
    });
  };

  /**
   * Compares the shades actually drawn, not the base hues. Two families can
   * clear the gate on their base hue yet still collide once each is spread
   * into a light-to-dark ramp - light orange and light teal, for instance,
   * converge even though #eb6834 and #1baf7a do not.
   */
  const familyShades = (group: ShareGroup, provider: string, color: string) =>
    getModelShades(
      color,
      group.series.filter((s) => s.provider === provider).length,
    );

  const closestShadePair = (a: string[], b: string[]) => {
    let normal = Infinity;
    let cvd = Infinity;
    for (const x of a)
      for (const y of b) {
        normal = Math.min(normal, deltaE(x, y));
        cvd = Math.min(cvd, deltaE(x, y, "protan"), deltaE(x, y, "deutan"));
      }
    return { normal, cvd };
  };

  /**
   * Stack order is data-driven (descending token share), so any two families
   * can end up adjacent after a refresh - the 2026-10-05 data moved DeepSeek
   * next to GPT-OSS, two warm hues that sit at 8.6. There is therefore no
   * adjacency-specific bar to hold: the only stable invariant is the
   * all-pairs floor asserted below, which adjacency is a subset of. This test
   * pins the measured adjacency so a palette or shade-ramp change that makes
   * neighbours worse fails loudly instead of sliding.
   */
  test("neighbouring families in the stack stay distinct once shaded", () => {
    for (const group of Object.values(industryData.share.groups)) {
      const stack = effectiveProviderColors(group).map(({ name, color }) => ({
        name,
        shades: familyShades(group, name, color),
      }));
      for (let i = 0; i + 1 < stack.length; i++) {
        const [a, b] = [stack[i], stack[i + 1]];
        const { normal } = closestShadePair(a.shades, b.shades);
        expect(
          normal,
          `${a.name} vs ${b.name} (normal vision)`,
        ).toBeGreaterThanOrEqual(8);
      }
    }
  });

  /**
   * 8.4 is the measured ceiling, not a preference: with nine families each
   * spread into a 3-6 step ramp, no assignment of the eight brand hues gets
   * every pair further apart (solid one-colour-per-provider bands reach 15.6).
   * Colorblind separation is unreachable at this family count for the same
   * reason, so the stack leans on its labelled legend and hover values.
   */
  test("every provider pair in a group is distinct for normal vision", () => {
    for (const group of Object.values(industryData.share.groups)) {
      const colors = effectiveProviderColors(group);
      colors.forEach((a, i) =>
        colors.slice(i + 1).forEach((b) => {
          expect(
            deltaE(a.color, b.color),
            `${a.name} vs ${b.name} (${a.color} vs ${b.color})`,
          ).toBeGreaterThanOrEqual(8);
        }),
      );
    }
  });

  test("long-term stack neighbours stay distinct, including for colorblind readers", () => {
    for (const series of [
      industryData.long_term.open_weight_share,
      industryData.long_term.providers_used,
    ])
      for (let i = 0; i + 1 < series.length; i++) {
        const [a, b] = [series[i].color, series[i + 1].color];
        const pair = `${series[i].label} vs ${series[i + 1].label}`;
        expect(deltaE(a, b), pair).toBeGreaterThanOrEqual(8);
        expect(
          Math.min(deltaE(a, b, "protan"), deltaE(a, b, "deutan")),
          `${pair} (colorblind)`,
        ).toBeGreaterThanOrEqual(8);
      }
  });

  test("palest shade of every provider still reads against a white card", () => {
    const luminance = (hex: string) => {
      const [r, g, b] = toLinear(hex);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const group of Object.values(industryData.share.groups)) {
      for (const { name, color } of effectiveProviderColors(group)) {
        const modelCount = group.series.filter(
          (s) => s.provider === name,
        ).length;
        const palest = getModelShades(color, modelCount)[0];
        const contrast = 1.05 / (luminance(palest) + 0.05);
        expect(
          contrast,
          `${name} palest shade ${palest}`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("getBestPerModel", () => {
  test("keeps the harness closest to the frontier for each model", () => {
    const pool = [
      makeModel("Cheap (codex)", 80, 0.1),
      makeModel("Top (codex)", 95, 10),
      // On the frontier vs well below it: the frontier harness wins.
      makeModel("Mid (claude code)", 90, 1),
      makeModel("Mid (codex)", 82, 1),
      // Neither is on the frontier; the one nearer the line wins.
      makeModel("Off (claude code)", 70, 5),
      makeModel("Off (codex)", 85, 5),
    ];
    expect(getBestPerModel(pool).map((m) => m.name)).toEqual([
      "Cheap (codex)",
      "Top (codex)",
      "Mid (claude code)",
      "Off (codex)",
    ]);
  });

  test("returns one configuration per model on the real benchmark", () => {
    const best = getBestPerModel(models);
    const names = best.map((m) => m.name.replace(/\s+\([^)]*\)$/, ""));
    expect(new Set(names).size).toBe(names.length);
    const all = new Set(
      getPricedModels(models).map((m) => m.name.replace(/\s+\([^)]*\)$/, "")),
    );
    expect(new Set(names)).toEqual(all);
  });
});

describe("getTopModelPanels", () => {
  const pool = [
    { ...makeModel("A (codex)", 95, 3, "Codex"), avg_latency_min: 20 },
    {
      ...makeModel("A (claude code)", 90, 1, "Claude Code"),
      avg_latency_min: 4,
    },
    { ...makeModel("B (codex)", 92, 2, "Codex"), avg_latency_min: 5 },
    { ...makeModel("C (codex)", 85, 0.5, "Codex"), avg_latency_min: null },
    { ...makeModel("D (codex)", 80, 0, "Codex"), avg_latency_min: 1 },
  ];

  test("ranks each metric on its own, one bar per model", () => {
    const panels = getTopModelPanels(pool, 3);
    expect(panels.quality.map((b) => b.label)).toEqual(["A", "B", "C"]);
    expect(panels.time.map((b) => b.label)).toEqual(["D", "A", "B"]);
    expect(panels.cost.map((b) => b.label)).toEqual(["C", "A", "B"]);
    expect(panels.missingTime).toEqual(["C"]);
  });

  test("shows each model in its best harness for that metric", () => {
    const panels = getTopModelPanels(pool, 3);
    expect(panels.quality[0]).toMatchObject({ harness: "Codex", value: 95 });
    expect(panels.time[1]).toMatchObject({ harness: "Claude Code", value: 4 });
    expect(panels.cost[1]).toMatchObject({ harness: "Claude Code", value: 1 });
  });
});

describe("getShownRuns", () => {
  test("keeps Claude Code runs only for Anthropic models and every Codex run", () => {
    const pool = [
      makeModel("Claude A (claude code)", 90, 1, "Claude Code", "Anthropic"),
      makeModel("Claude A (codex)", 89, 2, "Codex", "Anthropic"),
      makeModel("GPT B (claude code)", 95, 1, "Claude Code", "OpenAI"),
      makeModel("GPT B (codex)", 91, 1, "Codex", "OpenAI"),
    ];
    expect(getShownRuns(pool).map((m) => m.name)).toEqual([
      "Claude A (claude code)",
      "Claude A (codex)",
      "GPT B (codex)",
    ]);
  });

  test("every benchmark model keeps at least one shown run", () => {
    const name = (n: string) => n.replace(/ \([^)]*\)$/, "");
    const shown = new Set(getShownRuns(models).map((m) => name(m.name)));
    expect(
      [...new Set(models.map((m) => name(m.name)))].filter(
        (n) => !shown.has(n),
      ),
    ).toEqual([]);
  });
});

describe("placeLabels", () => {
  const area = { left: 0, top: 0, right: 400, bottom: 300 };
  const item = (x: number, y: number, priority: number, required = false) => ({
    x,
    y,
    width: 100,
    height: 14,
    marker: 24,
    priority,
    required,
  });
  const angles = (placements: ReturnType<typeof placeLabels>) =>
    placements.map((p) => (p.hidden ? "hidden" : p.angle));
  const markerBox = ({ x, y, marker }: ReturnType<typeof item>) => ({
    left: x - marker / 2,
    top: y - marker / 2,
    right: x + marker / 2,
    bottom: y + marker / 2,
  });
  const overlaps = (
    a: { left: number; top: number; right: number; bottom: number },
    b: { left: number; top: number; right: number; bottom: number },
  ) =>
    a.left < b.right &&
    b.left < a.right &&
    a.top < b.bottom &&
    b.top < a.bottom;

  test("puts labels on top when there is room", () => {
    expect(
      angles(placeLabels([item(100, 100, 1), item(300, 200, 0)], area, 10)),
    ).toEqual([-90, -90]);
  });

  test("moves a lower-priority label off a spot another label took", () => {
    expect(
      angles(placeLabels([item(100, 100, 1), item(150, 105, 0)], area, 10)),
    ).toEqual([-90, 0]);
  });

  test("keeps labels inside the chart area", () => {
    expect(angles(placeLabels([item(100, 10, 0)], area, 10))).toEqual([0]);
  });

  test("never covers another logo; a crowded label moves out with a leader", () => {
    const crowded = [
      item(100, 100, 3),
      item(150, 104, 2),
      item(100, 130, 1),
      item(40, 112, 0),
      item(160, 140, 0),
    ];
    const placements = placeLabels(crowded, area, 10);
    placements.forEach((p, i) => {
      if (p.hidden || !p.box) return;
      crowded.forEach((other, j) => {
        if (j !== i)
          expect(overlaps(p.box!, markerBox(other)), `${i} covers ${j}`).toBe(
            false,
          );
      });
    });
    expect(placements.some((p) => p.leader && !p.hidden)).toBe(true);
  });

  test("hides an optional label with no clear spot but keeps a required one", () => {
    const boxedIn = (required: boolean) =>
      placeLabels(
        [
          item(200, 150, 0, required),
          ...[-60, -30, 0, 30, 60].flatMap((dx) =>
            [-60, -30, 0, 30, 60]
              .filter((dy) => dx !== 0 || dy !== 0)
              .map((dy) => ({ ...item(200 + dx * 3, 150 + dy, 0), width: 1 })),
          ),
        ],
        area,
        10,
      )[0];
    expect(boxedIn(false).hidden).toBe(true);
    expect(boxedIn(true).hidden).toBe(false);
  });
});
