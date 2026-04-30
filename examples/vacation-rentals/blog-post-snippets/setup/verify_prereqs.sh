#!/usr/bin/env bash
# Verify prerequisites for the wanderbricks-ops AppKit walkthrough.
#
# Runs best-effort checks against your local tools and Databricks workspace,
# then prints a checklist. "Can I create X?" permissions can't be probed via
# the CLI -- if a later step fails on create (warehouse, Genie space, app
# deploy), see the troubleshooting section in the blog post.
#
# Usage: bash setup/verify_prereqs.sh

# Intentionally not -e: we want to keep checking after individual failures.
set -uo pipefail

OK="[OK]  "
FAIL="[FAIL]"
WARN="[WARN]"

failures=0
warnings=0

check() {
  local label="$1"
  local cmd="$2"
  local fix="$3"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "  ${OK} ${label}"
  else
    echo "  ${FAIL} ${label}"
    echo "         -> ${fix}"
    failures=$((failures + 1))
  fi
}

soft_check() {
  local label="$1"
  local cmd="$2"
  local fix="$3"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "  ${OK} ${label}"
  else
    echo "  ${WARN} ${label}"
    echo "         -> ${fix}"
    warnings=$((warnings + 1))
  fi
}

echo "Local tools:"
check "databricks CLI installed" \
  "command -v databricks" \
  "Install: https://docs.databricks.com/dev-tools/cli/install.html"
check "jq installed" \
  "command -v jq" \
  "Install via your package manager (brew install jq / apt install jq)"
check "curl installed" \
  "command -v curl" \
  "Install via your package manager"
check "Node.js >= 20" \
  "node -e 'process.exit(parseInt(process.versions.node.split(\".\")[0]) >= 20 ? 0 : 1)'" \
  "Install Node.js 20 or newer: https://nodejs.org/"
check "npm installed" \
  "command -v npm" \
  "Comes with Node.js"

echo ""
echo "Workspace profile:"
PROFILES_JSON=$(databricks auth profiles --output json 2>/dev/null || echo '{"profiles":[]}')
PROFILE_COUNT=$(echo "$PROFILES_JSON" | jq '.profiles | length' 2>/dev/null || echo 0)

if [ "$PROFILE_COUNT" = "0" ]; then
  echo "  ${FAIL} No CLI profiles configured"
  echo "         -> Run: databricks auth login, then re-run this script."
  exit 1
elif [ "$PROFILE_COUNT" = "1" ]; then
  PROFILE_NAME=$(echo "$PROFILES_JSON" | jq -r '.profiles[0].name')
  PROFILE_HOST=$(echo "$PROFILES_JSON" | jq -r '.profiles[0].host')
  echo "  ${OK} Single profile: ${PROFILE_NAME} (${PROFILE_HOST})"
elif [ -n "${DATABRICKS_CONFIG_PROFILE:-}" ]; then
  PROFILE_HOST=$(echo "$PROFILES_JSON" | jq -r \
    --arg name "$DATABRICKS_CONFIG_PROFILE" \
    '.profiles[] | select(.name == $name) | .host' | head -1)
  echo "  ${OK} Using DATABRICKS_CONFIG_PROFILE=${DATABRICKS_CONFIG_PROFILE} (${PROFILE_HOST:-host unknown})"
else
  echo "  ${PROFILE_COUNT} profiles configured -- pick one before continuing."
  echo ""
  echo "  Configured profiles:"
  echo "$PROFILES_JSON" | jq -r '.profiles[] | "    - \(.name) (\(.host))"'
  echo ""
  echo "  Pick the profile that targets the workspace where you want to deploy,"
  echo "  then re-run this script:"
  echo ""
  echo "      export DATABRICKS_CONFIG_PROFILE=<profile-name>"
  echo "      bash setup/verify_prereqs.sh"
  echo ""
  echo "Stopping early to avoid spurious failures from the wrong workspace."
  exit 1
fi

echo ""
echo "Databricks workspace:"
check "CLI authenticated (databricks current-user me)" \
  "databricks current-user me --output json" \
  "Run: databricks auth login. If you have multiple profiles, set DATABRICKS_CONFIG_PROFILE."
check "Can list SQL warehouses" \
  "databricks warehouses list --output json" \
  "You may not have workspace access. Contact your workspace admin."
check "samples.wanderbricks dataset accessible" \
  "databricks tables get samples.wanderbricks.bookings --output json" \
  "Dataset must exist and be readable. Contact your workspace admin if missing or unshared."
check "Genie spaces API available" \
  "databricks genie list-spaces --output json" \
  "Genie may not be enabled in this workspace, or your CLI version is too old (need a recent databricks CLI; older builds used 'genie spaces list')."
check "Apps API available" \
  "databricks apps list --output json" \
  "Databricks Apps may not be enabled in this workspace."

# Lakebase Autoscaling Postgres is the storage for app-owned writable state.
# Soft warning so users with the feature gated to an admin can still proceed
# manually -- configure_env.sh will fail loudly later if it really is missing.
soft_check "Lakebase Autoscaling reachable (databricks postgres list-projects)" \
  "databricks postgres list-projects --output json" \
  "Lakebase Autoscaling must be enabled. The walkthrough will fail at 'configure_env.sh' without it. Contact your workspace admin."

echo ""
if [ $failures -eq 0 ] && [ $warnings -eq 0 ]; then
  echo "All prerequisite checks passed. You're ready to start."
  exit 0
elif [ $failures -eq 0 ]; then
  echo "${warnings} warning(s) above. The walkthrough may still proceed but expect issues at the flagged step."
  exit 0
else
  echo "${failures} required check(s) failed. Fix the issues above before continuing."
  echo ""
  echo "Note: 'can I create X?' permissions can't be pre-flighted via the CLI."
  echo "If a later step fails on create (warehouse, Genie space, app deploy),"
  echo "see the troubleshooting section in the blog post."
  exit 1
fi
