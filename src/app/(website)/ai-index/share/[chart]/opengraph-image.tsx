import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { OG_SIZE } from "@/lib/ai-trends/og/frame";
import { renderShareCard } from "@/lib/ai-trends/og/render";
import { getShareCard, getShareSlugs } from "@/lib/ai-trends/share-cards";
import { getVendorLogoEntries } from "@/lib/ai-trends/vendor-logos";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Databricks AI Index chart";

async function loadLogoDataUris(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    getVendorLogoEntries().map(async ([vendor, path]) => {
      const svg = await readFile(join(process.cwd(), "public", path));
      return [vendor, `data:image/svg+xml;base64,${svg.toString("base64")}`];
    }),
  );
  return Object.fromEntries(entries);
}

export function generateStaticParams(): { chart: string }[] {
  return getShareSlugs().map((chart) => ({ chart }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ chart: string }>;
}): Promise<ImageResponse> {
  const { chart } = await params;
  const card = getShareCard(chart);
  if (!card) notFound();
  return new ImageResponse(
    renderShareCard(card, await loadLogoDataUris()),
    OG_SIZE,
  );
}
