import Layout from "@theme/Layout";
import { FilterIcon } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ActiveFilters } from "@/components/templates/active-filters";
import type { TemplateItem } from "@/components/templates/template-card";
import { TemplateCard } from "@/components/templates/template-card";
import {
  TemplateFilters,
  type TemplateType,
} from "@/components/templates/template-filters";
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
  recipesInOrder,
  cookbooks,
  type Service,
} from "@/lib/recipes/recipes";
import { useFeatureFlags } from "@/lib/feature-flags";

function buildTemplateItems(
  includeDrafts: boolean,
  includeExamples: boolean,
): TemplateItem[] {
  const publishedExamples = includeExamples
    ? filterPublished(examples, includeDrafts)
    : [];
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
  const [selectedTemplateTypes, setSelectedTemplateTypes] = useState<
    Set<TemplateType>
  >(new Set());
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { showDrafts: includeDrafts, examplesEnabled: includeExamples } =
    useFeatureFlags();

  const ALL_ITEMS = useMemo(
    () => buildTemplateItems(includeDrafts, includeExamples),
    [includeDrafts, includeExamples],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return ALL_ITEMS.filter((item) => {
      if (selectedTemplateTypes.size > 0 && selectedTemplateTypes.size < 2) {
        const isExample = item.kind === "example";
        if (selectedTemplateTypes.has("examples") && !isExample) return false;
        if (selectedTemplateTypes.has("cookbooks") && isExample) return false;
      }

      if (selectedServices.size > 0) {
        const itemServices = item.data.services;
        if (!itemServices.some((s) => selectedServices.has(s))) return false;
      }

      if (activeTags.size > 0) {
        if (!item.data.tags.some((t) => activeTags.has(t))) return false;
      }

      if (query) {
        const name = item.data.name.toLowerCase();
        const desc = item.data.description.toLowerCase();
        if (!name.includes(query) && !desc.includes(query)) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedServices,
    selectedTemplateTypes,
    activeTags,
    ALL_ITEMS,
  ]);

  const handleToggleService = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  }, []);

  const handleToggleTemplateType = useCallback((type: TemplateType) => {
    setSelectedTemplateTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
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
    setSelectedTemplateTypes(new Set());
    setActiveTags(new Set());
    setSearchQuery("");
  }, []);

  const hasActiveFilters =
    activeTags.size > 0 ||
    selectedServices.size > 0 ||
    selectedTemplateTypes.size > 0;

  const filtersSidebar = (
    <TemplateFilters
      selectedServices={selectedServices}
      onToggleService={handleToggleService}
      selectedTemplateTypes={selectedTemplateTypes}
      onToggleTemplateType={handleToggleTemplateType}
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
            <p className="mb-10 max-w-2xl text-lg text-black/68 dark:text-white/68">
              Use each template step by step, or copy it as a prompt for your
              coding agent to build for you.
            </p>

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
                    {selectedServices.size +
                      selectedTemplateTypes.size +
                      activeTags.size}
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
                  selectedTemplateTypes={selectedTemplateTypes}
                  onRemoveTemplateType={handleToggleTemplateType}
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
