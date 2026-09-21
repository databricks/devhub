"use client";

import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type MouseEvent,
} from "react";

import {
  filterDirectory,
  type DirectoryPerson,
} from "@/lib/community/directory";
import {
  directoryHref,
  directoryTitle,
  readDirectoryQuery,
  type DirectorySearchParams,
} from "@/lib/community/directory-query";
import type { PersonKind } from "@/lib/community/schema";
import { getPageTitle } from "@/lib/get-metadata";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DirectoryFilters } from "@/components/community/directory-filters";
import { PersonCard } from "@/components/community/person-card";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("community-directory-change", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("community-directory-change", onChange);
  };
}

function getLocation() {
  return window.location.pathname + window.location.search;
}

function navigate(href: string, replace = false) {
  if (window.location.pathname + window.location.search === href) return false;
  window.history[replace ? "replaceState" : "pushState"](
    null,
    "",
    href + window.location.hash,
  );
  window.dispatchEvent(new Event("community-directory-change"));
  return true;
}

function navigateLink(event: MouseEvent<HTMLElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = (event.target as HTMLElement).closest("a");
  if (!link) return;
  event.preventDefault();
  if (navigate(link.pathname + link.search)) {
    const directory = event.currentTarget.closest("section");
    directory?.scrollIntoView({ behavior: "instant", block: "start" });
    directory?.focus({ preventScroll: true });
  }
}

function DirectoryPagination({
  kind,
  params,
  page,
  totalPages,
}: {
  kind: PersonKind;
  params: DirectorySearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages < 2) return null;
  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((n) => n > 0 && n <= totalPages)
    .sort((a, b) => a - b);
  const linkClass =
    "rounded-none text-black hover:bg-black/5 hover:text-black dark:hover:bg-black/5";
  return (
    <Pagination
      className="mt-12 md:mt-22"
      aria-label="Directory pages"
      onClick={navigateLink}
    >
      <PaginationContent className="relative w-full justify-center gap-0 px-8 sm:w-auto sm:gap-3 sm:px-0">
        {page > 1 ? (
          <PaginationItem className="absolute -left-2 sm:static">
            <PaginationPrevious
              href={directoryHref(kind, params, page - 1)}
              className={cn(
                linkClass,
                "text-grey-50 hover:bg-transparent dark:hover:bg-transparent",
              )}
            />
          </PaginationItem>
        ) : null}
        {pages.map((number, index) => (
          <PaginationItem
            key={number}
            className="flex shrink-0 items-center gap-0.5 sm:gap-3"
          >
            {index > 0 && number - pages[index - 1] > 1 ? (
              <PaginationEllipsis className="size-6 sm:size-9" />
            ) : null}
            <PaginationLink
              href={directoryHref(kind, params, number)}
              isActive={page === number}
              aria-label={`Page ${number}`}
              className={cn(
                linkClass,
                "max-[360px]:size-8",
                page === number &&
                  "bg-orange hover:bg-orange dark:bg-orange dark:hover:bg-orange border-0 text-white shadow-none hover:text-white",
              )}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < totalPages ? (
          <PaginationItem className="absolute -right-2 sm:static">
            <PaginationNext
              href={directoryHref(kind, params, page + 1)}
              className={cn(
                linkClass,
                "text-grey-50 size-8 shrink-0 p-0 hover:bg-transparent sm:h-9 sm:w-auto sm:px-2.5 dark:hover:bg-transparent",
              )}
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}

export function DirectoryResults({
  kind,
  members,
  initialPage = 1,
}: {
  kind: PersonKind;
  members: DirectoryPerson[];
  initialPage?: number;
}) {
  const location = useSyncExternalStore(subscribe, getLocation, () =>
    directoryHref(kind, {}, initialPage),
  );
  const [pathname, search = ""] = location.split("?");
  const urlParams = new URLSearchParams(search);
  const params: DirectorySearchParams = Object.fromEntries(
    [...urlParams.keys()].map((key) => [key, urlParams.getAll(key)]),
  );
  const query = readDirectoryQuery(params, kind, pathname);
  const people = filterDirectory(members, query);
  useEffect(() => {
    const title = getPageTitle(directoryTitle(kind, query.page));
    document.title = title;
    for (const selector of [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ]) {
      document.querySelector(selector)?.setAttribute("content", title);
    }
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) {
      canonical.href = new URL(
        directoryHref(kind, {}, query.page),
        canonical.href,
      ).href;
      document
        .querySelector('meta[property="og:url"]')
        ?.setAttribute("content", canonical.href);
    }
  }, [kind, query.page]);
  const facets = useMemo(
    () => ({
      countries: [
        ...new Set(members.map((person) => person.country).filter(Boolean)),
      ].sort(),
      cities: [
        ...new Set(members.map((person) => person.city).filter(Boolean)),
      ].sort(),
      universities: [
        ...new Set(
          members.map((person) => person.organization).filter(Boolean),
        ),
      ].sort(),
    }),
    [members],
  );
  return (
    <section
      aria-label={
        kind === "student" ? "Student fellows directory" : "MVP directory"
      }
      tabIndex={-1}
      className="mx-auto max-w-7xl scroll-mt-16 px-5 pt-16 outline-none md:px-8 lg:pt-22"
    >
      <DirectoryFilters
        kind={kind}
        params={params}
        facets={facets}
        onChange={(next, replace) =>
          navigate(directoryHref(kind, next), replace)
        }
      />
      <p className="sr-only" role="status" aria-label="Directory results">
        {people.total} {kind === "student" ? "student fellows" : "MVPs"}
        {query.q ? ` matching “${query.q}”` : ""}
      </p>
      {people.items.length ? (
        <div className="mt-15 grid grid-cols-1 gap-x-8 gap-y-14 min-[480px]:grid-cols-2 lg:grid-cols-4 xl:gap-x-16 xl:gap-y-16">
          {people.items.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <h2 className="text-2xl">No matches found</h2>
          <p className="text-grey-40 mt-3">
            Try another search or clear your filters.
          </p>
          <Button
            asChild
            variant="orange"
            size="xl"
            className="mt-6 font-mono uppercase"
          >
            <a href={directoryHref(kind, {})} onClick={navigateLink}>
              Clear filters
            </a>
          </Button>
        </div>
      )}
      <DirectoryPagination
        kind={kind}
        params={params}
        page={people.page}
        totalPages={people.totalPages}
      />
    </section>
  );
}
