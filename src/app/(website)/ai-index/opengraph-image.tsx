import { ImageResponse } from "next/og";

import { contentData } from "@/lib/ai-trends/data";
import { loadBrandLogo } from "@/lib/ai-trends/og/brand-logo";
import { OG_SIZE } from "@/lib/ai-trends/og/frame";
import { renderIndexCard } from "@/lib/ai-trends/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = contentData.seo.title;

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(renderIndexCard(await loadBrandLogo()), OG_SIZE);
}
