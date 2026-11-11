import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { OG_SIZE } from "@/lib/ai-trends/og/frame";
import { loadLogoDataUris } from "@/lib/ai-trends/og/logos";
import { renderShareCard } from "@/lib/ai-trends/og/render";
import { getShareCard, getShareSlugs } from "@/lib/ai-trends/share-cards";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Databricks AI Index chart";

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
