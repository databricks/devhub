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
import {
  landingResources,
  type LandingResourceItem,
} from "@/lib/landing-content";

function GradientArt({ index }: { index: number }): ReactNode {
  const variant = index % 4;
  return (
    <>
      {variant === 0 ? (
        <div className="absolute inset-0">
          <div className="absolute left-7 top-6 h-16 w-24 rounded-md bg-[#0e1116]/95 shadow-lg" />
          <div className="absolute left-16 top-12 h-20 w-28 rounded-md bg-db-lava/95" />
          <div className="absolute right-8 top-8 h-14 w-14 rounded-full border border-white/25" />
        </div>
      ) : null}
      {variant === 1 ? (
        <div className="absolute inset-0">
          <div className="absolute left-6 top-6 h-30 w-16 border-r border-black/12 bg-white/72" />
          <div className="absolute left-28 top-12 h-2 w-24 rounded bg-black/14" />
          <div className="absolute left-28 top-20 h-2 w-32 rounded bg-black/10" />
          <div className="absolute left-28 top-28 h-2 w-20 rounded bg-black/12" />
        </div>
      ) : null}
      {variant === 2 ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.25)_1px,transparent_0)] [background-size:8px_8px]" />
          <div className="absolute left-6 top-8 h-24 w-24 rounded-full border border-white/25" />
          <div className="absolute right-8 bottom-7 h-14 w-20 rounded-md bg-[#0f141b] shadow-lg" />
        </div>
      ) : null}
      {variant === 3 ? (
        <div className="absolute inset-0">
          <div className="absolute left-6 top-6 h-32 w-20 border-r border-black/10 bg-white/72" />
          <div className="absolute right-7 top-6 h-12 w-14 rounded bg-[#78a8ff]/55" />
          <div className="absolute right-7 top-22 h-16 w-14 rounded bg-[#7dc8ff]/45" />
        </div>
      ) : null}
    </>
  );
}

function ExampleArt(): ReactNode {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2744] to-[#0c1322]" />
      <div className="absolute left-6 top-5 h-14 w-28 rounded-md border border-white/15 bg-white/5" />
      <div className="absolute left-10 top-8 h-1.5 w-16 rounded bg-db-lava/70" />
      <div className="absolute left-10 top-12 h-1.5 w-10 rounded bg-white/20" />
      <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-white/10" />
      <div className="absolute right-10 top-10 h-12 w-12 rounded-full border border-db-lava/30" />
      <div className="absolute bottom-6 left-8 h-10 w-36 rounded-md border border-white/10 bg-white/5" />
      <div className="absolute bottom-9 left-11 h-1.5 w-20 rounded bg-white/15" />
    </div>
  );
}

function CardVisual({
  item,
  index,
}: {
  item: LandingResourceItem;
  index: number;
}): ReactNode {
  if (item.kind === "example") {
    return (
      <div className="relative h-44 overflow-hidden border-b border-black/10 dark:border-white/10">
        <ExampleArt />
      </div>
    );
  }

  return (
    <div
      className={[
        "relative h-44 overflow-hidden border-b border-black/10 dark:border-white/10",
        index % 4 === 0
          ? "bg-gradient-to-br from-[#171b21] via-[#2a3038] to-[#11141a]"
          : "",
        index % 4 === 1
          ? "bg-gradient-to-br from-[#eceff2] via-[#fafafa] to-[#e8ebee]"
          : "",
        index % 4 === 2
          ? "bg-gradient-to-br from-[#11141a] via-[#1b2028] to-[#0d0f14]"
          : "",
        index % 4 === 3
          ? "bg-gradient-to-br from-[#e9ecef] via-[#f9fafb] to-[#e2e7eb]"
          : "",
      ].join(" ")}
    >
      <GradientArt index={index} />
    </div>
  );
}

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
        <CardVisual item={item} index={index} />
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
  return (
    <section className="bg-white py-16 dark:bg-db-navy md:py-20">
      <div className="container px-4">
        <div className="mx-auto mb-8 max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/50 uppercase dark:text-white/50">
            <span className="text-db-lava">&#9679;</span>
            Guides and Examples
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl text-3xl leading-tight font-medium tracking-tight text-black dark:text-white md:text-4xl">
              Start with a guide or example to{" "}
              <span className="text-db-lava">build agentic applications</span>.
            </h2>
            <Link
              to="/resources"
              className="shrink-0 text-sm font-medium text-black/70 no-underline hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              See all resources &rarr;
            </Link>
          </div>
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
