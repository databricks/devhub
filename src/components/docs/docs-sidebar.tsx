"use client";

import {
  useEffect,
  useId,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, CornerDownRight } from "lucide-react";

import type { DocsSidebarItem } from "@/lib/docs-content";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type DocsSidebarProps = {
  items: readonly DocsSidebarItem[];
  mode?: "desktop" | "mobile";
  onItemClick?: () => void;
};

function normalizePath(path?: string): string {
  return path?.replace(/\/$/, "") ?? "";
}

function isSameHref(a?: string, b?: string): boolean {
  return normalizePath(a) === normalizePath(b);
}

function getItemHref(item: DocsSidebarItem): string | undefined {
  return item.type === "separator" ? undefined : item.href;
}

function hasActiveDescendant(
  item: DocsSidebarItem,
  currentPath: string,
): boolean {
  if (isSameHref(getItemHref(item), currentPath)) {
    return true;
  }

  if (item.type === "category") {
    return item.items.some((child) => hasActiveDescendant(child, currentPath));
  }

  return false;
}

function findFirstHref(items: readonly DocsSidebarItem[]): string | undefined {
  for (const item of items) {
    const href = getItemHref(item);
    if (href) {
      return href;
    }

    if (item.type === "category") {
      const nested = findFirstHref(item.items);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

function hasHrefDescendant(item: DocsSidebarItem, href: string): boolean {
  if (isSameHref(getItemHref(item), href)) {
    return true;
  }

  if (item.type !== "category") {
    return false;
  }

  return item.items.some((child) => hasHrefDescendant(child, href));
}

function useCenteredActiveItem(pathname: string, enabled = true) {
  const [viewport, setViewport] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!viewport || !enabled) {
      return;
    }

    const scrollViewport = viewport;
    let frame = 0;
    let centered = false;

    function scheduleCenter() {
      if (centered) {
        return;
      }

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = scrollViewport.querySelector<HTMLElement>(
          'a[aria-current="page"]',
        );
        if (!active || scrollViewport.clientHeight === 0) {
          return;
        }

        const activeRect = active.getBoundingClientRect();
        if (activeRect.height === 0) {
          return;
        }

        const viewportRect = scrollViewport.getBoundingClientRect();
        scrollViewport.scrollTop +=
          activeRect.top -
          viewportRect.top -
          scrollViewport.clientTop +
          activeRect.height / 2 -
          scrollViewport.clientHeight / 2;
        centered = true;
        mutations.disconnect();
        resize.disconnect();
      });
    }

    const mutations = new MutationObserver(scheduleCenter);
    const resize = new ResizeObserver(scheduleCenter);
    mutations.observe(viewport, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-current", "data-state", "hidden", "style"],
    });
    resize.observe(viewport);
    if (viewport.firstElementChild) {
      resize.observe(viewport.firstElementChild);
    }
    scheduleCenter();

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resize.disconnect();
    };
  }, [enabled, pathname, viewport]);

  return setViewport;
}

function SidebarActiveIndicator({
  className,
  depth,
}: {
  className: string;
  depth: number;
}): ReactNode {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-orange absolute w-(--docs-sidebar-rail-width)",
        className,
      )}
      data-slot="docs-sidebar-active-indicator"
      style={{
        left: `calc(-${depth} * var(--docs-sidebar-indent) - var(--docs-sidebar-rail-width))`,
      }}
    />
  );
}

function SidebarItemLabel({
  label,
  mode,
}: {
  label: string;
  mode: "desktop" | "mobile";
}): ReactNode {
  return (
    <span
      className={cn(
        "line-clamp-2 min-w-0 text-pretty",
        mode === "desktop"
          ? "text-sm leading-snug font-medium tracking-tight"
          : "text-base leading-snug font-medium tracking-tight",
      )}
      title={label}
    >
      {label}
    </span>
  );
}

