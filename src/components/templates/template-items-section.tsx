"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  matchesTemplateFilter,
  SERVICES,
  type Service,
} from "@/lib/recipes/recipes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TemplateCard } from "@/components/templates/template-card";
import type { TemplateItem } from "@/components/templates/template-card";
import { TemplateFilters } from "@/components/templates/template-filters";
import { TemplateSearch } from "@/components/templates/template-search";

type TemplateItemsSectionProps = {
  items: TemplateItem[];
  replitTemplateIds: string[];
};

export function TemplateItemsSection({
  items,
  replitTemplateIds,
}: TemplateItemsSectionProps): ReactNode {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<Service>>(
    new Set(),
  );
  const [replitOnly, setReplitOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const availableServices = useMemo(
    () =>
      SERVICES.filter((service) =>
        items.some((item) => item.data.services.includes(service)),
      ),
    [items],
  );

  const replitTemplateIdSet = useMemo(
    () => new Set(replitTemplateIds),
    [replitTemplateIds],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (replitOnly && !replitTemplateIdSet.has(item.data.id)) return false;
        return matchesTemplateFilter(item.data, {
          searchQuery,
          selectedServices,
        });
      }),
    [searchQuery, selectedServices, replitOnly, replitTemplateIdSet, items],
  );

  const selectedFilterCount = selectedServices.size + (replitOnly ? 1 : 0);
  const hasSelectedFilters = selectedFilterCount > 0;

  const templatesListRef = useRef<HTMLElement>(null);

  const scrollToTemplatesList = useCallback(() => {
    const el = templatesListRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      scrollToTemplatesList();
    },
    [scrollToTemplatesList],
  );

  const handleToggleService = useCallback(
    (service: Service) => {
      setSelectedServices((prev) => {
        const next = new Set(prev);
        if (next.has(service)) next.delete(service);
        else next.add(service);
        return next;
      });
      scrollToTemplatesList();
    },
    [scrollToTemplatesList],
  );

  const handleClearAllFilters = useCallback(() => {
    setSelectedServices(new Set());
    setSearchQuery("");
    setReplitOnly(false);
    scrollToTemplatesList();
  }, [scrollToTemplatesList]);

  const handleClearSelectedFilters = useCallback(() => {
    setSelectedServices(new Set());
    setReplitOnly(false);
    scrollToTemplatesList();
  }, [scrollToTemplatesList]);

  const handleToggleReplitOnly = useCallback(() => {
    setReplitOnly((prev) => !prev);
    scrollToTemplatesList();
  }, [scrollToTemplatesList]);

  const filtersScrollRef = useRef<HTMLDivElement>(null);
  const [filterScrollState, setFilterScrollState] = useState({
    left: false,
    right: false,
  });

  const updateFilterScrollState = useCallback(() => {
    const el = filtersScrollRef.current;
    if (!el) return;
    setFilterScrollState({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    updateFilterScrollState();
    const el = filtersScrollRef.current;
    if (!el) return;
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateFilterScrollState);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", updateFilterScrollState);
    return () => window.removeEventListener("resize", updateFilterScrollState);
  }, [selectedFilterCount, updateFilterScrollState]);

  return (
    <>
      <section
        className="scroll-mt-24 pt-12 md:pt-16"
        id="templates-list"
        ref={templatesListRef}
      >
        <h2 className="sr-only">Templates</h2>
        <div className="mx-auto grid w-full max-w-400 gap-12 px-5 md:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-x-20 2xl:gap-32">
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-y-8">
              <TemplateSearch
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <TemplateFilters
                availableServices={availableServices}
                selectedServices={selectedServices}
                onToggleService={handleToggleService}
                replitOnly={replitOnly}
                onToggleReplitOnly={handleToggleReplitOnly}
                selectedFilterCount={selectedFilterCount}
                onClearFilters={handleClearSelectedFilters}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-12 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <TemplateSearch
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="shrink-0">
                  <Button
                    className="hover:bg-grey-90 size-10 rounded-none border border-[#C7C9D1] bg-transparent p-0 text-[#000]"
                    onClick={() => setMobileFiltersOpen(true)}
                    aria-label="Open filters"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.5 1.5H11.5"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 10.5H7"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 4.5H10"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.5 7.5H8.5"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
              {hasSelectedFilters && (
                <div className="mt-3 flex items-center gap-3">
                  {selectedFilterCount >= 2 && (
                    <>
                      <Button
                        style={{ padding: 0 }}
                        className="focus-visible:ring-db-cyan focus-visible:ring-offset-db-oat-light h-auto shrink-0 gap-1 rounded-none bg-transparent font-sans text-sm/none font-medium tracking-tight text-black/30 uppercase shadow-none hover:bg-transparent! hover:text-black focus-visible:bg-transparent! active:bg-transparent! [&_svg:not([class*='size-'])]:size-3"
                        type="button"
                        variant="ghost"
                        onClick={handleClearSelectedFilters}
                      >
                        Clear all
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.125 1.875L1.875 10.125M1.875 1.875L10.125 10.125"
                            stroke="currentColor"
                            strokeWidth="1.13"
                            strokeMiterlimit="10"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                      <div
                        className="h-8 w-px shrink-0 bg-[#C7C9D1]"
                        aria-hidden="true"
                      />
                    </>
                  )}
                  <div className="relative min-w-0 flex-1">
                    <div
                      ref={filtersScrollRef}
                      className="scroll-px-5 [scrollbar-width:none] overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                      onScroll={updateFilterScrollState}
                    >
                      <div className="flex gap-2">
                        {Array.from(selectedServices).map((service) => (
                          <span
                            key={service}
                            className="flex shrink-0 items-center gap-1.5 bg-[#FF5F46] px-3.5 py-1.5 font-mono text-sm font-medium text-black uppercase"
                          >
                            {service}
                            <button
                              onClick={() => handleToggleService(service)}
                              aria-label={`Remove ${service} filter`}
                              className="flex items-center"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.125 1.875L1.875 10.125M1.875 1.875L10.125 10.125"
                                  stroke="currentColor"
                                  strokeWidth="1.13"
                                  strokeMiterlimit="10"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}
                        {replitOnly && (
                          <span className="flex shrink-0 items-center gap-1.5 bg-[#FF5F46] px-3.5 py-1.5 font-mono text-sm font-medium text-black uppercase">
                            Replit
                            <button
                              onClick={handleToggleReplitOnly}
                              aria-label="Remove Replit filter"
                              className="flex items-center"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.125 1.875L1.875 10.125M1.875 1.875L10.125 10.125"
                                  stroke="currentColor"
                                  strokeWidth="1.13"
                                  strokeMiterlimit="10"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-[#f9f7f4] to-transparent transition-opacity duration-200",
                        filterScrollState.left ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-[#f9f7f4] to-transparent transition-opacity duration-200",
                        filterScrollState.right ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <TemplateEmptyState onClearAll={handleClearAllFilters} />
            ) : (
              <div className="grid min-w-0 gap-y-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16 xl:gap-x-16">
                {filteredItems.map((item, index) => (
                  <TemplateCard key={item.data.id} item={item} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="top-0 flex flex-col gap-0 bg-[#f9f7f4] p-0"
        >
          <div className="flex shrink-0 items-center justify-between px-6 pt-6 pb-8">
            <SheetTitle className="text-foreground text-lg font-medium md:text-xl">
              Choose Filters
            </SheetTitle>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex items-center justify-center text-black opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Close filters"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 2.5L2.5 13.5"
                  stroke="currentColor"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 2.5L13.5 13.5"
                  stroke="currentColor"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TemplateFilters
              availableServices={availableServices}
              selectedServices={selectedServices}
              onToggleService={handleToggleService}
              replitOnly={replitOnly}
              onToggleReplitOnly={handleToggleReplitOnly}
              selectedFilterCount={selectedFilterCount}
              onClearFilters={handleClearSelectedFilters}
              hideFilterMeta
            />
          </div>

          {hasSelectedFilters && (
            <div className="flex shrink-0 items-center gap-4 border-t border-black/10 px-6 py-4">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-none border-black bg-transparent font-mono text-sm font-medium text-black uppercase hover:bg-black/5 hover:text-black"
                onClick={handleClearSelectedFilters}
              >
                Clear all
              </Button>
              <Button
                className="h-10 flex-1 rounded-none bg-[#FF5F46] font-mono text-sm font-medium text-black uppercase hover:bg-[#FF5F46]/90"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply filters ({selectedFilterCount})
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function TemplateEmptyState({
  onClearAll,
}: {
  onClearAll: () => void;
}): ReactNode {
  return (
    <div className="mx-auto flex h-full w-full max-w-77.5 flex-col items-center justify-center text-center">
      <h3 className="text-xl/normal font-normal tracking-[-0.04em] text-black">
        No templates match your filters.
      </h3>
      <p className="mt-2 text-base tracking-[-0.04em] text-black/30">
        Browse by category above, or try a different search term.
      </p>
      <Button
        className="mt-8 rounded-none font-mono text-base font-medium tracking-tight uppercase"
        variant="orange"
        size="xl"
        onClick={onClearAll}
      >
        Clear filters
      </Button>
    </div>
  );
}
