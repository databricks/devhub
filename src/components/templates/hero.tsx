import type { ReactNode } from "react";

import { AnimatedArrowLink } from "@/components/ui/animated-arrow-link";

export function Hero(): ReactNode {
  return (
    <section
      id="templates-hero"
      className="3xl:pb-29 bg-black py-8 text-white md:py-12 lg:pt-18 lg:pb-16 xl:pt-40"
    >
      <div className="relative mx-auto flex w-full max-w-400 flex-col gap-6 px-5 md:px-8">
        <h1 className="max-w-330 font-sans text-3xl/[1.125] font-normal tracking-[-0.04em] text-balance md:text-5xl/[1.125] lg:text-6xl/[1.125] xl:text-[4rem]/[1.125] 2xl:text-7xl/[1.125]">
          <span className="inline md:block xl:ml-24 2xl:ml-50">
            <span className="text-db-lava">Templates</span>{" "}
            <span className="text-white">to jumpstart</span>
          </span>{" "}
          <span className="inline text-white md:block">
            your next Databricks app.
          </span>
        </h1>
        <div className="flex flex-col xl:absolute xl:right-8 xl:bottom-0 xl:pb-2">
          <p className="text-lg/normal font-medium tracking-tight text-pretty text-white xl:text-base/normal 2xl:text-lg/normal">
            Copy-paste prompts that build your app.
          </p>
          <ol className="text-grey-90 marker:text-grey-80 mt-2.5 flex list-decimal flex-col gap-y-0.75 pl-5 2xl:mt-3 2xl:gap-y-1">
            <li className="pl-1 text-base leading-normal tracking-tight text-pretty xl:text-sm/normal 2xl:text-base/normal">
              Pick a template that matches what you want to build.
            </li>
            <li className="pl-1 text-base leading-normal tracking-tight text-pretty xl:text-sm/normal 2xl:text-base/normal">
              Click{" "}
              <code className="bg-grey-12 border-grey-20 inline-flex rounded border px-1 py-0.5 font-mono text-sm leading-none text-white">
                Copy prompt
              </code>{" "}
              and paste it into your agent.
            </li>
            <li className="pl-1 text-base leading-normal tracking-tight text-pretty xl:text-sm/normal 2xl:text-base/normal">
              Answer its questions, then let it build.
            </li>
          </ol>
          <AnimatedArrowLink
            href="/docs/templates"
            className="text-orange hover:text-db-lava mt-3 inline-flex w-fit items-center gap-2 font-sans text-base font-normal tracking-tight no-underline transition-colors xl:text-[0.9375rem]/normal 2xl:mt-4 2xl:text-base/normal"
            size="size-4 xl:size-3.5 2xl:size-4"
          >
            New to templates? Learn more
          </AnimatedArrowLink>
        </div>
      </div>
    </section>
  );
}
