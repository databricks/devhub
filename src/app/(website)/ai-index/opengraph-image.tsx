import { ImageResponse } from "next/og";

import { contentData } from "@/lib/ai-trends/data";
import { OG_SIZE } from "@/lib/ai-trends/og/frame";
import { renderIndexCard } from "@/lib/ai-trends/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = contentData.seo.title;

export default function Image(): ImageResponse {
  return new ImageResponse(renderIndexCard(), OG_SIZE);
}
