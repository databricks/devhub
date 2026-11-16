import type { ReactNode } from "react";

import { formatDate } from "@/lib/ai-trends/format";
import type { ContentData } from "@/lib/ai-trends/schema";
import { cn } from "@/lib/utils";

import { RichText } from "./rich-text";

const VISIBLE_ENTRIES = 5;

/**
 * The latest publications, with the rest behind a native disclosure so they
 * stay in the HTML for crawlers and readers without JavaScript.
 */
export function Changelog({
  entries,
}: {
  entries: ContentData["changelog"];
}): ReactNode {
  const visible = entries.slice(0, VISIBLE_ENTRIES);
  const more = entries.slice(VISIBLE_ENTRIES);

  return (
    <div className="flex flex-col">
      <EntryList entries={visible} className="border-t border-black" />
      {more.length > 0 ? (
        <details className="group">
          <summary className="mt-10 inline-flex cursor-pointer list-none items-center bg-black py-3.5 pr-6 pl-7 font-mono text-base/none font-medium tracking-[-0.02em] text-white uppercase transition-colors group-open:hidden hover:bg-black/85 md:mt-16 [&::-webkit-details-marker]:hidden">
            View all publications
          </summary>
          <EntryList entries={more} />
        </details>
      ) : null}
    </div>
  );
}

function EntryList({
  entries,
  className,
}: {
  entries: ContentData["changelog"];
  className?: string;
}): ReactNode {
  return (
    <ol className={className}>
      {entries.map((entry) => (
        <li key={`${entry.date}-${entry.url}`}>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/row flex flex-col gap-3 border-b border-black/15 py-6 no-underline md:flex-row md:gap-8 md:py-8"
          >
            <time
              dateTime={entry.date}
              className="text-grey-40 shrink-0 font-mono text-sm/none uppercase tabular-nums md:w-40 md:pt-1.5"
            >
              {formatDate(entry.date)}
            </time>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h3 className="group-hover/row:text-orange text-xl/[1.25] font-medium tracking-[-0.02em] text-pretty text-black transition-colors md:text-2xl/[1.25]">
                {entry.title}
              </h3>
              {entry.description ? (
                <p className="text-grey-40 text-base/normal tracking-[-0.025em] text-pretty">
                  <RichText text={entry.description} />
                </p>
              ) : null}
            </div>
            <ArrowIcon />
          </a>
        </li>
      ))}
    </ol>
  );
}

function ArrowIcon(): ReactNode {
  const iconClass = "size-6 shrink-0";
  return (
    <span aria-hidden="true" className="hidden shrink-0 md:block">
      <img
        src="/img/ai-trends/arrow-up-right.svg"
        alt=""
        width={24}
        height={24}
        className={cn(iconClass, "group-hover/row:hidden")}
      />
      <img
        src="/img/ai-trends/arrow-up-right-accent.svg"
        alt=""
        width={24}
        height={24}
        className={cn(iconClass, "hidden group-hover/row:block")}
      />
    </span>
  );
}
