"use client";

import Image from "next/image";

import type { ProductPageContent } from "@/lib/products/product-page";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SliderArrowIcon } from "@/components/ui/slider-arrow-icon";
import { useScrollSlider } from "@/components/ui/use-scroll-slider";
import { SectionKicker } from "@/components/products/section-kicker";

type TestimonialsSliderProps = {
  content: ProductPageContent;
};

type ProductTestimonial = ProductPageContent["testimonials"][number];

const testimonialLogoAssets = [
  {
    match: "tibber",
    src: "/img/products/testimonials/tibber.svg",
    width: 158,
  },
  {
    match: "ensemble",
    src: "/img/products/testimonials/ensemble-health-partners.svg",
    width: 226,
  },
  {
    match: "yipit",
    src: "/img/products/testimonials/yipitdata.svg",
    width: 197,
  },
  {
    match: "sae",
    src: "/img/products/testimonials/sae-international.svg",
    width: 158,
  },
  {
    match: "e.on",
    src: "/img/products/testimonials/eon.svg",
    width: 160,
  },
  {
    match: "addi",
    src: "/img/products/testimonials/addi.svg",
    width: 128,
  },
  {
    match: "astrazeneca",
    src: "/img/products/testimonials/astrazeneca.svg",
    width: 193,
  },
  {
    match: "flo health",
    src: "/img/products/testimonials/flo-health.svg",
    width: 104,
  },
  {
    match: "lippert",
    src: "/img/products/testimonials/lippert.svg",
    width: 160,
  },
] as const;

function getTestimonialLogoAsset(company: string) {
  const normalizedCompany = company.toLowerCase();

  return (
    testimonialLogoAssets.find(({ match }) =>
      normalizedCompany.includes(match),
    ) ?? testimonialLogoAssets[2]
  );
}

function TestimonialCard({
  active,
  staticDesktopLayout,
  testimonial,
}: {
  active: boolean;
  staticDesktopLayout: boolean;
  testimonial: ProductTestimonial;
}) {
  const logo = getTestimonialLogoAsset(testimonial.company);

  return (
    <article
      className={cn(
        "bg-db-navy-light flex min-h-76.5 w-[calc(100vw-2.5rem)] shrink-0 snap-start flex-col justify-between border border-white/18 p-6 md:w-lg md:px-8 md:py-10 lg:min-h-114.75 xl:min-h-143.5",
        staticDesktopLayout && "xl:w-auto xl:min-w-0 xl:py-8 xl:lg:min-h-115",
        active &&
          (staticDesktopLayout ? "max-xl:bg-db-cyan/20" : "bg-db-cyan/20"),
      )}
    >
      <Image
        alt={`${testimonial.company} logo`}
        className={cn(
          "h-7 max-w-full self-start object-contain object-left brightness-0 invert md:h-8 lg:h-9 xl:h-12",
          staticDesktopLayout && "xl:h-10",
        )}
        src={logo.src}
        width={logo.width}
        height={logo.width}
        loading="lazy"
      />
      <div>
        <blockquote
          className={cn(
            "mt-12 max-w-md text-base leading-normal tracking-normal text-white md:mt-13 md:text-lg lg:mt-5 lg:text-xl xl:mt-10 xl:text-2xl",
            staticDesktopLayout && "xl:mt-12 xl:text-lg",
          )}
        >
          "{testimonial.quote}"
        </blockquote>
        <p
          className={cn(
            "mt-auto pt-7 text-base tracking-normal text-white/80 md:pt-8 lg:pt-12",
            staticDesktopLayout && "xl:pt-8",
          )}
        >
          <span className="text-white">{testimonial.attributionName}</span>
          {testimonial.attributionTitle
            ? `, ${testimonial.attributionTitle}`
            : ""}
        </p>
      </div>
    </article>
  );
}

