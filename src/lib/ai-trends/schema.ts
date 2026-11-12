import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const httpsUrl = z.url({ protocol: /^https$/ });
const nullableMetric = z.number().nonnegative().nullable();

const benchmarkModelSchema = z.object({
  name: z.string().min(1),
  vendor: z.string().min(1),
  harness: z.string().min(1),
  color: hexColor,
  quality: z.number().min(0).max(100),
  cost: z.number().nonnegative(),
  avg_turns: nullableMetric,
  avg_latency_min: nullableMetric,
});

export const benchmarkDataSchema = z
  .object({
    source: z.string().min(1),
    run_date: isoDate,
    meta: z.object({
      quality_metric: z.string().min(1),
      quality_metric_label: z.string().min(1),
      note: z.string(),
    }),
    models: z.array(benchmarkModelSchema).min(1),
  })
  .refine(
    ({ models }) =>
      new Set(models.map(({ name }) => name)).size === models.length,
    { message: "Benchmark model names must be unique", path: ["models"] },
  );

const weeklySeries = z.array(z.number().nonnegative());

const shareSeriesSchema = z.object({
  label: z.string().min(1),
  provider: z.string().min(1),
  older: z.boolean(),
  token: weeklySeries,
  wallet: weeklySeries,
});

const shareGroupSchema = z.object({
  providers: z
    .array(z.object({ name: z.string().min(1), color: hexColor }))
    .min(1),
  series: z.array(shareSeriesSchema).min(1),
});

const SHARE_SUM_TOLERANCE = 0.5;

const stackSeriesSchema = z.object({
  label: z.string().min(1),
  color: hexColor,
  values: weeklySeries,
});

/** Every series has one value per week, and each week's values sum to 100. */
function validateStack(
  name: string,
  weeks: string[],
  series: { label: string; values: number[] }[],
  path: string[],
  ctx: z.RefinementCtx,
): void {
  for (const { label, values } of series)
    if (values.length !== weeks.length)
      ctx.addIssue({
        code: "custom",
        message: `${name} series "${label}" must have one value per week`,
        path,
      });
  weeks.forEach((week, i) => {
    const total = series.reduce((sum, { values }) => sum + (values[i] ?? 0), 0);
    if (Math.abs(total - 100) > SHARE_SUM_TOLERANCE)
      ctx.addIssue({
        code: "custom",
        message: `${name} for ${week} sums to ${total.toFixed(2)}, expected 100`,
        path,
      });
  });
}

function validateShareGroup(
  name: string,
  weeks: string[],
  group: z.infer<typeof shareGroupSchema>,
  ctx: z.RefinementCtx,
): void {
  const path = ["share", "groups", name, "series"];
  const providerNames = new Set(group.providers.map(({ name }) => name));
  for (const series of group.series) {
    if (!providerNames.has(series.provider))
      ctx.addIssue({
        code: "custom",
        message: `${name} series "${series.label}" references unknown provider "${series.provider}"`,
        path,
      });
  }
  for (const metric of ["token", "wallet"] as const)
    validateStack(
      `${name} ${metric}`,
      weeks,
      group.series.map(({ label, ...series }) => ({
        label,
        values: series[metric],
      })),
      path,
      ctx,
    );
}

export const industryDataSchema = z
  .object({
    source: z.string().min(1),
    share: z.object({
      wallet_placeholder: z.boolean().optional(),
      as_of: isoDate,
      weeks: z.array(z.string()).min(1),
      groups: z.object({
        proprietary: shareGroupSchema,
        open_source: shareGroupSchema,
      }),
    }),
    spend: z.object({
      as_of: isoDate,
      unit: z.string(),
      weeks: z.array(z.string()).min(1),
      p50: weeklySeries,
      p90: weeklySeries,
      p99: weeklySeries,
    }),
    long_term: z.object({
      as_of: isoDate,
      weeks: z.array(z.string()).min(1),
      open_weight_share: z.array(stackSeriesSchema).min(1),
      providers_used: z.array(stackSeriesSchema).min(1),
    }),
  })
  .superRefine(({ share, spend, long_term: longTerm }, ctx) => {
    for (const [name, group] of Object.entries(share.groups))
      validateShareGroup(name, share.weeks, group, ctx);
    for (const key of ["p50", "p90", "p99"] as const)
      if (spend[key].length !== spend.weeks.length)
        ctx.addIssue({
          code: "custom",
          message: `spend.${key} must have one value per week`,
          path: ["spend", key],
        });
    for (const key of ["open_weight_share", "providers_used"] as const)
      validateStack(
        `long_term.${key}`,
        longTerm.weeks,
        longTerm[key],
        ["long_term", key],
        ctx,
      );
  });

const panelCopy = z.object({
  title: z.string().min(1),
  caption: z.string(),
  axis: z.string().min(1),
});

const sectionCopy = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string(),
});

const chartCopy = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  note: z.string().optional(),
});

export const contentDataSchema = z.object({
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  header: z.object({
    title_lead: z.string().min(1),
    title_accent: z.string().min(1),
    intro: z.string().min(1),
  }),
  sections: z.object({
    proprietary: sectionCopy,
    open_source: sectionCopy,
    long_term: sectionCopy,
    spend: sectionCopy,
    frontier: sectionCopy,
    changelog: sectionCopy,
  }),
  charts: z.object({
    scatter: chartCopy,
    top_models: z.object({
      panels: z.object({
        quality: panelCopy,
        time: panelCopy,
        cost: panelCopy,
      }),
    }),
    token_share: chartCopy,
    wallet_share: chartCopy,
    open_source_token_share: chartCopy,
    open_source_wallet_share: chartCopy,
    open_weight_share: chartCopy.extend({ legend: z.string().min(1) }),
    providers_used: chartCopy.extend({ legend: z.string().min(1) }),
    spend: chartCopy.extend({
      panel_labels: z.object({
        p50: z.string().min(1),
        p90: z.string().min(1),
        p99: z.string().min(1),
      }),
    }),
  }),
  changelog: z.array(
    z.object({
      date: isoDate,
      category: z.string().min(1),
      title: z.string().min(1),
      url: httpsUrl,
      description: z.string(),
    }),
  ),
});

export type BenchmarkModel = z.infer<typeof benchmarkModelSchema>;
export type ShareGroup = z.infer<typeof shareGroupSchema>;
export type StackSeries = z.infer<typeof stackSeriesSchema>;
export type ContentData = z.infer<typeof contentDataSchema>;
