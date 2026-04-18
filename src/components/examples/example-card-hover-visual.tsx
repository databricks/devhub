"use client";

import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

/**
 * Homepage screenshots: matches current site theme by default; hover previews the other theme.
 */
export function ExampleCardHoverVisual({
  imageLight,
  imageDark,
  alt,
}: {
  imageLight: string;
  imageDark: string;
  alt: string;
}) {
  const { colorMode } = useColorMode();
  const siteIsDark = colorMode === "dark";

  /** Shown first so it aligns with DevHub light/dark mode */
  const primaryUrl = useBaseUrl(siteIsDark ? imageDark : imageLight);
  /** Shown on hover — the alternate UI theme */
  const alternateUrl = useBaseUrl(siteIsDark ? imageLight : imageDark);
  const hoverHint = siteIsDark ? "light" : "dark";

  return (
    <div
      className="group relative h-full min-h-[10rem] w-full overflow-hidden bg-[#f7f6f4] dark:bg-[#182a32]"
      role="img"
      aria-label={`${alt}. Hover to preview ${hoverHint} theme.`}
    >
      <img
        src={primaryUrl}
        alt=""
        className="absolute inset-0 box-border h-full w-full object-contain object-left object-top transition-opacity duration-300 ease-out group-hover:pointer-events-none group-hover:opacity-0"
        loading="lazy"
      />
      <img
        src={alternateUrl}
        alt=""
        className="absolute inset-0 box-border h-full w-full object-contain object-left object-top opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        loading="lazy"
      />
    </div>
  );
}
