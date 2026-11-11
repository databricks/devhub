import { ImageResponse } from "next/og";

import { contentData } from "@/lib/ai-trends/data";
import { OG_SIZE } from "@/lib/ai-trends/og/frame";
import { loadLogoDataUris } from "@/lib/ai-trends/og/logos";
import { renderIndexCard } from "@/lib/ai-trends/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
const { sections } = contentData;
export const alt = `${contentData.seo.title} charts: ${sections.proprietary.eyebrow}, ${sections.spend.eyebrow}, ${sections.frontier.eyebrow}`;

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(renderIndexCard(await loadLogoDataUris()), OG_SIZE);
}
