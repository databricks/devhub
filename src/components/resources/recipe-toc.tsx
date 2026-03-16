import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

type TocItem = {
  id: string;
  text: string;
};

type RecipeTocProps = {
  contentRef: React.RefObject<HTMLDivElement | null>;
};

export function RecipeToc({ contentRef }: RecipeTocProps): ReactNode {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const buildToc = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    const headings = container.querySelectorAll("h2");
    const tocItems: TocItem[] = [];

    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id =
          heading.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") ?? "";
      }
      if (heading.id) {
        tocItems.push({
          id: heading.id,
          text: heading.textContent ?? "",
        });
      }
    });

    setItems(tocItems);
  }, [contentRef]);

  useEffect(() => {
    buildToc();
    const timer = setTimeout(buildToc, 500);
    return () => clearTimeout(timer);
  }, [buildToc]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container || items.length === 0) return;

    observerRef.current?.disconnect();

    const visibleIds = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });

        const firstVisible = items.find((item) => visibleIds.has(item.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    items.forEach((item) => {
      const el = container.querySelector(`#${CSS.escape(item.id)}`);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items, contentRef]);

  if (items.length < 2) return null;

  return (
    <nav className="recipe-toc sticky top-[calc(var(--ifm-navbar-height)+1rem)]">
      <div className="rounded-2xl border border-db-border bg-db-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold tracking-[0.06em] uppercase text-muted-foreground">
          On this page
        </p>
        <ul className="m-0 list-none space-y-1 p-0">
          {items.map((item) => (
            <li key={item.id} className="m-0 p-0">
              <a
                href={`#${item.id}`}
                className={[
                  "block rounded-md px-2 py-1 text-[13px] no-underline transition-colors",
                  activeId === item.id
                    ? "font-medium text-db-lava"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveId(item.id);
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
