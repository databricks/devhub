import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { FilterIcon } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AIExportMenu } from "@/components/ai-export-menu";
import { ActiveFilters } from "@/components/resources/active-filters";
import type { ResourceItem } from "@/components/resources/resource-card";
import { ResourceCard } from "@/components/resources/resource-card";
import {
  ResourceFilters,
  type ResourceType,
} from "@/components/resources/resource-filters";
import { ResourceSearch } from "@/components/resources/resource-search";
import { SelectedItems } from "@/components/resources/selected-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  examples,
  recipesInOrder,
  templates,
  type Service,
} from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";

function buildResourceItems(): ResourceItem[] {
  const exampleItems: ResourceItem[] = examples.map((e) => ({
    kind: "example",
    data: e,
  }));
  const templateItems: ResourceItem[] = templates.map((t) => ({
    kind: "template",
    data: t,
  }));
  const recipeItems: ResourceItem[] = recipesInOrder.map((r) => ({
    kind: "recipe",
    data: r,
  }));
  return [...exampleItems, ...templateItems, ...recipeItems];
}

const ALL_ITEMS = buildResourceItems();

export default function ResourcesPage(): ReactNode {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<Service>>(
    new Set(),
  );
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<
    Set<ResourceType>
  >(new Set());
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const rawBySlug = useAllRawRecipeMarkdown();

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return ALL_ITEMS.filter((item) => {
      if (selectedResourceTypes.size > 0 && selectedResourceTypes.size < 2) {
        const isExample = item.kind === "example";
        if (selectedResourceTypes.has("examples") && !isExample) return false;
        if (selectedResourceTypes.has("guides") && isExample) return false;
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
  }, [searchQuery, selectedServices, selectedResourceTypes, activeTags]);

  const selectedItems = useMemo(
    () => ALL_ITEMS.filter((item) => selectedIds.has(item.data.id)),
    [selectedIds],
  );

  const selectedRawMarkdown = useMemo(() => {
    const recipeItems = selectedItems.filter((i) => i.kind === "recipe");
    return recipeItems
      .map((r) => rawBySlug[r.data.id])
      .filter(Boolean)
      .join("\n\n---\n\n");
  }, [selectedItems, rawBySlug]);

  const selectableFiltered = filteredItems.filter(
    (item) => item.kind !== "example",
  );
  const isAllFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((item) => selectedIds.has(item.data.id));
  const isSomeFilteredSelected =
    !isAllFilteredSelected &&
    selectableFiltered.some((item) => selectedIds.has(item.data.id));

  const handleToggleAll = useCallback(() => {
    if (isAllFilteredSelected) {
      const filteredSet = new Set(selectableFiltered.map((i) => i.data.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of filteredSet) next.delete(id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const item of selectableFiltered) next.add(item.data.id);
        return next;
      });
    }
  }, [isAllFilteredSelected, selectableFiltered]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleRemoveSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggleService = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  }, []);

  const handleToggleResourceType = useCallback((type: ResourceType) => {
    setSelectedResourceTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
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
    setSelectedResourceTypes(new Set());
    setActiveTags(new Set());
    setSearchQuery("");
  }, []);

  const hasActiveFilters =
    activeTags.size > 0 ||
    selectedServices.size > 0 ||
    selectedResourceTypes.size > 0;

  const filtersSidebar = (
    <ResourceFilters
      selectedServices={selectedServices}
      onToggleService={handleToggleService}
      selectedResourceTypes={selectedResourceTypes}
      onToggleResourceType={handleToggleResourceType}
    />
  );

  return (
    <Layout
      title="Resources"
      description="Guides and examples for building on Databricks"
    >
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            {/* Hero */}
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
              <span className="text-db-lava">&#9658;</span>
              Resources
            </p>
            <h1 className="mb-4 max-w-3xl text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">Examples &amp; Guides</span> for
              building on Databricks.
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-black/68 dark:text-white/68">
              Step-by-step guides to copy into your coding agent. Explore
              end-to-end examples as reference implementations.
            </p>

            {/* Toolbar: search + actions */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <ResourceSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex items-center gap-3">
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
                        selectedResourceTypes.size +
                        activeTags.size}
                    </Badge>
                  )}
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-black/78 dark:text-white/78">
                  <Checkbox
                    checked={
                      isAllFilteredSelected
                        ? true
                        : isSomeFilteredSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={handleToggleAll}
                    aria-label="Select all"
                  />
                  Select all
                </label>
                <AIExportMenu
                  rawMarkdown={selectedRawMarkdown}
                  title="Custom guide"
                  description="Selected Databricks guides combined into a single export."
                  permalink="/resources"
                  disabled={selectedItems.length === 0}
                />
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
                  selectedResourceTypes={selectedResourceTypes}
                  onRemoveResourceType={handleToggleResourceType}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}

            {/* Selected items */}
            {selectedItems.length > 0 && (
              <div className="mb-4">
                <SelectedItems
                  items={selectedItems}
                  onRemove={handleRemoveSelected}
                />
              </div>
            )}

            {/* Main layout: sidebar + grid */}
            <div className="flex gap-8">
              {/* Sidebar (desktop) */}
              <aside className="hidden w-52 shrink-0 md:block">
                <div className="sticky top-24 rounded-xl border border-black/8 bg-white/60 p-4 dark:border-white/12 dark:bg-[#15232c]">
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
                      <ResourceCard
                        key={item.data.id}
                        item={item}
                        index={index}
                        selected={selectedIds.has(item.data.id)}
                        onToggleSelect={() => handleToggleSelect(item.data.id)}
                        onTagClick={handleTagClick}
                      />
                    ))}
                  </div>
                )}
                <p className="mt-6 text-center text-xs text-black/40 dark:text-white/40">
                  {filteredItems.length} of {ALL_ITEMS.length} resources
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
