#!/usr/bin/env bash
# Configure .env with warehouse ID, host, and Genie space ID.
# Requires: databricks CLI configured and authenticated.
#
# Usage: bash setup/configure_env.sh
#
# If you hit a permission error, run setup/verify_prereqs.sh first to surface
# what's reachable. Per-step error guidance is printed inline below.

set -uo pipefail

ENV_FILE=".env"

# --- Databricks host ---
if ! HOST_OUT=$(databricks auth describe --output json 2>&1); then
  cat >&2 <<EOF
ERROR: Could not read Databricks auth config.

CLI output:
${HOST_OUT}

Common causes:
  - The Databricks CLI is not authenticated. Run: databricks auth login
  - You have multiple profiles and DATABRICKS_CONFIG_PROFILE is unset.
    List them with: databricks auth profiles
    Then: export DATABRICKS_CONFIG_PROFILE=<profile-name>
EOF
  exit 1
fi
HOST=$(echo "$HOST_OUT" | jq -r '.details.host // empty')
if [ -z "$HOST" ]; then
  echo "ERROR: 'databricks auth describe' did not return a host. Run 'databricks auth login' or set DATABRICKS_HOST." >&2
  exit 1
fi
echo "DATABRICKS_HOST=${HOST}" > "$ENV_FILE"
echo "Using host: ${HOST}"

if [ -n "${DATABRICKS_CONFIG_PROFILE:-}" ]; then
  echo "DATABRICKS_CONFIG_PROFILE=${DATABRICKS_CONFIG_PROFILE}" >> "$ENV_FILE"
  echo "Using profile: ${DATABRICKS_CONFIG_PROFILE}"
fi

# --- SQL Warehouse ---
# Genie requires a Pro serverless warehouse, so don't just grab .[0]: filter
# for warehouse_type=PRO and enable_serverless_compute=true, prefer RUNNING
# over STOPPED, and skip DELETING/DELETED. If no eligible warehouse exists,
# fall through to create one.
WAREHOUSES_JSON=$(databricks warehouses list --output json)
ELIGIBLE=$(echo "$WAREHOUSES_JSON" | jq '
  [.[]
   | select(.warehouse_type == "PRO")
   | select(.enable_serverless_compute == true)
   | select(.state != "DELETING" and .state != "DELETED")
  ]
  | sort_by(if .state == "RUNNING" then 0 else 1 end)
')
WAREHOUSE_ID=$(echo "$ELIGIBLE" | jq -r '.[0].id // empty')
WAREHOUSE_NAME=$(echo "$ELIGIBLE" | jq -r '.[0].name // empty')
WAREHOUSE_STATE=$(echo "$ELIGIBLE" | jq -r '.[0].state // empty')

if [ -z "$WAREHOUSE_ID" ]; then
  TOTAL=$(echo "$WAREHOUSES_JSON" | jq 'length')
  if [ "$TOTAL" -gt 0 ]; then
    echo "Found ${TOTAL} warehouse(s) but none are Pro + serverless (Genie requires this)."
    echo "Creating a Pro serverless warehouse..."
  else
    echo "No warehouses found. Creating a Pro serverless warehouse..."
  fi
  if ! WAREHOUSE_OUT=$(databricks warehouses create \
      --name "appkit-dev" \
      --cluster-size "2X-Small" \
      --warehouse-type PRO \
      --enable-serverless-compute \
      --output json 2>&1); then
    cat >&2 <<EOF
ERROR: Failed to create SQL warehouse 'appkit-dev'.

CLI output:
${WAREHOUSE_OUT}

Common causes:
  - Your account lacks permission to create warehouses. You typically need
    'Allow cluster creation' entitlement or workspace admin rights.
  - Serverless SQL is not enabled in this workspace (or not in this region).
  - The workspace is over its compute / DBU quota.

What to try:
  - Ask a workspace admin to create a Pro serverless SQL warehouse, then
    set DATABRICKS_WAREHOUSE_ID in .env manually and skip this script.
EOF
    exit 1
  fi
  WAREHOUSE_ID=$(echo "$WAREHOUSE_OUT" | jq -r '.id')
  echo "Created warehouse: ${WAREHOUSE_ID}"
else
  echo "Using existing Pro serverless warehouse: ${WAREHOUSE_NAME} (${WAREHOUSE_ID}, ${WAREHOUSE_STATE})"
fi

echo "DATABRICKS_WAREHOUSE_ID=${WAREHOUSE_ID}" >> "$ENV_FILE"

# --- Genie space ---
# create-space takes a positional WAREHOUSE_ID and a SERIALIZED_SPACE JSON blob.
# The data_sources.tables array MUST be sorted by identifier or the API rejects it.
SERIALIZED_SPACE='{
  "version": 2,
  "data_sources": {
    "tables": [
      {"identifier": "samples.wanderbricks.bookings"},
      {"identifier": "samples.wanderbricks.destinations"},
      {"identifier": "samples.wanderbricks.properties"},
      {"identifier": "samples.wanderbricks.reviews"}
    ]
  }
}'

