import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { imageSize } from "image-size";
import { describe, expect, test, vi } from "vitest";

import { getProviderOrder } from "../src/lib/ai-trends/compute";
import {
  getShareCard,
  getShareSlugs,
  getShareVersion,
} from "../src/lib/ai-trends/share-cards";
import { resolveSiteUrl } from "../src/lib/site-url";

// Social platforms build the share preview by fetching /ai-index/share/<chart>
// and reading its Open Graph / Twitter tags, so these tests check the built
// output a crawler would see. `pnpm test` runs `pnpm build` first.
const NEXT_APP_DIR = resolve(__dirname, "..", ".next", "server", "app");
const SHARE_DIR = resolve(NEXT_APP_DIR, "ai-index", "share");
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function readMeta(html: string, key: string): string | undefined {
  const tag = html.match(
    new RegExp(`<meta[^>]*(?:property|name)="${key}"[^>]*>`),
  )?.[0];
  return tag?.match(/content="([^"]*)"/)?.[1];
}

/** The prerendered image file for an absolute og:image / twitter:image URL. */
function readImageFor(imageUrl: string): Buffer {
  const { pathname } = new URL(imageUrl);
  return readFileSync(resolve(NEXT_APP_DIR, `${pathname.slice(1)}.body`));
}

describe("AI Index share previews", () => {
  const siteUrl = resolveSiteUrl();
  const pageHtml = readFileSync(
    resolve(NEXT_APP_DIR, "ai-index.html"),
    "utf-8",
  );

  test.each(getShareSlugs())("%s: share page has preview tags", (slug) => {
    const card = getShareCard(slug);
    const html = readFileSync(resolve(SHARE_DIR, `${slug}.html`), "utf-8");

    expect(readMeta(html, "og:title")).toContain(card?.title);
    expect(readMeta(html, "og:description")).toBeTruthy();
    const version = getShareVersion(slug);
    expect(readMeta(html, "og:url")).toBe(
      `${siteUrl}/ai-index/share/${slug}?v=${version}`,
    );
    expect(readMeta(html, "twitter:card")).toBe("summary_large_image");
    expect(readMeta(html, "og:image:width")).toBe(String(OG_WIDTH));
    expect(readMeta(html, "og:image:height")).toBe(String(OG_HEIGHT));
    for (const key of ["og:image", "twitter:image"]) {
      expect(readMeta(html, key)).toBe(
        `${siteUrl}/ai-index/share/${slug}/image.png?v=${version}`,
      );
    }
  });

  test.each(getShareSlugs())("%s: preview images are 1200x630 PNGs", (slug) => {
    const html = readFileSync(resolve(SHARE_DIR, `${slug}.html`), "utf-8");
    for (const key of ["og:image", "twitter:image"]) {
      const image = readImageFor(readMeta(html, key) ?? "");
      expect(imageSize(image)).toMatchObject({
        type: "png",
        width: OG_WIDTH,
        height: OG_HEIGHT,
      });
      // A blank or failed render is a few KB; real charts are far larger.
      expect(image.byteLength).toBeGreaterThan(20_000);
    }
  });

  test("page has its own preview tags", () => {
    expect(readMeta(pageHtml, "og:url")).toBe(`${siteUrl}/ai-index`);
    expect(readMeta(pageHtml, "twitter:card")).toBe("summary_large_image");
    expect(readMeta(pageHtml, "og:image:width")).toBe(String(OG_WIDTH));
    expect(readMeta(pageHtml, "og:image:height")).toBe(String(OG_HEIGHT));
    expect(readMeta(pageHtml, "og:image:alt")).toBeTruthy();
    expect(readMeta(pageHtml, "twitter:image:alt")).toBeTruthy();
    expect(
      readMeta(pageHtml, "og:image")?.startsWith(
        `${siteUrl}/ai-index/opengraph-image`,
      ),
    ).toBe(true);
    expect(
      readMeta(pageHtml, "twitter:image")?.startsWith(
        `${siteUrl}/ai-index/twitter-image`,
      ),
    ).toBe(true);
  });

  test("page preview images are 1200x630 PNGs", () => {
    for (const key of ["og:image", "twitter:image"]) {
      const image = readImageFor(readMeta(pageHtml, key) ?? "");
      expect(imageSize(image)).toMatchObject({
        type: "png",
        width: OG_WIDTH,
        height: OG_HEIGHT,
      });
      expect(image.byteLength).toBeGreaterThan(20_000);
    }
  });

  test("other pages keep the site-wide card", () => {
    const homeHtml = readFileSync(resolve(NEXT_APP_DIR, "index.html"), "utf-8");
    for (const key of ["og:image", "twitter:image"]) {
      expect(readMeta(homeHtml, key)).toBe(
        `${siteUrl}/img/databricks-social-card.jpg`,
      );
    }
  });

  test.each(getShareSlugs())("%s: Copy image is a 1200x630 PNG", (slug) => {
    const image = readFileSync(resolve(SHARE_DIR, slug, "image.png.body"));
    expect(imageSize(image)).toMatchObject({
      type: "png",
      width: OG_WIDTH,
      height: OG_HEIGHT,
    });
    expect(image.byteLength).toBeGreaterThan(20_000);
  });

  test.each(getShareSlugs())(
    "%s: share page redirects to a chart on the page",
    (slug) => {
      expect(existsSync(resolve(SHARE_DIR, `${slug}.html`))).toBe(true);
      expect(pageHtml).toContain(`id="${slug}"`);
    },
  );
});

