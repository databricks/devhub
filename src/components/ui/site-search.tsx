"use client";

import { useMemo } from "react";
import type { SVGProps } from "react";
import { Rocket } from "lucide-react";

import { cookbooks, examples, recipesInOrder } from "@/lib/recipes/recipes";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import {
  groupSearchDialogItems,
  SearchDialogContent,
  SearchDialogTriggerButton,
  useSearchDialogState,
  type SearchDialogItem,
} from "@/components/ui/dialog-search";

export type SiteSearchItem = Omit<SearchDialogItem, "icon"> & {
  icon: "docs" | "templates";
};

function SearchDocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      overflow="visible"
      preserveAspectRatio="none"
      viewBox="0 0 14.14 16.14"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.14"
        d="M13.57.57h-13v15h13zM3.57 3.57h7M3.57 6.57h7M3.57 9.57h7M3.57 12.57h3"
      />
    </svg>
  );
}

const SEARCH_ICONS: Record<SiteSearchItem["icon"], SearchDialogItem["icon"]> = {
  docs: SearchDocumentIcon,
  templates: Rocket,
};

const DOC_ITEMS: SiteSearchItem[] = [
  {
    id: "docs-start-here",
    title: "Start here",
    description: "Orientation for building enterprise apps on Databricks.",
    href: "/docs/start-here",
    group: "Docs",
    icon: "docs",
    keywords: ["docs", "start", "getting started", "devhub"],
  },
  {
    id: "docs-templates",
    title: "Templates",
    description: "How DevHub templates help scaffold Databricks apps.",
    href: "/docs/templates",
    group: "Docs",
    icon: "docs",
    keywords: ["docs", "templates", "recipes", "examples"],
  },
  {
    id: "docs-cli",
    title: "Databricks CLI",
    description: "Install, authenticate, and use the Databricks CLI.",
    href: "/docs/tools/databricks-cli",
    group: "Docs",
    icon: "docs",
    keywords: ["cli", "auth", "setup"],
  },
];

function buildSearchItems(): SiteSearchItem[] {
  const templateItems = [...cookbooks, ...recipesInOrder, ...examples].map(
    (item) => ({
      id: `template-${item.id}`,
      title: item.name,
      description: item.description,
      href: `/templates/${item.id}`,
      group: "Templates",
      icon: "templates" as const,
      keywords: [...item.tags, ...item.services],
    }),
  );

  return [...DOC_ITEMS, ...templateItems];
}

function toSearchDialogItem(item: SiteSearchItem): SearchDialogItem {
  return {
    ...item,
    icon: SEARCH_ICONS[item.icon],
  };
}

function matchesQuery(item: SearchDialogItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [item.title, item.description, item.group, ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export function SiteSearch({
  className,
  iconClassName,
  triggerClassName,
  triggerKbdClassName,
  items,
  previewLimit = 30,
  suggestedHeading = "Suggested",
  title = "Search DevHub",
}: {
  className?: string;
  iconClassName?: string;
  items?: readonly SiteSearchItem[];
  previewLimit?: number;
  suggestedHeading?: string;
  title?: string;
  triggerClassName?: string;
  triggerKbdClassName?: string;
}) {
  const { open, query, setQuery, handleOpenChange } = useSearchDialogState();
  const allItems = useMemo(
    () => (items ?? buildSearchItems()).map(toSearchDialogItem),
    [items],
  );
  const hasQuery = query.trim().length > 0;
  const resultGroups = useMemo(
    () =>
      groupSearchDialogItems(
        allItems
          .filter((item) => matchesQuery(item, query))
          .slice(0, hasQuery ? undefined : previewLimit),
      ),
    [allItems, hasQuery, previewLimit, query],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <SearchDialogTriggerButton
        ariaLabel="Search documentation"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "border-grey-60 text-grey-60 hover:text-grey-80 focus-visible:border-db-cyan h-9 w-45 justify-start rounded-none border bg-transparent px-3 text-[0.8125rem] leading-none font-normal tracking-tight shadow-none hover:bg-white/5 focus-visible:ring-0 lg:has-[>kbd]:!pr-1.5",
          triggerClassName,
          className,
        )}
        iconClassName={cn("text-grey-60", iconClassName)}
        kbdClassName={cn(
          "h-5.5 min-w-0 rounded-none border border-grey-40 bg-transparent px-1.5 py-1 text-sm leading-none font-normal tracking-normal text-grey-60 shadow-none",
          triggerKbdClassName,
        )}
        onClick={() => handleOpenChange(true)}
        placeholder="Search..."
      />
      <SearchDialogContent
        emptyText="No results found."
        onOpenChange={handleOpenChange}
        onQueryChange={setQuery}
        onSelect={(item) => {
          handleOpenChange(false);
          if (item.external) {
            window.open(item.href, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = item.href;
          }
        }}
        query={query}
        resultGroups={resultGroups}
        resultsHeading="Search results"
        showDescription={hasQuery}
        suggestedHeading={suggestedHeading}
        title={title}
      />
    </Dialog>
  );
}
