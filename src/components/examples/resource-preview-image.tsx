"use client";

import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import type { ReactNode } from "react";

/**
 * Theme-aware single preview image with a caller-provided fallback.
 *
 * Renders the dark URL when the site is in dark mode and the light URL in light
 * mode. If only one URL is provided it's used for both modes. If neither is set
 * the caller's `fallback` is rendered instead.
 *
 * The container is always 16:9. Images are assumed to match that ratio (enforced
 * by `npm run verify:images`), so object-cover yields a clean edge with no
 * letterboxing.
 */
export function ResourcePreviewImage({
  lightUrl,
  darkUrl,
  alt,
  fallback,
  className,
}: {
  lightUrl?: string;
  darkUrl?: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  const { colorMode } = useColorMode();
  const chosen =
    colorMode === "dark" ? (darkUrl ?? lightUrl) : (lightUrl ?? darkUrl);
  const src = useBaseUrl(chosen ?? "");

  if (!chosen) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={
        className ?? "absolute inset-0 h-full w-full object-cover object-center"
      }
      loading="lazy"
    />
  );
}
