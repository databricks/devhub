"use client";

import { useEffect, useId, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import {
  isExternalHref,
  isHeaderNavItemActive,
  type HeaderNavItem,
} from "@/lib/header-navigation";
import { cn } from "@/lib/utils";
import { SiteSearch, type SiteSearchItem } from "@/components/ui/site-search";

type MobileNavProps = {
  items: readonly HeaderNavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchItems: readonly SiteSearchItem[];
};

type MobileMenuButtonProps = {
  className?: string;
  label: string;
  open: boolean;
} & ComponentProps<"button">;

const MOBILE_CLOSE_DOT_POSITIONS = [
  [15.37, 7],
  [13.98, 8.38],
  [12.6, 9.77],
  [11.18, 11.18],
  [9.83, 12.54],
  [8.44, 13.92],
  [7.06, 15.31],
  [7, 7.06],
  [8.38, 8.44],
  [9.77, 9.83],
  [12.54, 12.6],
  [13.92, 13.98],
  [15.31, 15.37],
] as const;

function MobileMenuButton({
  className,
  label,
  open,
  ...props
}: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "focus-visible:outline-db-cyan -mr-2 inline-flex size-10 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2",
        open
          ? "text-grey-12 hover:text-grey-12"
          : "text-white hover:text-white/85",
        className,
      )}
      {...props}
    >
      {open ? (
        <span className="relative size-6" aria-hidden="true">
          <span className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-current" />
          {MOBILE_CLOSE_DOT_POSITIONS.map(([left, top]) => (
            <span
              className="absolute size-[1.632px] bg-current"
              key={`${left}-${top}`}
              style={{ left, top }}
            />
          ))}
        </span>
      ) : (
        <span className="flex flex-col gap-1.75" aria-hidden="true">
          <span className="h-px w-6 bg-current" />
          <span className="h-px w-6 bg-current" />
          <span className="h-px w-6 bg-current" />
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function MobileTreeText({
  active = false,
  activeFill = "content",
  children,
  className,
  href,
  ...props
}: {
  active?: boolean;
  activeFill?: "content" | "full";
  children: string;
  className?: string;
  href: string;
} & Omit<ComponentProps<typeof Link>, "children" | "className" | "href">) {
  const isExternal = isExternalHref(href);

  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:outline-db-cyan absolute block font-mono text-xl leading-none font-normal tracking-[-0.025rem] whitespace-nowrap no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2",
        active
          ? "text-grey-12 hover:text-grey-12"
          : "text-grey-80 hover:text-grey-80",
        className,
      )}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center px-0.5 py-1",
          active && "bg-grey-80",
          activeFill === "full" && "flex w-full",
        )}
        data-mobile-menu-item-label="true"
      >
        {children}
        {isExternal && (
          <ArrowUpRight
            className={cn(
              "ml-1 size-4 shrink-0",
              active ? "text-grey-12" : "text-grey-80",
            )}
            aria-label="(opens in a new tab)"
          />
        )}
      </span>
    </Link>
  );
}

