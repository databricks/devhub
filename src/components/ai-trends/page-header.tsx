import type { ReactNode } from "react";

import type { ContentData } from "@/lib/ai-trends/schema";

import { RichText } from "./rich-text";

/**
 * Compact dark header in the DevHub style: title on the left, intro on the
 * right on desktop. Kept short so the first chart stays in the top fold.
 */
export function TrendsHeader({
  header,
}: {
  header: ContentData["header"];
}): ReactNode {
  return (
    <section className="bg-black py-8 text-white md:py-10 xl:py-12">
      <div className="mx-auto flex w-full max-w-400 flex-col gap-4 px-5 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <h1 className="shrink-0 font-sans text-[2rem]/none font-normal tracking-[-0.04em] md:text-[2.5rem]/none xl:text-5xl/none">
          {header.title_lead}{" "}
          <span className="text-db-lava">{header.title_accent}.</span>
        </h1>
        <p className="text-grey-90 max-w-xl text-sm/normal tracking-tight text-pretty xl:max-w-2xl [&_strong]:font-medium [&_strong]:text-white">
          <RichText text={header.intro} />
        </p>
      </div>
    </section>
  );
}