echo "Creating Genie space..."
if ! GENIE_OUT=$(databricks genie create-space \
    "$WAREHOUSE_ID" \
    "$SERIALIZED_SPACE" \
    --title "Wanderbricks" \
    --description "Vacation rental marketplace analytics" \
    --output json 2>&1); then
  cat >&2 <<EOF
ERROR: Failed to create Genie space 'Wanderbricks'.

CLI output:
${GENIE_OUT}

Common causes:
  - Genie is not enabled in this workspace.
  - You don't have SELECT on samples.wanderbricks tables. Verify with:
      databricks tables get samples.wanderbricks.bookings
  - The selected warehouse is not Pro or doesn't support serverless. Genie
    typically requires a Pro serverless SQL warehouse. Current warehouse:
      ${WAREHOUSE_ID}
    Inspect with: databricks warehouses get ${WAREHOUSE_ID}
  - Your account lacks the 'Genie space creator' entitlement.

What to try:
  - Confirm Genie is enabled and you have an appropriate warehouse.
  - If you proceed manually, create the space in the UI and set
    DATABRICKS_GENIE_SPACE_ID in .env yourself.
EOF
  exit 1
fi
GENIE_SPACE_ID=$(echo "$GENIE_OUT" | jq -r '.space_id')

echo "DATABRICKS_GENIE_SPACE_ID=${GENIE_SPACE_ID}" >> "$ENV_FILE"
echo "Created Genie space: ${GENIE_SPACE_ID}"

# --- Lakebase Autoscaling Postgres ---
# Find or create a project named 'appkit-dev'. Each project auto-creates a
# default branch and primary endpoint, so we just discover them. AppKit's
# lakebase plugin reads LAKEBASE_ENDPOINT (resource path), PGHOST, PGDATABASE.
PROJECT_ID="appkit-dev"
PROJECT_NAME="projects/${PROJECT_ID}"

if databricks postgres get-project "$PROJECT_NAME" --output json >/dev/null 2>&1; then
  echo "Using existing Lakebase project: ${PROJECT_NAME}"
else
  echo "Creating Lakebase Autoscaling project '${PROJECT_ID}' with scale-to-zero (this may take a minute)..."
  # spec.default_endpoint_settings configures the auto-created endpoint:
  #   - autoscaling_limit_min_cu: 0.5 -> platform minimum (closest to scale-to-zero)
  #   - autoscaling_limit_max_cu: 1   -> cap at 1 CU (plenty for the demo)
  #   - suspend_timeout_duration: 300s -> suspend after 5 min idle
  # Note: the request body needs a `spec` wrapper -- without it, the API
  # silently ignores the values and applies the platform defaults.
  if ! PROJECT_OUT=$(databricks postgres create-project "$PROJECT_ID" \
      --json '{
        "spec": {
          "default_endpoint_settings": {
            "autoscaling_limit_min_cu": 0.5,
            "autoscaling_limit_max_cu": 1,
            "suspend_timeout_duration": "300s"
          }
        }
      }' \
      --output json 2>&1); then
    cat >&2 <<EOF
ERROR: Failed to create Lakebase Autoscaling project '${PROJECT_ID}'.

CLI output:
${PROJECT_OUT}

Common causes:
  - Lakebase Autoscaling is not enabled in this workspace (or not in this region).
  - Your account lacks permission to create database projects.
  - The project ID conflicts with an existing one in another state.

What to try:
  - Verify availability: databricks postgres list-projects
  - Ask a workspace admin to enable Lakebase Autoscaling.
  - If you proceed manually, set LAKEBASE_ENDPOINT, PGHOST, PGDATABASE in .env yourself.
