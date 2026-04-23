import Link from "@docusaurus/Link";
import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useFeatureFlags } from "@/lib/feature-flags";
import {
  buildLandingResources,
  type LandingResourceItem,
} from "@/lib/landing-content";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { ResourcePreviewImage } from "@/components/examples/resource-preview-image";

function ResourceCard({
  item,
  index,
}: {
  item: LandingResourceItem;
  index: number;
}): ReactNode {
  return (
    <Link to={item.path} className="no-underline">
      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-none transition-all duration-200 hover:border-black/20 dark:border-white/10 dark:bg-db-navy-light dark:hover:border-white/20">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-black/10 dark:border-white/10">
          <ResourcePreviewImage
            lightUrl={item.previewImageLightUrl}
            darkUrl={item.previewImageDarkUrl}
            alt={item.title}
            fallback={<FallbackCardArt index={index} />}
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-[1.2rem] leading-tight font-medium text-black dark:text-white">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <p className="m-0 text-sm leading-relaxed text-black/68 dark:text-white/68">
            {item.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TemplatePreview(): ReactNode {
  const { showDrafts: includeDrafts, examplesEnabled: includeExamples } =
    useFeatureFlags();
  const landingResources = buildLandingResources(
    includeDrafts,
    includeExamples,
  );

  return (
    <section className="bg-db-oat-medium py-16 dark:bg-black md:py-20">
      <div className="container px-4">
        <div className="mx-auto mb-8 max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/50 uppercase dark:text-white/50">
            <span className="text-db-lava">&#9679;</span>
            Templates
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl text-3xl leading-tight font-medium tracking-tight text-black dark:text-white md:text-4xl">
              Jumpstart your next project with{" "}
              <span className="text-db-lava">a template.</span>
            </h2>
            <Link
              to="/resources"
              className="shrink-0 text-sm font-medium text-black/70 no-underline hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              See all templates &rarr;
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/55 dark:text-white/55">
            Browse templates for inspiration, or use one to hit the ground
            running. Every template is a prompt you can paste into your agent.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {landingResources.map((item, index) => (
                <CarouselItem
                  key={item.id}
                  className="basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <ResourceCard item={item} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden border-black/20 bg-white/80 text-black backdrop-blur-sm hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black md:inline-flex" />
            <CarouselNext className="hidden border-black/20 bg-white/80 text-black backdrop-blur-sm hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black md:inline-flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
