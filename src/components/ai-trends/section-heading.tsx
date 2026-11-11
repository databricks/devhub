import type { ReactNode } from "react";

import { RichText } from "./rich-text";

const TITLE_CLASS =
  "font-heading text-foreground [&_strong]:text-db-lava text-2xl leading-tight font-medium tracking-[-0.02em] text-balance md:text-[1.75rem] [&_strong]:font-medium";

/** A second title inside a section: same level and type as the section title, no rule or number. */
export function SubsectionTitle({ title }: { title: string }): ReactNode {
  return (
    <h2 className={TITLE_CLASS}>
      <RichText text={title} />
    </h2>
  );
}

/**
 * Report-style section opener: a hairline rule, a numbered mono eyebrow, the
 * section title and an optional short intro. Every section on the page uses
 * it, so the numbering and rhythm stay consistent.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
}: {
  index: number;
  eyebrow: string;
  title: string;
  intro?: string;
}): ReactNode {
  return (
    <div className="border-foreground/20 border-t pt-10">
      <div className="flex flex-col gap-2">
        <p className="text-foreground/65 font-mono text-[11px] tracking-[0.14em] uppercase">
          <span className="text-db-lava">{String(index).padStart(2, "0")}</span>
          <span aria-hidden="true" className="text-foreground/40 mx-2">
            /
          </span>
          {eyebrow}
        </p>
        <h2 className={TITLE_CLASS}>
          <RichText text={title} />
        </h2>
      </div>
      {intro ? (
        <p className="text-foreground/70 mt-3 max-w-2xl text-[15px] leading-relaxed text-pretty">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
