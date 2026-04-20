import Link from "@docusaurus/Link";
import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function KindBadge({ kind }: { kind: LandingResourceItem["kind"] }): ReactNode {
  if (kind === "example") {
    return (
      <Badge className="rounded-sm bg-db-lava/10 px-1.5 py-0 text-[11px] font-medium text-db-lava dark:bg-db-lava/20 dark:text-db-lava">
        Example
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="rounded-sm border border-black/10 bg-black/4 px-1.5 py-0 text-[11px] font-medium text-black/60 dark:border-white/10 dark:bg-white/8 dark:text-white/60"
    >
      Guide
    </Badge>
  );
}

function ResourceCard({
  item,
  index,
}: {
  item: LandingResourceItem;
  index: number;
}): ReactNode {
  return (
    <Link to={item.path} className="no-underline">
      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-[#f7f6f4] shadow-none transition-all duration-200 hover:border-black/20 dark:border-white/10 dark:bg-[#182a32] dark:hover:border-white/20">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-black/10 dark:border-white/10">
          <ResourcePreviewImage
            lightUrl={item.previewImageLightUrl}
            darkUrl={item.previewImageDarkUrl}
            alt={item.title}
            fallback={<FallbackCardArt index={index} />}
          />
        </div>
        <CardHeader className="pb-2">
          <div className="mb-1.5 flex items-center gap-2">
            <KindBadge kind={item.kind} />
          </div>
          <CardTitle className="text-[1.2rem] leading-tight font-medium text-black dark:text-white">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <p className="m-0 text-sm leading-relaxed text-black/68 dark:text-white/68">
            {item.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {item.tags?.slice(-2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-sm border border-black/10 bg-black/4 px-1.5 py-0 text-[11px] font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
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
    <section className="bg-white py-16 dark:bg-db-navy md:py-20">
      <div className="container px-4">
        <div className="mx-auto mb-8 max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/50 uppercase dark:text-white/50">
            <span className="text-db-lava">&#9679;</span>
            More copy-pasteable prompts
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl text-3xl leading-tight font-medium tracking-tight text-black dark:text-white md:text-4xl">
              Get inspired by what&apos;s possible.{" "}
              <span className="text-db-lava">
                Every guide is a prompt you can paste.
              </span>
            </h2>
            <Link
              to="/resources"
              className="shrink-0 text-sm font-medium text-black/70 no-underline hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              See all resources &rarr;
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-black/55 dark:text-white/55">
            Beyond the wizard prompt, each guide and example on{" "}
            <Link
              to="/resources"
              className="text-black/80 no-underline underline-offset-2 hover:underline dark:text-white/80"
            >
              /resources
            </Link>{" "}
            is a focused, copy-pasteable prompt for a specific pattern —
            authentication, RAG, streaming, deployments, and more.
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
