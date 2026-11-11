import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { imageSize } from "image-size";
import { describe, expect, test } from "vitest";

import { getShareCard, getShareSlugs } from "../src/lib/ai-trends/share-cards";
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
    expect(readMeta(html, "og:url")).toBe(`${siteUrl}/ai-index/share/${slug}`);
    expect(readMeta(html, "twitter:card")).toBe("summary_large_image");
    expect(readMeta(html, "og:image:width")).toBe(String(OG_WIDTH));
    expect(readMeta(html, "og:image:height")).toBe(String(OG_HEIGHT));
    for (const key of ["og:image", "twitter:image"]) {
      const imageUrl = readMeta(html, key) ?? "";
      expect(imageUrl.startsWith(`${siteUrl}/ai-index/share/${slug}/`)).toBe(
        true,
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
