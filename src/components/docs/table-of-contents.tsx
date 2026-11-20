"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type DocsTableOfContentsItem = {
  anchor: string;
  depth: number;
  title: string;
};

type TableOfContentsProps = {
  className?: string;
  items: readonly DocsTableOfContentsItem[];
  title?: string;
  /** Link colors for the page background; docs pages are dark. */
  tone?: "dark" | "light";
};

function useActiveAnchor(
  items: readonly DocsTableOfContentsItem[],
  viewportOffset = 0.5,
  throttleMs = 100,
) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [hasResolvedHeadings, setHasResolvedHeadings] = useState(false);
  const [hasAnyHeadings, setHasAnyHeadings] = useState(false);
  const headingRefs = useRef<{ id: string; getTop: () => number }[]>([]);
  const throttleRef = useRef<number | null>(null);

  useEffect(() => {
    const refs = items
      .map(({ anchor }) => {
        const el = document.getElementById(anchor);
        return el
          ? { id: anchor, getTop: () => el.getBoundingClientRect().top }
          : null;
      })
      .filter(Boolean) as { id: string; getTop: () => number }[];

    headingRefs.current = refs;
    setHasAnyHeadings(refs.length > 0);
    setHasResolvedHeadings(true);
  }, [items]);

  const calcActive = useCallback(() => {
    if (!headingRefs.current.length) {
      return;
    }

    const activationLine = window.innerHeight * viewportOffset;
    let currentId: string | null = null;

    if (headingRefs.current[0].getTop() > activationLine) {
      setActiveAnchor(null);
      return;
    }

    for (const { id, getTop } of headingRefs.current) {
      if (getTop() <= activationLine) {
        currentId = id;
      } else {
        break;
      }
    }

    setActiveAnchor(currentId);
  }, [viewportOffset]);

  const throttledCalcActive = useCallback(() => {
    if (throttleRef.current !== null) {
      return;
    }

    throttleRef.current = window.setTimeout(() => {
      throttleRef.current = null;
      calcActive();
    }, throttleMs);
  }, [calcActive, throttleMs]);

  useEffect(() => {
    calcActive();
    window.addEventListener("scroll", throttledCalcActive);
    window.addEventListener("resize", throttledCalcActive);

    return () => {
      window.removeEventListener("scroll", throttledCalcActive);
      window.removeEventListener("resize", throttledCalcActive);

      if (throttleRef.current !== null) {
        window.clearTimeout(throttleRef.current);
      }
    };
  }, [calcActive, throttledCalcActive]);

  return { activeAnchor, hasAnyHeadings, hasResolvedHeadings };
}

export function TableOfContents({
  className,
  items,
  title = "Table of contents",
  tone = "dark",
}: TableOfContentsProps): ReactNode {
  const { activeAnchor, hasAnyHeadings, hasResolvedHeadings } =
    useActiveAnchor(items);
  const currentAnchor =
    activeAnchor ??
    (hasResolvedHeadings && !hasAnyHeadings ? items[0]?.anchor : null);

  const handleLinkClick = useCallback(
    (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      // Native fragment navigation advances keyboard focus into the section.
      if (
        event.detail === 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      event.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    },
    [],
  );

  if (!items.length) {
    return null;
  }

  return (
    <nav className={cn("table-of-contents", className)} aria-label={title}>
      <h2 className="text-grey-50 mb-6 font-mono text-xs/none font-medium tracking-normal uppercase">
        {title}
      </h2>

      <ol className="mt-3.5 flex list-none flex-col gap-y-3.5 p-0">
        {items.map(({ anchor, title }) => (
          <li className="flex min-w-0" key={anchor}>
            <a
              className={cn(
                "line-clamp-2 w-full min-w-0 text-sm leading-snug font-normal break-words no-underline",
                currentAnchor === anchor
                  ? "text-orange"
                  : tone === "light"
                    ? "hover:text-orange text-black/60"
                    : "text-grey-70 hover:text-orange",
              )}
              href={`#${anchor}`}
              aria-current={currentAnchor === anchor ? "location" : undefined}
              onClick={handleLinkClick(anchor)}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}