export function MobileNav({
  items,
  open,
  onOpenChange,
  searchItems,
}: MobileNavProps) {
  const menuId = useId();
  const pathname = usePathname() ?? "/";
  const isHomeActive = pathname === "/";
  let nextTop = 46;
  const positionedItems = items.map((item) => {
    const top = nextTop;
    nextTop += item.links ? 32 + item.links.length * 34 : 34;
    return { item, top };
  });

  useEffect(() => {
    onOpenChange(false);
  }, [onOpenChange, pathname]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const updateMenuTop = () => {
      const header = document.querySelector("header");
      if (!header) return;
      root.style.setProperty(
        "--devhub-mobile-menu-top",
        `${Math.round(header.getBoundingClientRect().bottom)}px`,
      );
    };

    updateMenuTop();
    window.addEventListener("resize", updateMenuTop);
    window.addEventListener("scroll", updateMenuTop, { passive: true });

    return () => {
      window.removeEventListener("resize", updateMenuTop);
      window.removeEventListener("scroll", updateMenuTop);
      root.style.removeProperty("--devhub-mobile-menu-top");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const inertElements = Array.from(
      document.body.querySelectorAll<HTMLElement>(
        "#devhub-main-content, .main-wrapper, footer",
      ),
    );
    const previousInertStates = inertElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.inert,
    }));

    document.body.style.overflow = "hidden";

    inertElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousInertStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });
    };
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    function closeOnDesktop() {
      if (mediaQuery.matches) {
        onOpenChange(false);
      }
    }

    closeOnDesktop();
    mediaQuery.addEventListener("change", closeOnDesktop);

    return () => {
      mediaQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [onOpenChange, open]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <MobileMenuButton
        className="ml-auto xl:hidden"
        label={open ? "Close menu" : "Open menu"}
        open={open}
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      />
      {open ? (
        <div
          id={menuId}
          className="bg-grey-12 text-grey-80 fixed inset-x-0 top-[var(--devhub-mobile-menu-top)] bottom-0 z-40 overflow-y-auto xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          data-state="open"
        >
          <nav
            className="relative flex h-full w-full justify-between font-mono text-xl leading-none font-normal tracking-[-0.025rem]"
            aria-label="Main navigation"
            style={{ minHeight: nextTop + 80 }}
          >
            <span
              className="bg-grey-80 absolute top-[38px] left-[23px] w-px"
              style={{ height: (positionedItems.at(-1)?.top ?? 46) - 24 }}
              aria-hidden
            />
            <MobileTreeText
              active={isHomeActive}
              activeFill="full"
              aria-current={isHomeActive ? "page" : undefined}
              className="top-3.5 right-5 left-5"
              href="/"
              data-mobile-menu-home="true"
            >
              ~/HOME
            </MobileTreeText>

            {positionedItems.map(({ item, top }) => (
              <div key={item.label}>
                <span
                  className="bg-grey-80 absolute left-6 h-px w-[37px] md:w-[39px]"
                  style={{ top: top + (item.links ? 12 : 14) }}
                  aria-hidden
                />
                {item.links ? (
                  <>
                    <span
                      className="text-grey-80 absolute left-[61px] flex h-6 items-center opacity-60"
                      style={{ top }}
                      data-mobile-menu-product-label={
                        item.label === "Product" ? "true" : undefined
                      }
                    >
                      {item.label.toLowerCase()}
                    </span>
                    <span
                      className="bg-grey-80 absolute left-[63px] w-px"
                      style={{
                        top: top + 26,
                        height: item.links.length * 34 - 16,
                      }}
                      aria-hidden
                    />
                    {item.links.map((link, index) => {
                      const isActive = isHeaderNavItemActive(link, pathname);
                      const linkTop = top + 30 + index * 34;
                      return (
                        <div key={link.href}>
                          <span
                            className="bg-grey-80 absolute left-[63px] h-px w-[37px]"
                            style={{ top: linkTop + 14 }}
                            aria-hidden
                          />
                          <MobileTreeText
                            active={isActive}
                            activeFill="full"
                            aria-current={isActive ? "page" : undefined}
                            className="right-5 left-[100px]"
                            style={{ top: linkTop }}
                            data-mobile-menu-product-link={
                              item.label === "Product" ? "true" : undefined
                            }
                            href={link.href}
                          >
                            {link.label.toLowerCase()}
                          </MobileTreeText>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <MobileTreeText
                    active={isHeaderNavItemActive(item, pathname)}
                    activeFill="full"
                    aria-current={
                      isHeaderNavItemActive(item, pathname) ? "page" : undefined
                    }
                    className="right-5 left-[61px] md:right-[22px] md:left-[63px]"
                    style={{ top }}
                    data-mobile-menu-section-link="true"
                    href={item.href}
                  >
                    {item.label.toLowerCase()}
                  </MobileTreeText>
                )}
              </div>
            ))}
            <div className="mt-auto w-full px-5 pb-5.5 md:px-6 md:pb-6">
              <SiteSearch
                iconClassName="size-4.5"
                items={searchItems}
                previewLimit={8}
                suggestedHeading="Suggested docs"
                title="Search documentation"
                triggerClassName="h-10 w-full justify-start rounded-none border border-grey-80 bg-transparent px-3 font-mono text-lg/tight font-normal tracking-tight text-grey-80 shadow-none hover:bg-white/5 hover:text-grey-80 focus-visible:border-db-cyan focus-visible:ring-0 lg:has-[>kbd]:!pr-1.5"
                triggerKbdClassName="hidden"
              />
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
