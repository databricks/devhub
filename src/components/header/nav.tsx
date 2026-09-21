"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import {
  isExternalHref,
  isHeaderNavItemActive,
  type HeaderNavItem,
} from "@/lib/header-navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type HeaderNavProps = {
  className?: string;
  items: readonly HeaderNavItem[];
};

const DROPDOWN_ROW_STEP = 24;

function NavItemChrome({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-active={active ? "true" : undefined}
      className={cn(
        "group/nav-item relative inline-flex px-3 py-2 font-mono text-[0.9375rem] leading-none text-white no-underline hover:no-underline",
        className,
      )}
    >
      <span
        className={cn(
          "bg-grey-12 pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-data-[state=open]/dropdown-trigger:opacity-100",
          !active && "group-hover/nav-item:opacity-100",
        )}
        aria-hidden="true"
      >
        <span className="bg-orange absolute top-0 right-0 size-3 translate-x-1/2 -translate-y-1/2 rotate-45 overflow-hidden border-2 border-black" />
      </span>
      <span className="relative z-10">
        <span className={cn(active && "text-orange transition-colors")}>[</span>
        {children}
        <span className={cn(active && "text-orange transition-colors")}>]</span>
      </span>
    </span>
  );
}

function NavDropdownFrame({ height }: { height: number }) {
  return (
    <svg
      data-header-dropdown-frame="true"
      className="pointer-events-none absolute top-2.5 left-1 z-30 w-[178px] overflow-visible text-white"
      style={{ height }}
      viewBox={`0 0 178 ${height}`}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M177.5 ${height - 9.9681}V${height - 0.5}H0.5V0.5H177.5V1.44681V9.96809`}
        stroke="currentColor"
      />
      <path
        d={`M176.5 0.504639V1.45145V9.97272M176.5 ${height - 0.4954}V${height - 9.9635}`}
        stroke="currentColor"
      />
      <path d={`M1.5 0.5V${height - 0.5}`} stroke="currentColor" />
    </svg>
  );
}

function NavScrollArrow({
  direction,
  top,
}: {
  direction: "up" | "down";
  top: number;
}) {
  return (
    <span
      className="absolute left-[174.5px] z-30 size-3 text-white"
      style={{ top }}
    >
      <svg
        className={cn(
          "absolute top-[0.95px] left-[2.67px] h-[9.88514px] w-[6.6688px] overflow-visible",
          direction === "down" && "rotate-180",
        )}
        viewBox="0 0 6.6688 9.88514"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M5.87684 3.3344L3.3344 0.79196L0.79196 3.3344"
          stroke="currentColor"
          strokeWidth={1.12}
          strokeLinecap="square"
        />
        <path
          d="M3.33552 9.32514V1.00957"
          stroke="currentColor"
          strokeWidth={1.12}
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}

function NavScrollDotColumn({
  left,
  top,
  height,
}: {
  left: number;
  top: number;
  height: number;
}) {
  return (
    <svg
      data-header-dropdown-dot-column="true"
      className="absolute z-0 w-[3px] overflow-visible"
      style={{ left, top, height }}
      viewBox={`0 0 3 ${height}`}
      fill="none"
      preserveAspectRatio="none"
    >
      {Array.from(
        { length: Math.floor(height / 2) },
        (_, index) => index * 2 + 1.5,
      ).map((dotY) => (
        <circle
          cx="1.5"
          cy={dotY}
          r="1"
          fill="currentColor"
          stroke="var(--grey-12)"
          key={dotY}
        />
      ))}
    </svg>
  );
}

function NavScrollbar({
  highlightedIndex,
  rowCount,
}: {
  highlightedIndex: number;
  rowCount: number;
}) {
  const trackHeight = rowCount * DROPDOWN_ROW_STEP - 30;
  const thumbHeight = Math.min(18, trackHeight / 2);
  const step = (trackHeight - thumbHeight) / Math.max(1, rowCount - 1);
  return (
    <span
      className="pointer-events-none absolute inset-0 text-white"
      aria-hidden="true"
    >
      <NavScrollDotColumn left={175.7} top={34} height={trackHeight} />
      <NavScrollDotColumn left={177.9} top={35.04} height={trackHeight} />
      <NavScrollDotColumn left={180.1} top={34} height={trackHeight} />
      <NavScrollDotColumn left={182.3} top={35.04} height={trackHeight} />
      <NavScrollArrow direction="up" top={21} />
      <span
        data-header-dropdown-thumb="true"
        className="absolute top-[34px] left-44 z-20 w-[9px] bg-white"
        style={{
          height: thumbHeight,
          transform: `translateY(${highlightedIndex * step}px)`,
        }}
      />
      <NavScrollArrow direction="down" top={34 + trackHeight} />
    </span>
  );
}

function NavDropdown({
  links,
  activeHref,
  highlightedHref,
  onHighlightChange,
  onHighlightReset,
}: {
  links: NonNullable<HeaderNavItem["links"]>;
  activeHref: string | undefined;
  highlightedHref: string | undefined;
  onHighlightChange: (href: string) => void;
  onHighlightReset: () => void;
}) {
  const highlightedIndex = Math.max(
    0,
    links.findIndex(({ href }) => href === highlightedHref),
  );

  return (
    <div
      className="bg-grey-12 relative w-[185px] font-mono text-sm leading-none text-white"
      style={{ height: links.length * DROPDOWN_ROW_STEP + 39 }}
      onMouseLeave={onHighlightReset}
      onBlur={(event) => {
        const nextFocusedElement = event.relatedTarget;

        if (
          !(nextFocusedElement instanceof Node) ||
          !event.currentTarget.contains(nextFocusedElement)
        ) {
          onHighlightReset();
        }
      }}
    >
      <NavDropdownFrame height={links.length * DROPDOWN_ROW_STEP + 18} />
      <span
        data-header-dropdown-highlight="true"
        className="pointer-events-none absolute top-[18px] left-2.5 z-10 h-[22px] w-[166px] bg-white"
        style={{
          transform: `translateY(${highlightedIndex * DROPDOWN_ROW_STEP}px)`,
        }}
        aria-hidden="true"
      />
      <div className="absolute top-[18px] left-2.5 z-20 flex w-[166px] flex-col gap-0.5">
        {links.map((link) => {
          const isLinkActive = link.href === activeHref;
          const isLinkHighlighted = link.href === highlightedHref;
          const isExternal = isExternalHref(link.href);

          return (
            <NavigationMenuLink
              active={isLinkActive}
              asChild
              className={cn(
                "focus-visible:outline-db-cyan !flex !h-[22px] !w-full !flex-row !items-center !gap-0 !rounded-none !bg-transparent !px-2 !py-1 font-mono text-sm leading-none tracking-normal no-underline !transition-none outline-none hover:!bg-transparent hover:no-underline focus:!bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 data-[active=true]:!bg-transparent",
                isLinkHighlighted
                  ? "!text-grey-12 hover:!text-grey-12 focus:!text-grey-12"
                  : "!text-white hover:!text-white focus:!text-white",
              )}
              key={link.href}
            >
              <Link
                aria-current={isLinkActive ? "page" : undefined}
                href={link.href}
                onFocus={() => onHighlightChange(link.href)}
                onPointerEnter={() => onHighlightChange(link.href)}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
                {isExternal && (
                  <ArrowUpRight
                    className={cn(
                      "ml-1 size-3.5 shrink-0",
                      isLinkHighlighted ? "text-grey-12" : "text-white",
                    )}
                    aria-label="(opens in a new tab)"
                  />
                )}
              </Link>
            </NavigationMenuLink>
          );
        })}
      </div>
      <NavScrollbar
        highlightedIndex={highlightedIndex}
        rowCount={links.length}
      />
    </div>
  );
}

export function HeaderNav({ className, items }: HeaderNavProps) {
  const pathname = usePathname() ?? "/";
  const [highlightedHref, setHighlightedHref] = useState<string | null>(null);

  return (
    <NavigationMenu
      viewport={false}
      delayDuration={0}
      className={cn("flex max-w-none flex-none justify-start", className)}
      aria-label="Main"
    >
      <NavigationMenuList className="flex justify-start gap-0.5">
        {items.map((item) => {
          const { href, label } = item;

          if (item.links) {
            const activeHref = item.links.find((link) =>
              isHeaderNavItemActive(link, pathname),
            )?.href;
            const highlightHref =
              highlightedHref ?? activeHref ?? item.links[0]?.href;
            const isActive = Boolean(activeHref);

            return (
              <NavigationMenuItem
                key={href}
                onPointerLeave={() => setHighlightedHref(null)}
              >
                <NavigationMenuTrigger className="group/dropdown-trigger focus-visible:outline-db-cyan h-auto rounded-none bg-transparent! p-0 font-mono text-white shadow-none !transition-none hover:bg-transparent! hover:text-white! focus:bg-transparent! focus:text-white! focus-visible:outline-offset-2 data-[active=true]:!bg-transparent data-[state=open]:bg-transparent! data-[state=open]:text-white! [&>svg]:hidden">
                  <NavItemChrome active={isActive}>{label}</NavItemChrome>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-grey-12! z-60 mt-0! w-[185px]! overflow-visible! rounded-none! border-0! p-0! shadow-none! !transition-none !duration-0 group-data-[viewport=false]/navigation-menu:!duration-0 data-[motion^=from-]:!animate-none data-[motion^=to-]:!animate-none data-[state=closed]:!animate-none group-data-[viewport=false]/navigation-menu:data-[state=closed]:!animate-none data-[state=open]:!animate-none group-data-[viewport=false]/navigation-menu:data-[state=open]:!animate-none">
                  <NavDropdown
                    links={item.links}
                    activeHref={activeHref}
                    highlightedHref={highlightHref}
                    onHighlightChange={setHighlightedHref}
                    onHighlightReset={() => setHighlightedHref(null)}
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          const isActive = isHeaderNavItemActive(item, pathname);

          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                active={isActive}
                asChild
                className="block rounded-none bg-transparent p-0 text-white no-underline hover:bg-transparent hover:text-white hover:no-underline focus:bg-transparent focus:text-white data-active:bg-transparent data-active:hover:cursor-default"
              >
                <Link href={href}>
                  <NavItemChrome active={isActive}>{label}</NavItemChrome>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
