import { expect, test } from "@playwright/test";

import { getShareSlugs } from "../../src/lib/ai-trends/share-cards";

// Share pages used to set file-based opengraph-image and twitter-image routes,
// with a Next route-hash suffix. Posts that already embed those URLs must keep
// resolving to the card.
const LEGACY_SUFFIX = "9as66p";

test.describe("AI Index legacy share image URLs", () => {
  for (const kind of ["opengraph-image", "twitter-image"]) {
    test(`${kind}-<suffix> redirects permanently to image.png`, async ({
      request,
    }) => {
      for (const slug of getShareSlugs()) {
        const response = await request.get(
          `/ai-index/share/${slug}/${kind}-${LEGACY_SUFFIX}`,
          { maxRedirects: 0 },
        );
        expect(response.status()).toBe(308);
        const location = response.headers().location;
        expect(location).toBe(`/ai-index/share/${slug}/image.png`);

        const image = await request.get(location);
        expect(image.status()).toBe(200);
        expect(image.headers()["content-type"]).toBe("image/png");
      }
    });
  }
});
