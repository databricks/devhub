/**
 * Server-side resolution of the site-wide hackathon banner.
 *
 * Activation precedence (mirrors the `showDrafts` env pattern — strict string
 * matching, no implicit dev/CI handling):
 *
 *   1. `HACKATHON_BANNER_ENABLED="true"`  → force on, ignore dates
 *   2. `HACKATHON_BANNER_ENABLED="false"` → force off, ignore dates
 *   3. otherwise → on iff `now` is between `HACKATHON_START` 00:00 UTC and
 *      `HACKATHON_END` 23:59:59.999 UTC (both required, both ISO `YYYY-MM-DD`,
 *      and `start <= end`).
 *
 * Optional `HACKATHON_BANNER_TEXT` overrides the banner copy so messaging can
 * change without a code edit.
 *
 * The resolver is a pure function so it can be unit-tested with synthetic
 * envs and a fixed `now`. The config builder is the thin imperative shell
 * consumed by `docusaurus.config.ts` at build time.
 */

export type HackathonBannerEnv = {
  HACKATHON_BANNER_ENABLED?: string;
  HACKATHON_START?: string;
  HACKATHON_END?: string;
  HACKATHON_BANNER_TEXT?: string;
};

type HackathonBannerConfig = {
  id: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  isCloseable: boolean;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseStartOfDayUtc(value: string | undefined): number | null {
  if (!value || !ISO_DATE.test(value)) return null;
  const ms = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(ms) ? null : ms;
}

function parseEndOfDayUtc(value: string | undefined): number | null {
  if (!value || !ISO_DATE.test(value)) return null;
  const ms = Date.parse(`${value}T23:59:59.999Z`);
  return Number.isNaN(ms) ? null : ms;
}

export function resolveHackathonBannerActive(
  env: HackathonBannerEnv,
  now: Date,
): boolean {
  if (env.HACKATHON_BANNER_ENABLED === "true") return true;
  if (env.HACKATHON_BANNER_ENABLED === "false") return false;

  const start = parseStartOfDayUtc(env.HACKATHON_START);
  const end = parseEndOfDayUtc(env.HACKATHON_END);
  if (start === null || end === null) return false;
  if (start > end) return false;

  const nowMs = now.getTime();
  return nowMs >= start && nowMs <= end;
}

const DEFAULT_BANNER_LEAD_TEXT = "Databricks Developer Hackathon is live.";
const BANNER_LINK_HTML = '<a href="/hackathon"><b>See resources &rarr;</b></a>';

export function getHackathonBannerConfig(
  env: HackathonBannerEnv = process.env as HackathonBannerEnv,
  now: Date = new Date(),
): HackathonBannerConfig | undefined {
  if (!resolveHackathonBannerActive(env, now)) return undefined;
  const leadText = (
    env.HACKATHON_BANNER_TEXT ?? DEFAULT_BANNER_LEAD_TEXT
  ).trim();
  return {
    // Non-dismissible by design: the banner is the only on-site entry point to
    // /hackathon during the event window, so we don't want visitors to close
    // it and lose the way in. `id` is retained for future per-event resets if
    // we re-enable dismissals.
    id: "hackathon-2026",
    // HACKATHON_BANNER_TEXT overrides only the lead-in copy; the "See
    // resources" link is always appended so visitors can never end up on a
    // banner with no way to reach /hackathon.
    content: `${leadText} ${BANNER_LINK_HTML}`,
    backgroundColor: "var(--db-lava)",
    textColor: "#ffffff",
    isCloseable: false,
  };
}