export function TestimonialsSlider({ content }: TestimonialsSliderProps) {
  const slider = useScrollSlider({ itemCount: content.testimonials.length });
  const { activeIndex, currentIndex, lastIndex } = slider;
  const staticDesktopLayout = content.testimonials.length <= 3;
  const progress = `${Math.min(
    100,
    ((currentIndex + 2) / (content.testimonials.length + 1)) * 100,
  )}%`;

  return (
    <section className="bg-db-navy overflow-hidden pb-18 text-white md:pb-20">
      <div className="mx-auto w-full max-w-304 px-5 md:px-8 xl:px-0">
        <SectionKicker className="text-grey-70">
          {content.testimonialsIntro.eyebrow}
        </SectionKicker>
        <h2 className="mt-6 max-w-304 font-sans text-4xl leading-tight font-normal tracking-[-0.04em] text-balance md:text-[2.5rem] lg:text-[2.75rem]">
          {content.testimonialsIntro.titleLead}{" "}
          <span className="text-white/60">
            {content.testimonialsIntro.titleMuted}
          </span>
        </h2>

        <div
          data-testid="testimonials-slider-controls"
          className={cn(
            "mt-12 flex items-center gap-5",
            staticDesktopLayout && "xl:hidden",
          )}
        >
          <div
            className="h-2 grow bg-white/8"
            role="presentation"
            aria-hidden="true"
          >
            <div
              className="bg-orange h-full transition-[width] duration-300"
              style={{ width: progress }}
            />
          </div>
          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <Button
              className={cn(
                "static size-9 translate-0 rounded-none shadow-none transition-colors duration-150 disabled:opacity-30 md:size-10 lg:size-11",
                currentIndex === 0
                  ? "border border-white bg-transparent text-white"
                  : "border-db-lava-light bg-db-lava-light hover:border-db-lava hover:bg-db-lava border text-white",
                "focus-visible:ring-db-cyan focus-visible:ring-offset-grey-8 focus-visible:ring-2 focus-visible:ring-offset-2",
                "[&_svg]:size-6",
              )}
              type="button"
              onClick={() => slider.scrollToIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous testimonial"
            >
              <SliderArrowIcon className="size-6 rotate-180" />
            </Button>
            <Button
              className={cn(
                "static size-9 translate-0 rounded-none shadow-none transition-colors duration-150 disabled:opacity-30 md:size-10 lg:size-11",
                currentIndex === lastIndex
                  ? "border border-white bg-transparent text-white"
                  : "border-db-lava-light bg-db-lava-light hover:border-db-lava hover:bg-db-lava border text-white",
                "focus-visible:ring-db-cyan focus-visible:ring-offset-grey-8 focus-visible:ring-2 focus-visible:ring-offset-2",
                "[&_svg]:size-6",
              )}
              type="button"
              onClick={() => slider.scrollToIndex(currentIndex + 1)}
              disabled={currentIndex === lastIndex}
              aria-label="Next testimonial"
            >
              <SliderArrowIcon className="size-6" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-10 [--testimonial-left:max(1.25rem,calc((100vw-76rem)/2))] md:[--testimonial-left:max(2rem,calc((100vw-76rem)/2))]",
          staticDesktopLayout &&
            "xl:mx-auto xl:mt-20 xl:w-full xl:max-w-304 xl:px-0",
        )}
        aria-live="polite"
      >
        <div
          data-testid="testimonials-track"
          className={cn(
            "flex snap-x snap-mandatory [scroll-padding-right:var(--testimonial-left)] [scroll-padding-left:var(--testimonial-left)] [scrollbar-width:none] gap-8 overflow-x-auto scroll-smooth pr-[var(--testimonial-left)] pb-2 pl-[var(--testimonial-left)] [&::-webkit-scrollbar]:hidden",
            staticDesktopLayout &&
              "xl:grid xl:snap-none xl:[scroll-padding-right:0] xl:[scroll-padding-left:0] xl:grid-cols-3 xl:gap-6 xl:overflow-visible xl:scroll-auto xl:px-0 xl:pb-0",
          )}
          ref={slider.trackRef}
          onScroll={slider.handleScroll}
        >
          {content.testimonials.map((testimonial, index) => (
            <TestimonialCard
              active={index === activeIndex}
              staticDesktopLayout={staticDesktopLayout}
              testimonial={testimonial}
              key={testimonial.company}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
