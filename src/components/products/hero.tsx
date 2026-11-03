import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";

import type { ProductPageContent } from "@/lib/products/product-page";
import { Button } from "@/components/ui/button";
import { BenefitIcon } from "@/components/products/icons/benefit-icon";
import { SectionKicker } from "@/components/products/section-kicker";

type HeroProps = {
  content: ProductPageContent;
};

type HeroAction = ProductPageContent["hero"]["actions"][number];

function HighlightedProductTitle({
  highlight,
  title,
}: {
  highlight: string;
  title: string;
}) {
  const remainder = title.startsWith(highlight)
    ? title.slice(highlight.length)
    : title;

  return (
    <>
      {title.startsWith(highlight) ? (
        <span className="text-db-lava-light">{highlight}</span>
      ) : null}
      {remainder}
    </>
  );
}

function HeroActionLink({ action }: { action: HeroAction }) {
  if (action.variant === "primary") {
    return (
      <Button
        asChild
        className="group h-auto min-h-10 w-full max-w-full gap-x-0.5 rounded-none bg-transparent p-0 font-mono text-sm/none font-medium tracking-normal text-black uppercase shadow-none hover:bg-transparent sm:w-auto lg:min-h-11 lg:text-base/none"
      >
        <Link
          className="inline-flex w-full max-w-full items-stretch gap-x-0.5 no-underline hover:no-underline sm:w-auto"
          href={action.href}
        >
          <span className="flex min-h-10 min-w-0 flex-1 items-center justify-center bg-white px-4 py-2 text-center leading-tight tracking-normal whitespace-normal group-hover:bg-white/90 sm:flex-none sm:justify-start sm:text-left sm:whitespace-nowrap lg:min-h-11 lg:px-5 lg:py-3">
            {action.label}
          </span>
          <span className="grid min-h-10 w-10 shrink-0 place-items-center bg-white lg:min-h-11 lg:w-11">
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      className="bg-grey-20 hover:bg-grey-30 h-auto min-h-10 w-full max-w-full gap-3 rounded-none border-0 px-0 pr-4 pl-5 font-mono text-sm/none font-medium tracking-normal text-white uppercase shadow-none sm:w-fit lg:min-h-11 lg:gap-4.5 lg:pr-6 lg:pl-7 lg:text-base/none"
    >
      <Link
        className="flex w-full items-center justify-between gap-4.5 tracking-normal no-underline hover:no-underline sm:inline-flex sm:w-auto sm:justify-start"
        href={action.href}
      >
        {action.label}
        <span className="grid size-4 place-items-center">
          <FileText className="size-4" aria-hidden="true" />
        </span>
      </Link>
    </Button>
  );
}

export function Hero({ content }: HeroProps) {
  const image = content.hero.image;

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="relative mx-auto flex w-full max-w-304 flex-col px-5 pt-9 pb-24 md:px-8 md:pb-32 lg:pb-40 xl:px-0 xl:pb-60">
        <div className="relative w-full">
          <Image
            alt={image.alt ?? ""}
            className="block h-auto w-full"
            decoding="async"
            fetchPriority="high"
            height={image.height}
            loading="eager"
            src={image.src}
            width={image.width}
          />
          <div
            className="absolute -bottom-18 h-40 w-full bg-[linear-gradient(180deg,rgb(4_4_6/0)_0%,var(--black)_60%)] sm:-bottom-8 lg:h-71.5"
            aria-hidden="true"
          />
        </div>

        <header className="relative lg:-mt-12.5">
          <h1 className="font-heading max-w-241.5 text-[2rem] leading-[0.95] font-normal tracking-normal text-white md:text-[2.5rem] lg:text-5xl xl:text-[3.5rem]">
            <HighlightedProductTitle
              highlight={content.hero.highlightedTitle}
              title={`${content.hero.highlightedTitle} ${content.hero.title}`}
            />
          </h1>
          <div className="mt-5 flex flex-col gap-7 border-t border-white/16 pt-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5">
              {content.hero.actions.map((action) => (
                <HeroActionLink action={action} key={action.label} />
              ))}
            </div>
            <p className="text-grey-70 max-w-85 text-base/tight lg:mt-1 lg:justify-self-end lg:text-right">
              {content.hero.description}
            </p>
          </div>
        </header>

        <section
          className="mt-24 md:mt-32 lg:mt-40 xl:mt-60"
          aria-labelledby="product-benefits"
        >
          <div className="max-w-304">
            <SectionKicker className="text-grey-40 mb-6">
              {content.benefitsIntro.eyebrow}
            </SectionKicker>
            <h2
              className="font-sans text-[1.75rem]/tight font-normal tracking-[-0.04em] text-white md:text-[2rem] lg:text-[2.5rem] 2xl:text-[2.75rem]"
              id="product-benefits"
            >
              {content.benefitsIntro.title}{" "}
              <span className="text-grey-70">
                {content.benefitsIntro.description}
              </span>
            </h2>
          </div>
          <div className="mt-11 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-3 lg:mt-12 lg:gap-8 xl:mt-14">
            {content.benefits.map(({ description, icon, title }) => (
              <article
                className="border-grey-60 relative min-h-0 overflow-hidden border bg-black p-4.5 md:min-h-64 md:p-5 lg:p-6 xl:p-8 xl:pr-6"
                key={title}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,rgb(255_255_255/0.035)_0px,rgb(255_255_255/0.035)_1px,transparent_1px,transparent_8px)]"
                />
                <div className="relative">
                  <BenefitIcon icon={icon} />
                  <h3 className="mt-12 text-lg/tight font-medium tracking-tight text-white md:mt-15 md:text-xl/tight lg:mt-18 lg:text-2xl/tight xl:text-[1.75rem]/tight 2xl:mt-29">
                    {title}
                  </h3>
                  <p className="text-grey-70 mt-1.5 max-w-80 text-base tracking-normal text-pretty md:mt-2 md:max-w-100 md:text-lg/normal lg:mt-2.5 xl:mt-3 xl:text-xl/normal">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
