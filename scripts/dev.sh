#!/usr/bin/env bash
# Loads .env.local into the process environment before launching `vercel dev`
# so env-driven feature flags (EXAMPLES_FEATURE, SHOW_DRAFTS, ...) reach the
# docusaurus dev command as well as Vercel Functions.
#
# Vercel's own .env.local loading only applies to Functions; the devCommand
# subprocess inherits the parent shell env, so we source it here.

set -e

ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# Sync AppKit docs if not already present
node scripts/sync-appkit-docs.mjs

exec vercel dev "$@"
