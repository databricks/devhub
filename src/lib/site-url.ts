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
 * Always returns an https/http URL without trailing slash. If SITE_URL includes
 * a path (for example https://stage.databricks.com/devhub), the path is kept so
 * the same build can be configured for either root or subpath deployments.
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

function normalizeSiteUrl(siteUrl: string): string {
  const url = new URL(withProtocol(siteUrl.trim()));
  const pathname = stripTrailingSlash(url.pathname);
  return pathname === "" ? url.origin : `${url.origin}${pathname}`;
}

function normalizeBaseUrlPath(pathname: string): string {
  const withoutTrailingSlash = stripTrailingSlash(pathname);
  if (withoutTrailingSlash === "") return "/";
  return `${withoutTrailingSlash}/`;
}

/** Pure resolver — easy to unit-test with synthetic envs. */
export function resolveSiteUrl(env: Env = process.env): string {
  if (env.SITE_URL && env.SITE_URL.trim() !== "") {
    return normalizeSiteUrl(env.SITE_URL);
  }
  if (
    env.VERCEL_ENV === "production" &&
    env.VERCEL_PROJECT_PRODUCTION_URL &&
    env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== ""
  ) {
    return normalizeSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL);
  }
  if (env.VERCEL_URL && env.VERCEL_URL.trim() !== "") {
    return normalizeSiteUrl(env.VERCEL_URL);
  }
  return PRODUCTION_FALLBACK_SITE_URL;
}

export function resolveSiteOrigin(env: Env = process.env): string {
  return new URL(resolveSiteUrl(env)).origin;
}

export function resolveSiteBaseUrl(env: Env = process.env): string {
  return siteBaseUrlFromSiteUrl(resolveSiteUrl(env));
}

function siteBaseUrlFromSiteUrl(siteUrl: string): string {
  return normalizeBaseUrlPath(new URL(withProtocol(siteUrl)).pathname);
}

export function siteUrlFromConfig(url: string, baseUrl: string): string {
  const origin = normalizeSiteUrl(url);
  const normalizedBaseUrl = normalizeBaseUrlPath(baseUrl);
  const basePath = stripTrailingSlash(normalizedBaseUrl);
  return basePath === "" ? origin : `${origin}${basePath}`;
}

/**
 * Resolves the public site URL for a request handler. SITE_URL is canonical
 * when configured, because upstream rewrites can reach Vercel with the
 * deployment host instead of the public databricks.com host.
 */
export function resolveSiteUrlForRequest(
  host: string | undefined,
  env: Env = process.env,
): string {
  if (env.SITE_URL && env.SITE_URL.trim() !== "") {
    return resolveSiteUrl(env);
  }

  if (host && host.trim() !== "") {
    const protocol = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host.trim())
      ? "http"
      : "https";
    return siteUrlFromConfig(
      `${protocol}://${host.trim()}`,
      resolveSiteBaseUrl(env),
    );
  }
  return resolveSiteUrl(env);
}

/** Returns just the hostname (no scheme, no trailing slash) for cases that need it. */
export function siteHost(env: Env = process.env): string {
  return new URL(resolveSiteUrl(env)).host;
}
