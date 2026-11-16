import type { ReactNode } from "react";

import type { ContentData } from "@/lib/ai-trends/schema";

import { RichText } from "./rich-text";

/** Dark hero in the same layout and type scale as the /templates hero. */
export function TrendsHeader({
  header,
}: {
  header: ContentData["header"];
}): ReactNode {
  return (
    <section className="3xl:pb-29 bg-black py-8 text-white md:py-12 lg:pt-18 lg:pb-16 xl:pt-40">
      <div className="relative mx-auto flex w-full max-w-400 flex-col gap-6 px-5 md:px-8">
        <h1 className="max-w-330 font-sans text-3xl/[1.125] font-normal tracking-[-0.04em] text-balance md:text-5xl/[1.125] lg:text-6xl/[1.125] xl:text-[4rem]/[1.125] 2xl:text-7xl/[1.125]">
          {header.title_lead}{" "}
          <span className="text-db-lava">{header.title_accent}.</span>
        </h1>
        <p className="text-grey-90 max-w-xl text-base leading-normal tracking-tight text-pretty xl:absolute xl:right-8 xl:bottom-0 xl:max-w-md xl:pb-2 xl:text-sm/normal 2xl:text-base/normal [&_strong]:font-medium [&_strong]:text-white">
          <RichText text={header.intro} />
        </p>
      </div>
    </section>
  );
}
