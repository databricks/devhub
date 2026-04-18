export function showDrafts(): boolean {
  const value = process.env.SHOW_DRAFTS;
  return value === "true" || value === "1";
}

/**
 * Examples are off in production builds unless EXAMPLES_FEATURE is set.
 * Locally, `npm run start` enables them without env vars (see npm_lifecycle_event / NODE_ENV).
 */
export function examplesEnabled(): boolean {
  const raw = process.env.EXAMPLES_FEATURE;
  if (raw === "false" || raw === "0") return false;
  if (raw === "true" || raw === "1") return true;
  if (process.env.CI === "true" || process.env.CI === "1") return false;
  return (
    process.env.NODE_ENV === "development" ||
    process.env.npm_lifecycle_event === "start"
  );
}
