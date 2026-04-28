/**
 * Resolves the canonical site URL ("origin") used to construct absolute links
 * across the build (llms.txt), the API functions (markdown / bootstrap-prompt /
 * MCP), and any static metadata (sitemap, robots, JSON-LD).
 *
 * Resolution order:
 *   1. SITE_URL — explicit override; honored everywhere.
 *   2. VERCEL_ENV=production + VERCEL_PROJECT_PRODUCTION_URL — the production
 *      domain configured in Vercel (preferred over VERCEL_URL because the latter
 *      is a per-deployment immutable URL even on production).
 *   3. VERCEL_URL — preview / branch deployment URL.
 *   4. PRODUCTION_FALLBACK_SITE_URL — safe default so that anything we ship
 *      (e.g. social cards, llms.txt fetched offline) stays on the prod domain.
 *
 * Always returns an https/http origin without trailing slash.
 */

export const PRODUCTION_FALLBACK_SITE_URL = "https://dev.databricks.com";

type Env = Record<string, string | undefined>;

function withProtocol(host: string): string {
  if (/^https?:\/\//i.test(host)) return host;
  // localhost / 127.0.0.1 should use http, everything else uses https.
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return `http://${host}`;
  }
  return `https://${host}`;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Pure resolver — easy to unit-test with synthetic envs. */
export function resolveSiteUrl(env: Env = process.env): string {
  if (env.SITE_URL && env.SITE_URL.trim() !== "") {
    return stripTrailingSlash(withProtocol(env.SITE_URL.trim()));
  }
  if (
    env.VERCEL_ENV === "production" &&
    env.VERCEL_PROJECT_PRODUCTION_URL &&
    env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== ""
  ) {
    return stripTrailingSlash(
      withProtocol(env.VERCEL_PROJECT_PRODUCTION_URL.trim()),
    );
  }
  if (env.VERCEL_URL && env.VERCEL_URL.trim() !== "") {
    return stripTrailingSlash(withProtocol(env.VERCEL_URL.trim()));
  }
  return PRODUCTION_FALLBACK_SITE_URL;
}

/**
 * Resolves the site origin for a request handler. Prefers the request's own
 * Host header (so requests to `dev-databricks.vercel.app` link back to that
 * host instead of bouncing to the canonical SITE_URL), and falls back to the
 * statically resolved site URL when no header is available.
 */
export function resolveSiteUrlForRequest(
  host: string | undefined,
  env: Env = process.env,
): string {
  if (host && host.trim() !== "") {
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return stripTrailingSlash(`${protocol}://${host.trim()}`);
  }
  return resolveSiteUrl(env);
}

/** Returns just the hostname (no scheme, no trailing slash) for cases that need it. */
export function siteHost(env: Env = process.env): string {
  return resolveSiteUrl(env).replace(/^https?:\/\//, "");
}
