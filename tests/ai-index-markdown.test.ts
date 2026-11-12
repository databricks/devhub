import { readdirSync, readFileSync } from "fs";
import { resolve } from "path";

import { imageSize } from "image-size";
import { describe, expect, test } from "vitest";

import { getBestPerModel, getParetoNames } from "../src/lib/ai-trends/compute";
import {
  benchmarkData,
  contentData,
  industryData,
} from "../src/lib/ai-trends/data";
import { formatDate } from "../src/lib/ai-trends/format";
import { describeSpend } from "../src/lib/ai-trends/markdown";
import { getShareSlugs } from "../src/lib/ai-trends/share-cards";
import { generateLlmsTxt } from "../src/lib/llms-txt";
import { resolveSiteUrl } from "../src/lib/site-url";

// Checks the built /ai-index.md and the images it links against the
// prerendered pages. `pnpm test` runs `pnpm build` first.
const ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = resolve(ROOT, "public");
const NEXT_APP_DIR = resolve(ROOT, ".next", "server", "app");

function readMeta(html: string, key: string): string {
  const tag = html.match(
    new RegExp(`<meta[^>]*(?:property|name)="${key}"[^>]*>`),
  )?.[0];
  const content = tag?.match(/content="([^"]*)"/)?.[1];
  if (!content) throw new Error(`Missing <meta ${key}>`);
  return content;
}

function readPngFor(imageUrl: string): Buffer {
  const { pathname } = new URL(imageUrl);
  const image = readFileSync(
    resolve(NEXT_APP_DIR, `${pathname.slice(1)}.body`),
  );
  expect(imageSize(image)).toMatchObject({ type: "png" });
  return image;
}

function lastValue(values: number[]): number {
  return values[values.length - 1];
}

describe("/ai-index.md", () => {
  const siteUrl = resolveSiteUrl();
  const markdown = readFileSync(resolve(PUBLIC_DIR, "ai-index.md"), "utf-8");
  const pageHtml = readFileSync(
    resolve(NEXT_APP_DIR, "ai-index.html"),
    "utf-8",
  );

  test("starts with the page H1 and intro", () => {
    const { title_lead, title_accent, intro } = contentData.header;
    expect(
      markdown.startsWith(`# ${title_lead} ${title_accent}\n\n${intro}\n`),
    ).toBe(true);
  });

  test("the page advertises its Markdown", () => {
    expect(pageHtml).toContain(
      `<link rel="alternate" type="text/markdown" href="${siteUrl}/ai-index.md"/>`,
    );
  });

  test.each(getShareSlugs())(
    "%s: links the share page and the PNG it serves as og:image",
    (slug) => {
      const html = readFileSync(
        resolve(NEXT_APP_DIR, "ai-index", "share", `${slug}.html`),
        "utf-8",
      );
      const imageUrl = readMeta(html, "og:image");
      readPngFor(imageUrl);
      expect(markdown).toContain(`](${siteUrl}${new URL(imageUrl).pathname})`);
      expect(markdown).toContain(`](${siteUrl}/ai-index/share/${slug})`);
    },
  );

  test("describes the charts with values from the current data", () => {
    const { share, spend } = industryData;
    expect(markdown).toContain(`Updated ${formatDate(share.as_of)}.`);
    expect(markdown).toContain(`Updated ${formatDate(spend.as_of)}.`);
    const { long_term: longTerm } = industryData;
    expect(markdown).toContain(`## ${contentData.sections.long_term.title}`);
    for (const series of longTerm.open_weight_share)
      expect(markdown).toContain(
        `${series.label} ${lastValue(series.values).toFixed(1)}%`,
      );
    const single = lastValue(longTerm.providers_used.at(-1)!.values);
    expect(markdown).toContain(`2+ providers ${(100 - single).toFixed(1)}%`);
    expect(markdown).toContain(
      `Updated ${formatDate(benchmarkData.run_date)}.`,
    );
    for (const key of ["p50", "p90", "p99"] as const) {
      expect(markdown).toContain(`$${lastValue(spend[key]).toFixed(2)}`);
    }
    const plotted = getBestPerModel(benchmarkData.models);
    for (const name of getParetoNames(plotted)) {
      expect(markdown).toContain(`\n- ${name}: `);
    }
    for (const entry of contentData.changelog) {
      expect(markdown).toContain(`[${entry.title}](${entry.url})`);
    }
  });

  test("stays out of llms.txt and the sitemap until launch", () => {
    const llms = generateLlmsTxt(
      siteUrl,
      resolve(ROOT, "src", "content", "docs"),
    );
    expect(llms).not.toContain("/ai-index");
    for (const file of readdirSync(PUBLIC_DIR)) {
      if (file.startsWith("sitemap")) {
        expect(readFileSync(resolve(PUBLIC_DIR, file), "utf-8")).not.toContain(
          "/ai-index",
        );
      }
    }
  });
});

describe("describeSpend", () => {
  const labels = { p50: "Median", p90: "P90", p99: "P99" };

  test("reports a change from a zero baseline without a percentage", () => {
    const text = describeSpend(
      { weeks: ["Sep 21", "Nov 2"], p50: [0, 2], p90: [0, 0], p99: [10, 5] },
      labels,
    );
    expect(text).toContain("Median up from $0.00");
    expect(text).toContain("P90 unchanged at $0.00");
    expect(text).toContain("P99 down 50% from $10.00");
    expect(text).not.toMatch(/Infinity|NaN/);
  });
});
