/**
 * OneTrust cookie consent environment resolution.
 *
 * Two variants of the standard Databricks OneTrust install exist:
 *   - "test": works on any domain — Vercel previews and local testing.
 *   - "production": only works on *.databricks.com domains.
 *
 * Resolution order:
 *   1. ONETRUST_ENV — explicit override, e.g. `ONETRUST_ENV=test pnpm dev`
 *      to see the banner locally.
 *   2. VERCEL_ENV=production — production variant.
 *   3. VERCEL_ENV=preview|development — test variant.
 *   4. otherwise (local dev/build) — null: no tags, no banner, and GTM must
 *      not load either (the AutoBlocker gates GTM's cookies).
 */

export const ONETRUST_DOMAIN_SCRIPT_ID = "92466579-1717-44d3-809d-a05fb02843ed";
export const GTM_CONTAINER_ID = "GTM-TWTKQQ";

type Env = Record<string, string | undefined>;

export type OneTrustEnv = "production" | "test";

export function resolveOneTrustEnv(env: Env = process.env): OneTrustEnv | null {
  if (env.ONETRUST_ENV === "production" || env.ONETRUST_ENV === "test") {
    return env.ONETRUST_ENV;
  }
  if (env.VERCEL_ENV === "production") return "production";
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") {
    return "test";
  }
  return null;
}

/**
 * The Rudderstack write key, or null when Rudderstack must not load.
 *
 * Production-only by default: every preview deployment would otherwise send
 * events into the same Rudderstack source as production, polluting the campaign
 * attribution this exists to measure, and Databricks is billed per API call
 * even from staging. Set RUDDERSTACK_ENABLED=true on a single deployment (or
 * locally alongside ONETRUST_ENV) to verify the full stack before a launch.
 *
 * Returns null whenever OneTrust itself is off — Rudderstack is gated by
 * OneTrust consent, so it must never load without it.
 */
export function resolveRudderstackKey(env: Env = process.env): string | null {
  if (!resolveOneTrustEnv(env)) return null;
  const key = env.RUDDERSTACK_WRITE_KEY;
  if (!key) return null;
  if (env.RUDDERSTACK_ENABLED === "true") return key;
  return env.VERCEL_ENV === "production" ? key : null;
}