type AiTrendsData = typeof import("../src/lib/ai-trends/data");

/** Every card's version after `edit` changes a fresh copy of the data. */
async function versionsAfter(
  edit: (data: AiTrendsData) => void,
): Promise<Record<string, string>> {
  vi.resetModules();
  edit(await import("../src/lib/ai-trends/data"));
  const shareCards = await import("../src/lib/ai-trends/share-cards");
  return Object.fromEntries(
    shareCards
      .getShareSlugs()
      .map((slug) => [slug, shareCards.getShareVersion(slug)]),
  );
}

describe("getShareVersion", () => {
  test("is distinct per card and safe in a query string", () => {
    const versions = getShareSlugs().map(getShareVersion);
    expect(new Set(versions).size).toBe(versions.length);
    for (const version of versions) expect(version).toMatch(/^[0-9a-z]+$/);
  });

  test.each<[string, (data: AiTrendsData) => void, string[]]>([
    [
      "a chart title",
      ({ contentData }) => {
        contentData.charts.spend.title += " (edited)";
      },
      ["spend"],
    ],
    [
      "the share date",
      ({ industryData }) => {
        industryData.share.as_of = "2099-01-01";
      },
      [
        "token-share",
        "wallet-share",
        "open-source-token-share",
        "open-source-wallet-share",
      ],
    ],
    [
      "a proprietary token value",
      ({ industryData }) => {
        industryData.share.groups.proprietary.series[0].token[0] += 1;
      },
      ["token-share"],
    ],
    [
      "a proprietary wallet value",
      ({ industryData }) => {
        industryData.share.groups.proprietary.series[0].wallet[0] += 1;
      },
      ["wallet-share"],
    ],
    [
      // Providers stack by latest token share, so this reorders the wallet card too.
      "the latest proprietary token leader",
      ({ industryData }) => {
        const group = industryData.share.groups.proprietary;
        const last = getProviderOrder(group).at(-1);
        const series = group.series.find(({ provider }) => provider === last);
        if (!series) throw new Error(`No series for provider "${last}"`);
        series.token[series.token.length - 1] = 1000;
      },
      ["token-share", "wallet-share"],
    ],
    [
      "an open-weight token value",
      ({ industryData }) => {
        industryData.share.groups.open_source.series[0].token[0] += 1;
      },
      ["open-source-token-share"],
    ],
    [
      "an open-weight wallet value",
      ({ industryData }) => {
        industryData.share.groups.open_source.series[0].wallet[0] += 1;
      },
      ["open-source-wallet-share"],
    ],
    [
      "a proprietary vs open-weight value",
      ({ industryData }) => {
        industryData.long_term.open_weight_share[0].values[0] += 1;
      },
      ["open-weight-share"],
    ],
    [
      "a providers used value",
      ({ industryData }) => {
        industryData.long_term.providers_used[0].values[0] += 1;
      },
      ["providers-used"],
    ],
    [
      "a spend percentile",
      ({ industryData }) => {
        industryData.spend.p99[0] += 1;
      },
      ["spend"],
    ],
    [
      "a benchmark result",
      ({ benchmarkData }) => {
        benchmarkData.models[0].cost += 1;
      },
      ["scatter"],
    ],
    [
      "copy no card shows",
      ({ contentData }) => {
        contentData.sections.spend.intro += " (edited)";
        contentData.changelog.pop();
      },
      [],
    ],
  ])(
    "changing %s changes only the cards that draw it",
    async (_, edit, changed) => {
      const before = await versionsAfter(() => {});
      const after = await versionsAfter(edit);
      expect(
        getShareSlugs().filter((slug) => after[slug] !== before[slug]),
      ).toEqual(changed);
    },
  );
});
