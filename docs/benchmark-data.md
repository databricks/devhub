# Databricks AI Index data files

The three JSON files under `src/lib/ai-trends/data/` power every chart,
count, axis, date, and piece of copy on the Databricks AI Index page (`/ai-index`). They are
imported and validated at build time via Zod schemas defined in
`src/lib/ai-trends/schema.ts`. A build fails if any file violates its schema.

---

## benchmark.json

Drives the cost/performance scatter (the Pareto frontier section).

| Field                       | Type               | Description                                                             |
| --------------------------- | ------------------ | ----------------------------------------------------------------------- |
| `source`                    | string             | Human-readable, public-safe note describing where the data came from.   |
| `run_date`                  | YYYY-MM-DD         | Date of the benchmark run (the max `as_of` across rows).                |
| `meta.quality_metric`       | string             | Column name used as the quality axis (`aggregate_mean_score`).          |
| `meta.quality_metric_label` | string             | Human label for the quality metric.                                     |
| `meta.note`                 | string             | Displayed in chart footers.                                             |
| `models[].name`             | string             | `"{model_name} ({harness_display})"` — must be unique across the array. |
| `models[].vendor`           | string             | Vendor name, e.g. `"Anthropic"`. Drives grouping in the family filter.  |
| `models[].harness`          | string             | Display name for the harness, e.g. `"Claude Code"`.                     |
| `models[].color`            | #rrggbb            | Vendor hex color used in the scatter chart for this model.              |
| `models[].quality`          | number 0–100       | `round(aggregate_mean_score × 100, 1)`.                                 |
| `models[].cost`             | number ≥ 0         | `round(aggregate_mean_cost_per_task, 3)` in USD per task.               |
| `models[].avg_turns`        | number ≥ 0 \| null | `round(aggregate_average_turns, 1)`. Null when not measured.            |
| `models[].avg_latency_min`  | number ≥ 0 \| null | `round(aggregate_average_latency_minutes, 1)`. Null when not measured.  |

---

## content.json

All page copy: header text, section titles, chart titles/descriptions, and
changelog. No chart values live here. There are no runtime placeholders
(e.g. `{n_configs}`) — write copy as final text.

Key sub-objects:

- **`seo`** — page `title` and `description`.
- **`header`** — `title_lead`, `title_accent`, and `intro` (inline links use `[label](https://…)`).
- **`sections`** — display `title` and `intro` copy for each page section: `proprietary`, `open_source`, `long_term`, `spend`, `frontier` (the scatter section), `changelog`.
- **`charts`** — `title`/`description` (and optional `note`) for each chart: `scatter`, `token_share`, `wallet_share`, `open_source_token_share`, `open_source_wallet_share`, `open_weight_share`, `providers_used` (which also has a `legend` heading), and `spend` (which also has `panel_labels.p50/p90/p99`).
- **`changelog`** — chronological array of `{date, category, title, description}` entries shown in the Changelog section.

Content fields support two inline formats:

- `[label](https://…)` — rendered as a link.
- `**bold**` — rendered as bold text.

### Adding a changelog entry

Prepend an object to `changelog`:

```json
{
  "date": "2026-10-01",
  "category": "Benchmark Update",
  "title": "Benchmark refreshed to the October 1 run — 26 configurations",
  "description": "Added Gemini Argon 4, Grok 4.7. Updated scores for 5 configurations."
}
```

The `--changelog` flag in the exporter prepends this entry automatically.

---

## industry.json

Drives the market-share charts (proprietary and open-weight token/wallet
share), the rolling spend percentiles and the long-term trends section. This data comes from Unity Gateway
usage across external enterprise customers, aggregated and anonymized.

**Source:** The industry trends queries maintained by the AI Index team
outside this repository. Run them to produce fresh data, then update this file.

| Section                                | Key fields                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `share.as_of`                          | Date the share data was last refreshed.                                                                                                                                                                                                                                                                                                                                                                |
| `share.wallet_placeholder`             | Optional. When `true`, the wallet-share charts render as a placeholder (not enough data yet).                                                                                                                                                                                                                                                                                                          |
| `share.weeks`                          | Ordered array of week-label strings (e.g. `"Sep 20"`). All series in both groups must have one value per week.                                                                                                                                                                                                                                                                                         |
| `share.groups.proprietary/open_source` | Each group has `providers[]` (`{name, color}`) and `series[]` (`{label, provider, older, token, wallet}`). Every series' `provider` must exist in that group's `providers`, and for every week the `token` values across a group's series must sum to 100 (and likewise for `wallet`), within a small tolerance.                                                                                       |
| `spend.as_of` / `spend.unit`           | Date and unit (e.g. `"USD"`) for the spend percentiles.                                                                                                                                                                                                                                                                                                                                                |
| `spend.weeks`                          | Week labels; `p50`/`p90`/`p99` arrays must each match this length.                                                                                                                                                                                                                                                                                                                                     |
| `long_term`                            | Longer-window trends from Databricks-hosted models only, so a smaller customer base than `share`. `as_of`, `weeks`, `open_weight_share` (percent of tokens that go to open-weight models, one value per week) and `providers_used` (share of active companies by number of model providers used: an array of `{label, color, values}`, listed bottom of the stack first, where each week sums to 100). |

**Adding a new provider:** Add it to the relevant group's `providers` array
with a hex color, then add a matching `series` entry whose `token`/`wallet`
arrays have one value per week. Re-balance the group's other series so each
week's `token` values (and `wallet` values) still sum to 100 — the schema
rejects any week that doesn't.

---

## Refresh workflow

### Benchmark data (benchmark.json)

The exporter script, `export_benchmark.py`, and its config,
`export_benchmark.config.json`, are maintained by the AI Index team outside
this repository. Run it from a checkout of that exporter (`<exporter>` below).

```bash
# Refresh benchmark.json from the live dashboard:
python3 <exporter>/scripts/export_benchmark.py \
  --profile <your-profile> \
  --out src/lib/ai-trends/data/benchmark.json \
  --diff \
  --changelog src/lib/ai-trends/data/content.json
```

The `--diff` flag prints added/removed/changed configurations before writing.
The `--changelog` flag prepends a dated "Benchmark Update" entry to
`content.json`. Both compare against the current file before it is overwritten,
so run them together.

After updating the file:

```bash
pnpm benchmark:check   # validate JSON schemas without a full build
pnpm build             # full build — also validates all three data files
```

Open a data-only PR titled `data(benchmark): refresh YYYY-MM-DD`.

### Testing the exporter without workspace access

Use `--from-rows` with a local JSON file containing row objects whose keys
match the SQL result columns:

```bash
python3 <exporter>/scripts/export_benchmark.py \
  --from-rows <exporter>/scripts/fixtures/rows_normal.json
```

Sample fixtures live at `<exporter>/scripts/fixtures/`. The exporter
exits non-zero with a descriptive message if it encounters an unknown brand or
harness code — add the new value to `export_benchmark.config.json` rather than
editing the script.

### Brand, harness, and exclude-list changes

All mappings are in `export_benchmark.config.json`:

- `brand_to_vendor` / `vendor_colors` — add new labs here.
- `harness_name_display` / `harness_field_display` — add new harness codes here.
- `exclude` — list of `{model_name, harness}` pairs to drop from the output (e.g. outlier runs).

The script fails loudly if a row's brand or harness code is not in the config,
so new entries are never silently mislabeled.

### Industry data

Update `industry.json` by running the industry trends queries and editing the
file with the resulting data.
Keep each share group's `providers` covering every `provider` referenced in
its `series`, and keep each week's `token`/`wallet` totals summing to 100
within each group.
