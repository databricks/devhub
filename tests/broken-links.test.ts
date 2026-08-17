import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { relative, resolve, sep } from "path";

import { describe, expect, test } from "vitest";

const NEXT_APP_DIR = resolve(__dirname, "..", ".next", "server", "app");
const PUBLIC_DIR = resolve(__dirname, "..", "public");

// Valid link targets that have no prerendered .html in the build output:
// route handlers, rewrite sources, and redirect sources from next.config.mjs.
const NON_PAGE_ROUTES = new Set([
  "/llms.txt",
  "/docs/llms.txt",
  "/docs",
  "/product/data-lakehouse",
  "/appkit",
  "/solutions/rss.xml",
  "/templates.md",
  "/solutions.md",
]);
const NON_PAGE_ROUTE_PREFIXES = ["/api/", "/raw-docs/", "/_next/"];

// JS-handled pseudo-anchors that intentionally have no element id (e.g. the
// "Your Privacy Choices" link opens the OneTrust preference center onClick).
const PSEUDO_ANCHORS = new Set(["yourprivacychoices"]);

function listFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root).flatMap((entry) => {
    const entryPath = resolve(root, entry);
    return statSync(entryPath).isDirectory() ? listFiles(entryPath) : entryPath;
  });
}

function listPageHtmlFiles(): string[] {
  return listFiles(NEXT_APP_DIR).filter((filePath) => {
    const relativePath = relative(NEXT_APP_DIR, filePath);
    return (
      relativePath.endsWith(".html") &&
      !relativePath.includes(".segments") &&
      !relativePath.startsWith("_not-found") &&
      !relativePath.startsWith("_global-error")
    );
  });
}

function htmlFileToRoute(filePath: string): string {
  const relativePath = relative(NEXT_APP_DIR, filePath)
    .split(sep)
    .join("/")
    .replace(/\.html$/, "");
  return relativePath === "index" ? "/" : `/${relativePath}`;
}

function stripScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractAnchorHrefs(html: string): string[] {
  return [...stripScripts(html).matchAll(/<a\s[^>]*?href="([^"]*)"/gi)].map(
    (match) => decodeHtmlEntities(match[1]),
  );
}

function extractElementIds(html: string): Set<string> {
  return new Set(
    [...stripScripts(html).matchAll(/\bid="([^"]*)"/g)].map((match) =>
      decodeHtmlEntities(match[1]),
    ),
  );
}

function isCheckableInternalHref(href: string): boolean {
  return (
    (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#")
  );
}

function splitHref(href: string): { pathname: string; hash: string } {
  const hashIndex = href.indexOf("#");
  const withoutHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex + 1);
  const pathname = withoutHash.split("?")[0];
  return { hash, pathname };
}

function normalizeRoute(pathname: string): string {
  if (pathname === "" || pathname === "/") {
    return "/";
  }
  return pathname.replace(/\/+$/, "");
}

// The prerendered file for a redirect-only page (e.g. /hackathon) is Next's
// empty error shell; it carries no real content or links to crawl.
function isErrorShell(html: string): boolean {
  return html.includes('<html id="__next_error__"');
}

function isNonPageRoute(route: string): boolean {
  return (
    NON_PAGE_ROUTES.has(route) ||
    NON_PAGE_ROUTE_PREFIXES.some((prefix) => route.startsWith(prefix))
  );
}

type PageLink = { hash: string; href: string; sourceRoute: string };
type Crawl = {
  idsByRoute: Map<string, Set<string>>;
  links: PageLink[];
  pageRoutes: Set<string>;
  publicPaths: Set<string>;
};

function crawlBuildOutput(): Crawl {
  const idsByRoute = new Map<string, Set<string>>();
  const links: PageLink[] = [];
  const pageRoutes = new Set<string>();

  for (const filePath of listPageHtmlFiles()) {
    const route = htmlFileToRoute(filePath);
    pageRoutes.add(route);

    const html = readFileSync(filePath, "utf-8");
    if (isErrorShell(html)) {
      continue;
    }

    idsByRoute.set(route, extractElementIds(html));

    for (const href of extractAnchorHrefs(html)) {
      if (!isCheckableInternalHref(href)) {
        continue;
      }

      links.push({
        hash: decodeURIComponent(splitHref(href).hash),
        href,
        sourceRoute: route,
      });
    }
  }

  const publicPaths = new Set(
    listFiles(PUBLIC_DIR).map(
      (filePath) => `/${relative(PUBLIC_DIR, filePath).split(sep).join("/")}`,
    ),
  );

  return { idsByRoute, links, pageRoutes, publicPaths };
}

const crawl = crawlBuildOutput();

describe("broken internal links", () => {
  test("build output exists (run `pnpm build` first)", () => {
    expect(existsSync(NEXT_APP_DIR)).toBe(true);
    expect(crawl.pageRoutes.size).toBeGreaterThan(300);
  });

  test("every internal link points at an existing page or asset", () => {
    const failures: string[] = [];

    for (const link of crawl.links) {
      const { pathname } = splitHref(link.href);
      if (pathname === "") {
        continue;
      }

      const route = normalizeRoute(pathname);
      if (
        crawl.pageRoutes.has(route) ||
        crawl.publicPaths.has(route) ||
        isNonPageRoute(route)
      ) {
        continue;
      }

      failures.push(`${link.sourceRoute} -> ${link.href}`);
    }

    expect([...new Set(failures)]).toEqual([]);
  });

  test("every anchor link points at an existing element id", () => {
    const failures: string[] = [];

    for (const link of crawl.links) {
      if (link.hash === "" || PSEUDO_ANCHORS.has(link.hash)) {
        continue;
      }

      const { pathname } = splitHref(link.href);
      const targetRoute =
        pathname === "" ? link.sourceRoute : normalizeRoute(pathname);
      const targetIds = crawl.idsByRoute.get(targetRoute);
      if (!targetIds) {
        // Pages without crawlable HTML (assets, handlers, redirects) are
        // covered by the existence test above; their fragments cannot be
        // validated statically.
        continue;
      }

      if (!targetIds.has(link.hash)) {
        failures.push(`${link.sourceRoute} -> ${link.href}`);
      }
    }

    expect([...new Set(failures)]).toEqual([]);
  });
});
