import type { ReactNode } from "react";

import type { ContentData } from "@/lib/ai-trends/schema";

import { RichText } from "./rich-text";

export function TrendsHeader({
  header,
}: {
  header: ContentData["header"];
}): ReactNode {
  return (
    <section className="bg-black py-9 text-white md:py-12 xl:py-14">
      <div className="mx-auto flex w-full max-w-400 flex-col gap-3 px-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <h1 className="font-sans text-4xl/[1.125] font-normal tracking-[-0.04em] text-balance md:text-5xl/[1.125] lg:shrink-0 xl:text-7xl/[1.125]">
          {header.title_lead}{" "}
          <span className="text-db-lava">{header.title_accent}.</span>
        </h1>
        <p className="text-grey-90 max-w-2xl text-sm/5 tracking-tight text-pretty md:text-base/6 [&_strong]:font-medium [&_strong]:text-white">
          <RichText text={header.intro} />
        </p>
      </div>
    </section>
  );
}
