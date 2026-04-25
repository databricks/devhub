import { rewrite } from "@vercel/functions";

/**
 * Content negotiation: when a client sends Accept: text/markdown or
 * Accept: text/plain, transparently rewrite to /api/markdown so it gets
 * markdown instead of HTML.
 *
 * Keep in sync with Root.tsx MD_PREFIXES and vercel.json headers/rewrites.
 * TODO: centralize content section definitions into a shared module.
 */
const SECTION_PREFIXES: Record<string, string> = {
  "/docs/": "docs",
  "/templates/": "templates",
  "/solutions/": "solutions",
};

// Sections that have an index page (e.g., /templates → /templates.md)
const BARE_SECTIONS: Record<string, string> = {
  "/templates": "templates",
  "/solutions": "solutions",
};

export default function middleware(request: Request): Response | undefined {
  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/markdown") && !accept.includes("text/plain"))
    return undefined;

  const url = new URL(request.url);
  const path = url.pathname;

  let section: string | undefined;
  let slug = "";

  for (const [prefix, sec] of Object.entries(SECTION_PREFIXES)) {
    if (path.startsWith(prefix)) {
      section = sec;
      slug = path.slice(prefix.length).replace(/\/$/, "");
      break;
    }
  }

  if (!section) {
    const bare = BARE_SECTIONS[path] ?? BARE_SECTIONS[path.replace(/\/$/, "")];
    if (bare) {
      section = bare;
      slug = "";
    }
  }

  if (!section) return undefined;

  const dest = new URL("/api/markdown", url.origin);
  dest.searchParams.set("section", section);
  dest.searchParams.set("slug", slug);

  return rewrite(dest);
}

export const config = {
  matcher: ["/docs/:path*", "/templates/:path*", "/solutions/:path*"],
};
