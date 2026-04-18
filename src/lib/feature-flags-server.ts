/**
 * Server-side feature flag resolution. Both flags are opt-in: the env var must
 * be exactly "true" to enable. No implicit dev/CI/NODE_ENV handling — set the
 * env var explicitly where you want the flag on (including local `npm run dev`).
 */

export function showDrafts(): boolean {
  return process.env.SHOW_DRAFTS === "true";
}

export function examplesEnabled(): boolean {
  return process.env.EXAMPLES_FEATURE === "true";
}
