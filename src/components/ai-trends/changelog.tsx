import type { ReactNode } from "react";

import { formatDate } from "@/lib/ai-trends/format";
import type { ContentData } from "@/lib/ai-trends/schema";
import { AnimatedArrowLink } from "@/components/ui/animated-arrow-link";

import { RichText } from "./rich-text";

export function Changelog({
  entries,
}: {
  entries: ContentData["changelog"];
}): ReactNode {
  return (
    <ol className="divide-y divide-black/10 border-y border-black/10">
      {entries.map((entry, i) => (
        <li
          key={`${entry.date}-${i}`}
          className="grid gap-x-10 gap-y-2 py-7 md:grid-cols-[12rem_minmax(0,1fr)]"
        >
          <time
            dateTime={entry.date}
            className="text-foreground/65 font-mono text-xs leading-6 tabular-nums"
          >
            {formatDate(entry.date)}
          </time>
          <div className="max-w-3xl">
            <AnimatedArrowLink
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading hover:text-db-lava inline-flex items-center gap-2 text-xl leading-snug font-medium tracking-[-0.01em] text-black no-underline transition-colors"
              size="size-3.5"
            >
              {entry.title}
            </AnimatedArrowLink>
            {entry.description ? (
              <p className="text-foreground/70 mt-1.5 text-sm leading-relaxed">
                <RichText text={entry.description} />
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
