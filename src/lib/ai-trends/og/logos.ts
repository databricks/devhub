import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getVendorLogoEntries } from "@/lib/ai-trends/vendor-logos";

/** Vendor logos as data URIs, since the image renderer can't fetch site-relative paths. */
export async function loadLogoDataUris(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    getVendorLogoEntries().map(async ([vendor, path]) => {
      const svg = await readFile(join(process.cwd(), "public", path));
      return [vendor, `data:image/svg+xml;base64,${svg.toString("base64")}`];
    }),
  );
  return Object.fromEntries(entries);
}
