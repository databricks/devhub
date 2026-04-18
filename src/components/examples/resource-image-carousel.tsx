"use client";

import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { GalleryImage } from "@/lib/recipes/recipes";

/**
 * Generic image carousel for resource detail pages.
 *
 * - Each slide renders the light or dark variant based on the current site
 *   color mode; there is no manual light/dark toggle.
 * - Every slide is a fixed 16:9 frame; image contract is enforced by
 *   `npm run verify:images`.
 * - Arrows only render when there's more than one image.
 */
export function ResourceImageCarousel({
  images,
  exampleName,
}: {
  images: GalleryImage[];
  exampleName: string;
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const multiple = images.length > 1;

  if (images.length === 0) return null;

  return (
    <div className="mb-8">
      <Carousel opts={{ align: "start", loop: multiple }} className="w-full">
        <CarouselContent>
          {images.map((image, i) => (
            <CarouselItem key={`${image.lightUrl}-${image.darkUrl}`}>
              <Slide
                image={image}
                isDark={isDark}
                alt={`${exampleName} screenshot ${i + 1} of ${images.length}`}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {multiple && (
          <>
            <CarouselPrevious className="left-3 border-black/20 bg-white/80 text-black backdrop-blur-sm hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black" />
            <CarouselNext className="right-3 border-black/20 bg-white/80 text-black backdrop-blur-sm hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black" />
          </>
        )}
      </Carousel>
    </div>
  );
}

function Slide({
  image,
  isDark,
  alt,
}: {
  image: GalleryImage;
  isDark: boolean;
  alt: string;
}) {
  const src = useBaseUrl(isDark ? image.darkUrl : image.lightUrl);
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
      />
    </div>
  );
}
