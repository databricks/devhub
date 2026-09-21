import type { PersonKind } from "@/lib/community/schema";

export const DIRECTORY_PAGE_SIZE = 20;

export function directoryTitle(kind: PersonKind, page = 1) {
  const title =
    kind === "mvp" ? "Meet the Databricks MVPs" : "Meet the Student Fellows";
  return `${title}${page > 1 ? ` — Page ${page}` : ""}`;
}

export type DirectorySearchParams = Record<
  string,
  string | string[] | undefined
>;

export function directoryPageNumber(value = "1") {
  return /^[1-9]\d{0,5}$/.test(value) && Number(value) <= 100000
    ? Number(value)
    : null;
}

export function readDirectoryQuery(
  params: DirectorySearchParams,
  kind: PersonKind,
  pathname?: string,
) {
  const value = (key: string, limit: number) => {
    const entry = params[key];
    return (
      (Array.isArray(entry) ? entry[0] : entry)?.slice(0, limit) || undefined
    );
  };
  const values = (key: string) => {
    const entry = params[key];
    return [
      ...new Set(
        (Array.isArray(entry) ? entry : [entry])
          .flatMap((item) =>
            key === "country" ? item?.split(",") || [] : [item],
          )
          .map((item) =>
            item?.trim().slice(0, key === "university" ? 300 : 100),
          )
          .filter((item): item is string => Boolean(item)),
      ),
    ];
  };
  const pathPage = pathname?.match(/\/page\/([^/]+)$/)?.[1];
  const requestedPage = pathPage
    ? directoryPageNumber(pathPage) || 0
    : Number(value("page", 12));
  return {
    kind,
    q: value("q", 200),
    city: values("city"),
    country: values("country"),
    university: kind === "student" ? values("university") : [],
    page:
      Number.isSafeInteger(requestedPage) &&
      requestedPage > 0 &&
      requestedPage <= 100000
        ? requestedPage
        : 1,
    pageSize: DIRECTORY_PAGE_SIZE,
  };
}

export function directoryHref(
  kind: PersonKind,
  params: DirectorySearchParams,
  page = 1,
) {
  const query = readDirectoryQuery(params, kind);
  const search = new URLSearchParams();
  if (query.q) search.set("q", query.q);
  for (const city of query.city) search.append("city", city);
  for (const university of query.university)
    search.append("university", university);
  const parts = [search.toString()];
  if (query.country.length)
    parts.push(`country=${query.country.map(encodeURIComponent).join(",")}`);
  const queryString = parts.filter(Boolean).join("&");
  const base = kind === "mvp" ? "/mvps/directory" : "/student-fellows/fellows";
  const route = page > 1 ? `${base}/page/${page}` : base;
  return queryString ? `${route}?${queryString}` : route;
}
