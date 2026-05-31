import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import {
  ArrowRight,
  ArrowUpRight,
  FilterIcon,
  TerminalIcon,
} from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ActiveFilters } from "@/components/templates/active-filters";
import type { TemplateItem } from "@/components/templates/template-card";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateFilters } from "@/components/templates/template-filters";
import { TemplateSearch } from "@/components/templates/template-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  examples,
  filterPublished,
  matchesTemplateFilter,
  recipesInOrder,
  cookbooks,
  type Service,
} from "@/lib/recipes/recipes";
import { useFeatureFlags } from "@/lib/feature-flags";

function OfficialTemplatesCallout(): ReactNode {
  return (
    <a
      href="https://github.com/databricks/app-templates"
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-10 block no-underline"
      aria-label="Browse databricks/app-templates on GitHub (opens in new tab)"
    >
      <div className="relative overflow-hidden rounded-xl border border-db-cyan/30 bg-gradient-to-br from-white via-white to-db-cyan/5 p-6 transition-colors duration-200 hover:border-db-cyan/45 dark:border-db-cyan/25 dark:from-[#102127] dark:via-[#102127] dark:to-db-cyan/10 dark:hover:border-db-cyan/40 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="min-w-0 flex-1">
            <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
              <span className="text-db-lava">&#9658;</span>
              More templates on GitHub
            </p>
            <h2 className="mb-2 text-xl leading-tight font-medium text-black dark:text-white md:text-2xl">
              Looking for Streamlit, Dash, Gradio, Shiny, Flask, or FastAPI
              starters?
            </h2>
            <p className="m-0 max-w-2xl text-sm leading-relaxed text-black/68 dark:text-white/68">
              Find more pre-built templates for Databricks Apps at{" "}
              <span className="text-black/85 dark:text-white/85">
                databricks/app-templates
              </span>
              .
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-db-navy transition-colors duration-200 group-hover:border-db-lava/50 group-hover:text-db-lava dark:border-white/10 dark:bg-white/5 dark:text-white dark:group-hover:border-db-lava-light/55 dark:group-hover:text-db-lava-light md:self-center">
            <TerminalIcon aria-hidden="true" className="size-4" />
            <span>Browse on GitHub</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </a>
  );
}

function buildTemplateItems(includeDrafts: boolean): TemplateItem[] {
  const publishedExamples = filterPublished(examples, includeDrafts);
  const publishedCookbooks = filterPublished(cookbooks, includeDrafts);
  const publishedRecipes = filterPublished(
    recipesInOrder,
    includeDrafts,
  ).filter((r) => !r.unlisted);

  const exampleItems: TemplateItem[] = publishedExamples.map((e) => ({
    kind: "example",
    data: e,
  }));
  const cookbookItems: TemplateItem[] = publishedCookbooks.map((c) => ({
    kind: "cookbook",
    data: c,
  }));
  const recipeItems: TemplateItem[] = publishedRecipes.map((r) => ({
    kind: "recipe",
    data: r,
  }));
  return [...exampleItems, ...cookbookItems, ...recipeItems];
}

export default function TemplatesPage(): ReactNode {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<Service>>(
    new Set(),
  );
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { showDrafts: includeDrafts } = useFeatureFlags();

  const ALL_ITEMS = useMemo(
    () => buildTemplateItems(includeDrafts),
    [includeDrafts],
  );

  const filteredItems = useMemo(
    () =>
      ALL_ITEMS.filter((item) =>
        matchesTemplateFilter(item.data, {
          searchQuery,
          selectedServices,
          activeTags,
        }),
      ),
    [searchQuery, selectedServices, activeTags, ALL_ITEMS],
  );

  const handleToggleService = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  }, []);

  const handleRemoveTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.delete(tag);
      return next;
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedServices(new Set());
    setActiveTags(new Set());
    setSearchQuery("");
  }, []);

  const hasActiveFilters = activeTags.size > 0 || selectedServices.size > 0;

  const filtersSidebar = (
    <TemplateFilters
      selectedServices={selectedServices}
      onToggleService={handleToggleService}
    />
  );

  return (
    <Layout
      title="Templates"
      description="Templates to jumpstart your next Databricks app"
    >
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            {/* Hero */}
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
              <span className="text-db-lava">&#9658;</span>
              Templates
            </p>
            <h1 className="mb-4 max-w-3xl text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">Templates</span> to jumpstart your
              next Databricks app.
            </h1>
            <p className="mb-3 max-w-2xl text-lg text-black/68 dark:text-white/68">
              Copy any template as a prompt for your coding agent to build for
              you.
            </p>
            <Link
              to="/docs/templates"
              className="group mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-black/60 underline decoration-db-lava decoration-2 underline-offset-4 transition-colors hover:text-db-lava dark:text-white/60 dark:decoration-db-lava-light dark:hover:text-db-lava-light"
            >
              New to templates? Learn more here
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            {/* Toolbar: search + actions */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(true)}
                className="gap-1.5 md:hidden"
              >
                <FilterIcon className="size-3.5" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-0.5 size-5 justify-center rounded-full p-0 text-[10px]">
                    {selectedServices.size + activeTags.size}
                  </Badge>
                )}
              </Button>
              <div className="flex-1">
                <TemplateSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="mb-4">
                <ActiveFilters
                  activeTags={activeTags}
                  onRemoveTag={handleRemoveTag}
                  selectedServices={selectedServices}
                  onRemoveService={handleToggleService}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}

            {/* Main layout: sidebar + grid */}
            <div className="flex gap-8">
              {/* Sidebar (desktop) */}
              <aside className="hidden w-52 shrink-0 md:block">
                <div className="templates-filter-surface sticky top-24 rounded-xl border border-black/8 bg-white/60 p-4">
                  {filtersSidebar}
                </div>
              </aside>

              {/* Grid */}
              <div className="min-w-0 flex-1">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/15 py-20 dark:border-white/15">
                    <p className="mb-2 text-lg font-medium text-black/50 dark:text-white/50">
                      No results found
                    </p>
                    <p className="mb-4 text-sm text-black/40 dark:text-white/40">
                      Try adjusting your search or filters.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllFilters}
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {filteredItems.map((item, index) => (
                      <TemplateCard
                        key={item.data.id}
                        item={item}
                        index={index}
                      />
                    ))}
                  </div>
                )}
                <p className="mt-6 text-center text-xs text-black/40 dark:text-white/40">
                  {filteredItems.length} of {ALL_ITEMS.length} templates
                </p>
                <OfficialTemplatesCallout />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[80vh] overflow-y-auto p-6"
        >
          <SheetHeader className="p-0 pb-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          {filtersSidebar}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