function DocsSidebarLink({
  ariaCurrent,
  children,
  className,
  href,
  onClick,
}: {
  ariaCurrent?: "page";
  children: ReactNode;
  className: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}): ReactNode {
  if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(href) || href.endsWith("/")) {
    return (
      <a
        aria-current={ariaCurrent}
        className={className}
        href={href}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      aria-current={ariaCurrent}
      className={className}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

type RecursiveSidebarItemProps = {
  activePath: string;
  depth: number;
  fallbackActiveHref?: string;
  item: DocsSidebarItem;
  mode: "desktop" | "mobile";
  onItemClick?: () => void;
};

function RecursiveSidebarItem({
  activePath,
  depth,
  fallbackActiveHref,
  item,
  mode,
  onItemClick,
}: RecursiveSidebarItemProps): ReactNode {
  const href = getItemHref(item);
  const pathActive = isSameHref(href, activePath);
  const fallbackActive =
    !!fallbackActiveHref && isSameHref(href, fallbackActiveHref);
  const exactActive = pathActive || fallbackActive;
  const branchActive =
    hasActiveDescendant(item, activePath) ||
    (!!fallbackActiveHref && hasHrefDescendant(item, fallbackActiveHref));
  const collapsibleContentId = useId();

  if (item.type === "separator") {
    return (
      <li className={cn(depth === 0 ? "mt-5 first:mt-0" : "mt-4")}>
        {item.label ? (
          <p
            className={cn(
              "text-grey-50 m-0 text-pretty",
              mode === "desktop"
                ? "text-xs leading-snug font-medium tracking-normal"
                : "text-sm leading-snug font-medium tracking-normal",
            )}
          >
            {item.label}
          </p>
        ) : (
          <div className="bg-grey-12 h-px" aria-hidden="true" />
        )}
      </li>
    );
  }

  if (item.type === "category") {
    const hasChildren = item.items.length > 0;
    const [isOpen, setIsOpen] = useState(
      hasChildren && (branchActive || exactActive || item.collapsed === false),
    );

    useEffect(() => {
      if (hasChildren && (branchActive || exactActive)) {
        setIsOpen(true);
      }
    }, [branchActive, exactActive, hasChildren]);

    if (!hasChildren && !href) {
      return null;
    }

    return (
      <li>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div
            className={cn(
              "group relative flex w-full items-center justify-between rounded-none border-0 bg-transparent px-0 text-left transition-colors",
              mode === "desktop" ? "min-h-8 py-1.5 text-sm" : "h-9 text-base",
              exactActive ? "text-orange" : "text-grey-70 hover:text-orange",
            )}
          >
            {depth >= 1 && exactActive ? (
              <SidebarActiveIndicator
                className="top-1.5 bottom-1.5"
                depth={depth}
              />
            ) : null}
            {href ? (
              <DocsSidebarLink
                ariaCurrent={exactActive ? "page" : undefined}
                className={cn(
                  "relative min-w-0 flex-1 text-inherit no-underline outline-hidden hover:text-inherit hover:no-underline",
                  exactActive && "text-orange",
                )}
                href={href}
                onClick={(event) => {
                  if (exactActive) {
                    event.preventDefault();
                    setIsOpen((value) => !value);
                  } else {
                    setIsOpen(true);
                    onItemClick?.();
                  }
                }}
              >
                <SidebarItemLabel label={item.label} mode={mode} />
              </DocsSidebarLink>
            ) : (
              <CollapsibleTrigger
                aria-controls={collapsibleContentId}
                className="flex min-w-0 flex-1 items-center rounded-none border-0 bg-transparent p-0 text-inherit"
              >
                <SidebarItemLabel label={item.label} mode={mode} />
              </CollapsibleTrigger>
            )}

            {hasChildren ? (
              <CollapsibleTrigger
                aria-label={
                  isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`
                }
                aria-controls={collapsibleContentId}
                className="ml-auto inline-flex size-6 shrink-0 items-center justify-end rounded-none border-0 bg-transparent p-0 text-inherit"
              >
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isOpen && "rotate-90",
                  )}
                  strokeWidth={2.5}
                />
              </CollapsibleTrigger>
            ) : null}
          </div>

          <CollapsibleContent className="py-0.5" id={collapsibleContentId}>
            <DocsSidebar
              activePath={activePath}
              className={cn(
                "pl-(--docs-sidebar-indent)",
                depth < 1 &&
                  "border-grey-12 [border-left-width:var(--docs-sidebar-rail-width)]",
              )}
              depth={depth + 1}
              fallbackActiveHref={fallbackActiveHref}
              items={item.items}
              mode={mode}
              onItemClick={onItemClick}
            />
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  return (
    <li className="my-0">
      <DocsSidebarLink
        ariaCurrent={exactActive ? "page" : undefined}
        className={cn(
          "text-grey-70 hover:text-orange relative flex min-w-0 flex-1 items-center rounded-none border-none bg-transparent no-underline outline-hidden transition-colors hover:bg-transparent hover:no-underline",
          mode === "desktop"
            ? "min-h-8 px-0 py-1.5 text-sm leading-snug font-medium tracking-tight"
            : "h-9 text-base leading-snug font-medium tracking-tight",
          exactActive && "text-orange hover:text-orange font-medium",
        )}
        href={item.href}
        onClick={onItemClick}
      >
        {depth >= 1 && exactActive ? (
          <SidebarActiveIndicator className="top-0 h-full" depth={depth} />
        ) : null}
        <SidebarItemLabel label={item.label} mode={mode} />
      </DocsSidebarLink>
    </li>
  );
}

function DocsSidebar({
  activePath,
  className,
  depth = 0,
  fallbackActiveHref,
  items,
  mode = "desktop",
  onItemClick,
}: DocsSidebarProps & {
  activePath: string;
  className?: string;
  depth?: number;
  fallbackActiveHref?: string;
}): ReactNode {
  return (
    <ul
      className={cn(
        "m-0 flex list-none flex-col gap-y-0 p-0 [--docs-sidebar-indent:0.75rem] [--docs-sidebar-rail-width:1px]",
        className,
      )}
    >
      {items.map((item, index) => (
        <RecursiveSidebarItem
          activePath={activePath}
          depth={depth}
          fallbackActiveHref={fallbackActiveHref}
          item={item}
          key={getItemHref(item) ?? `${item.type}-${item.label}-${index}`}
          mode={mode}
          onItemClick={onItemClick}
        />
      ))}
    </ul>
  );
}

export function DocsDesktopSidebar({
  items,
}: {
  items: readonly DocsSidebarItem[];
}): ReactNode {
  const pathname = usePathname();
  const viewportRef = useCenteredActiveItem(pathname);
  const anyActive = items.some((item) => hasActiveDescendant(item, pathname));
  const fallbackActiveHref = anyActive ? undefined : findFirstHref(items);

  return (
    <nav
      aria-label="Docs sidebar"
      className="thin-scrollbar sticky top-(--sticky-header-height) max-h-[calc(100svh-var(--sticky-header-height))] grow [scrollbar-gutter:stable] overflow-y-auto border-r-0 bg-black px-1 pt-7 pb-10"
      ref={viewportRef}
    >
      <div className="flex flex-col gap-y-0 pb-10">
        <DocsSidebar
          activePath={pathname}
          fallbackActiveHref={fallbackActiveHref}
          items={items}
        />
      </div>
    </nav>
  );
}

export function DocsMobileSidebar({
  items,
  title = "Documentation",
}: {
  items: readonly DocsSidebarItem[];
  title?: string;
}): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const viewportRef = useCenteredActiveItem(pathname, open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (items.length === 0) {
    return null;
  }

  const anyActive = items.some((item) => hasActiveDescendant(item, pathname));
  const fallbackActiveHref = anyActive ? undefined : findFirstHref(items);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      preventScrollRestoration
      shouldScaleBackground={false}
    >
      <DrawerTrigger
        className="border-prose-border fixed inset-x-0 bottom-0 z-30 flex h-14 items-center border-0 border-t bg-black px-5 text-base leading-none font-medium tracking-tight text-white lg:hidden"
        data-slot="documentation-menu-trigger"
      >
        <CornerDownRight aria-hidden="true" className="mr-2.5 size-3.5" />
        <span>{title}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ml-auto size-5 transition-transform",
            open && "rotate-180",
          )}
        />
      </DrawerTrigger>

      <DrawerContent className="border-prose-border flex h-[75dvh] flex-col rounded-t-xl bg-black p-0 text-white lg:hidden">
        <DrawerTitle className="sr-only">Documentation menu</DrawerTitle>
        <div
          className="flex-1 overflow-y-auto px-5 pt-6 pb-12"
          data-slot="docs-sidebar-viewport"
          ref={viewportRef}
        >
          <DocsSidebar
            activePath={pathname}
            fallbackActiveHref={fallbackActiveHref}
            items={items}
            mode="mobile"
            onItemClick={() => {
              setOpen(false);
            }}
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full bg-linear-to-b from-transparent to-black"
        />
      </DrawerContent>
    </Drawer>
  );
}
