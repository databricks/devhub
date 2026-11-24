import type { ReactNode } from "react";

import { SectionKicker } from "@/components/products/section-kicker";

/**
 * Section opener in the same style as the /mvps section headings: a
 * bracketed kicker, then the section title and optional description.
 * A follow-up block inside a section leaves out the kicker.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  intro,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  intro?: string;
}): ReactNode {
  return (
    <div className="flex flex-col">
      {eyebrow ? (
        <SectionKicker className="text-grey-40 mb-4">{eyebrow}</SectionKicker>
      ) : null}
      <h2 className="max-w-4xl text-2xl/tight font-normal tracking-[-0.04em] text-pretty text-black md:text-4xl/tight">
        {title}
        {description ? (
          <>
            {" "}
            <span className="text-grey-40">{description}</span>
          </>
        ) : null}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-2xl text-base/6 tracking-tight text-pretty text-black/80">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