EOF
    exit 1
  fi
  echo "Created project: ${PROJECT_NAME}"
fi

# Find the default branch (auto-created with the project).
BRANCH_NAME=$(databricks postgres list-branches "$PROJECT_NAME" --output json \
  | jq -r '[.[] | select(.status.default == true)] | .[0].name // empty')
if [ -z "$BRANCH_NAME" ]; then
  # Fall back to the first branch if no default is flagged.
  BRANCH_NAME=$(databricks postgres list-branches "$PROJECT_NAME" --output json | jq -r '.[0].name // empty')
fi
if [ -z "$BRANCH_NAME" ]; then
  echo "ERROR: No branches found under ${PROJECT_NAME}. Create one with:" >&2
  echo "  databricks postgres create-branch ${PROJECT_NAME} main" >&2
  exit 1
fi
echo "Using Lakebase branch: ${BRANCH_NAME}"

# Find or create the primary endpoint.
ENDPOINT_JSON=$(databricks postgres list-endpoints "$BRANCH_NAME" --output json | jq '.[0] // empty')
if [ -z "$ENDPOINT_JSON" ] || [ "$ENDPOINT_JSON" = "null" ]; then
  echo "Creating primary endpoint under ${BRANCH_NAME} (scale-to-zero)..."
  if ! ENDPOINT_OUT=$(databricks postgres create-endpoint "$BRANCH_NAME" "primary" \
      --json '{
        "spec": {
          "endpoint_type": "ENDPOINT_TYPE_READ_WRITE",
          "autoscaling_limit_min_cu": 0.5,
          "autoscaling_limit_max_cu": 1,
          "suspend_timeout_duration": "300s"
        }
      }' \
      --output json 2>&1); then
    cat >&2 <<EOF
ERROR: Failed to create Lakebase endpoint under ${BRANCH_NAME}.

CLI output:
${ENDPOINT_OUT}

What to try:
  - Verify the branch is healthy: databricks postgres get-branch ${BRANCH_NAME}
  - Create manually in the UI and re-run this script.
EOF
    exit 1
  fi
  ENDPOINT_JSON="$ENDPOINT_OUT"
fi

LAKEBASE_ENDPOINT=$(echo "$ENDPOINT_JSON" | jq -r '.name')
PGHOST=$(echo "$ENDPOINT_JSON" | jq -r '.status.hosts.host // empty')
if [ -z "$PGHOST" ]; then
  # Endpoint may still be provisioning. Re-fetch via get-endpoint.
  PGHOST=$(databricks postgres get-endpoint "$LAKEBASE_ENDPOINT" --output json | jq -r '.status.hosts.host // empty')
fi
if [ -z "$PGHOST" ]; then
  echo "ERROR: Endpoint ${LAKEBASE_ENDPOINT} has no host yet -- still provisioning?" >&2
  echo "Check with: databricks postgres get-endpoint ${LAKEBASE_ENDPOINT}" >&2
  exit 1
fi

# Discover the postgres database resource (auto-created with the branch).
# Needed for non-interactive 'databricks apps init --set lakebase.postgres.database=...'.
LAKEBASE_DATABASE=$(databricks postgres list-databases "$BRANCH_NAME" --output json | jq -r '.[0].name // empty')
if [ -z "$LAKEBASE_DATABASE" ]; then
  echo "ERROR: No postgres database found under ${BRANCH_NAME}." >&2
  echo "Lakebase normally auto-creates one with the branch -- check: databricks postgres list-databases ${BRANCH_NAME}" >&2
  exit 1
fi

echo "LAKEBASE_ENDPOINT=${LAKEBASE_ENDPOINT}" >> "$ENV_FILE"
echo "LAKEBASE_BRANCH=${BRANCH_NAME}" >> "$ENV_FILE"
echo "LAKEBASE_DATABASE=${LAKEBASE_DATABASE}" >> "$ENV_FILE"
echo "PGHOST=${PGHOST}" >> "$ENV_FILE"
echo "PGDATABASE=databricks_postgres" >> "$ENV_FILE"
echo "Configured Lakebase endpoint: ${LAKEBASE_ENDPOINT}"

echo ""
echo "Wrote ${ENV_FILE}:"
cat "$ENV_FILE"
