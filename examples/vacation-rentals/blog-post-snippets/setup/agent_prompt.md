Build and deploy a Databricks AppKit application called "vacation-rentals".

Complete every step without asking the user for input, with one exception:
in step 0, if multiple Databricks CLI profiles are configured, ask the user
which profile to use. Once a profile is selected, run to completion using the
Databricks CLI for all workspace operations. When you're done, print the
deployed app URL — nothing else should require user action.

## 0. Verify prerequisites

Run the verification script — it checks local tools, workspace access, and
profile selection in one go:

```bash
curl -sL https://raw.githubusercontent.com/jamesbroadhead/appkit-blog-snippets/master/setup/verify_prereqs.sh | bash
```

Three possible outcomes, three responses:

- **Exit 0** — everything's ready. Continue to step 1.
- **Exit 1, "N profiles configured -- pick one before continuing"** — this is
  the only step where you may pause for user input. Show the user the listed
  profiles and their hosts, ask which workspace to deploy to, then:
  ```bash
  export DATABRICKS_CONFIG_PROFILE=<chosen-name>
  ```
  Re-run the verify script. Loop until it exits 0.
- **Exit 1, any other failure** — surface the error to the user and stop. Do
  not continue to later steps. The script's output names the failing check
  and the fix.

## 1. Install Databricks skills

```bash
databricks experimental aitools install
```

This gives your agent access to Databricks-aware tools for workspace operations.

## 2. Configure environment

```bash
curl -sL https://raw.githubusercontent.com/jamesbroadhead/appkit-blog-snippets/master/setup/configure_env.sh | bash
```

This writes `.env` with `DATABRICKS_HOST`, `DATABRICKS_WAREHOUSE_ID`,
`DATABRICKS_GENIE_SPACE_ID`, `LAKEBASE_ENDPOINT`, `PGHOST`, `PGDATABASE`
(and `DATABRICKS_CONFIG_PROFILE` if you set one in step 0). It:

- picks the first SQL warehouse, or creates a serverless Pro one named `appkit-dev`
- creates a Genie space called "Wanderbricks" backed by the sample bookings,
  properties, destinations, and reviews tables
- creates a Lakebase Autoscaling project named `appkit-dev` (find-or-create)
  configured for scale-to-zero (min 0.5 CU — platform floor — suspend after
  5 min idle); discovers its default branch, primary endpoint, and database

If the script fails, its error output explains which create call failed and
the most likely causes — surface that to the user and stop.

## 3. Scaffold the app

Run `databricks apps init` non-interactively, sourcing the IDs from the `.env`
that step 2 wrote:

```bash
set -a; source .env; set +a

databricks apps init \
  --name vacation-rentals \
  --features=analytics,genie,lakebase \
  --set analytics.sql-warehouse.id="$DATABRICKS_WAREHOUSE_ID" \
  --set genie.genie-space.id="$DATABRICKS_GENIE_SPACE_ID" \
  --set lakebase.postgres.branch="$LAKEBASE_BRANCH" \
  --set lakebase.postgres.database="$LAKEBASE_DATABASE"

# apps init writes its own .env inside vacation-rentals/ -- replace it with the
# one configure_env.sh wrote, which has the resolved Lakebase host/endpoint.
mv .env vacation-rentals/.env
cd vacation-rentals && npm install
```

## 4. Application code

**Dataset**: `samples.wanderbricks` (vacation rental marketplace — ships with every workspace)

**Architecture**: All reads go through the SQL Warehouse (analytics queries). Lakebase
is used only for app-owned writable state — booking flags and notes that the app creates.
No data syncing or copying required.

**Server** (`server/server.ts`):

- Plugins: `server({ autoStart: false })`, `analytics({})`, `genie({ spaces: { wanderbricks: genieSpaceId } })`, `lakebase()`. Hoist the env
  var into a local first and crash on miss — `process.env.X` is `string |
undefined`, but the genie plugin's `spaces` requires `Record<string, string>`,
  and an empty string would silently 404 from the Genie API at runtime:
  ```ts
  const genieSpaceId = process.env.DATABRICKS_GENIE_SPACE_ID;
  if (!genieSpaceId) throw new Error("DATABRICKS_GENIE_SPACE_ID is required");
  ```
- On first start, auto-create the Lakebase tables if they don't exist. Use a
  dedicated `app` schema — the app's service principal does not have `CREATE`
  on `public`, so bare table names will fail with `permission denied for
schema public`:
  ```sql
  CREATE SCHEMA IF NOT EXISTS app;
  CREATE TABLE IF NOT EXISTS app.booking_flags (
    flag_id      SERIAL PRIMARY KEY,
    booking_id   BIGINT NOT NULL UNIQUE,
    flag_reason  TEXT NOT NULL,
    flagged_by   TEXT NOT NULL DEFAULT 'app-user',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS app.booking_notes (
    note_id      SERIAL PRIMARY KEY,
    booking_id   BIGINT NOT NULL,
    agent_email  TEXT NOT NULL,
    note         TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- Custom routes via `appkit.server.extend()`:
  - `POST /api/bookings/:id/flag` — flag a booking for review (insert into booking_flags)
  - `DELETE /api/bookings/:id/flag` — unflag a booking
  - `GET /api/bookings/:id/flag` — check if a booking is flagged
  - `POST /api/bookings/:id/notes` — add a note to a booking
  - `GET /api/bookings/:id/notes` — list notes for a booking, ordered by created_at DESC
- Call `appkit.server.start()` after extend

**Analytics queries** (in `config/queries/`):

`revenue_by_destination.sql`:

```sql
-- @param limit NUMERIC
SELECT d.destination, d.country,
       COUNT(DISTINCT b.booking_id) AS total_bookings,
       ROUND(SUM(b.total_amount), 2) AS total_revenue,
       ROUND(AVG(r.rating), 1) AS avg_rating
FROM samples.wanderbricks.bookings b
JOIN samples.wanderbricks.properties p ON b.property_id = p.property_id
JOIN samples.wanderbricks.destinations d ON p.destination_id = d.destination_id
LEFT JOIN samples.wanderbricks.reviews r ON b.booking_id = r.booking_id
GROUP BY d.destination, d.country
ORDER BY total_revenue DESC
LIMIT CAST(:limit AS INT)
```

The `CAST(... AS INT)` is required: AppKit's analytics plugin binds
`sql.number()` parameters as `DECIMAL(10,0)`, but Spark's `LIMIT` clause
rejects anything that isn't an integer
(`INVALID_LIMIT_LIKE_EXPRESSION.DATA_TYPE`). Cast in SQL.

`booking_detail.sql`:

```sql
-- @param bookingId NUMERIC
SELECT b.booking_id, b.status, b.check_in, b.check_out,
       b.guests_count, b.total_amount,
       u.name AS guest_name, u.email AS guest_email,
       p.title AS property_title, d.destination
FROM samples.wanderbricks.bookings b
JOIN samples.wanderbricks.users u ON b.user_id = u.user_id
JOIN samples.wanderbricks.properties p ON b.property_id = p.property_id
JOIN samples.wanderbricks.destinations d ON p.destination_id = d.destination_id
WHERE b.booking_id = :bookingId
```

**Frontend** (React, in `client/src/`):

- `RevenueByDestination.tsx` — table using `useAnalyticsQuery("revenue_by_destination", { limit: sql.number(10) })`
- `RevenueChart.tsx` — `<BarChart queryKey="revenue_by_destination" parameters={{ limit: sql.number(10) }} xKey="destination" yKey="total_revenue" />` (the `parameters` prop is required — the chart re-issues the query, and `:limit` must be bound)
- `BookingManager.tsx` — looks up a booking via `useAnalyticsQuery("booking_detail", { bookingId })`,
  displays guest/property details, shows a "Flag for review" button and a notes panel.
  Flag and notes operations use `fetch()` against the Lakebase routes.
- `WanderbricksChat.tsx` — `<GenieChat alias="wanderbricks" />`
- `App.tsx` — two-column grid layout using AppKit UI Card components

Use `@databricks/appkit` for the server and `@databricks/appkit-ui/react` for the frontend.

## 5. Verify and deploy

From inside `vacation-rentals/`:

1. Local smoke test:

   ```bash
   npm run dev
   ```

   Confirm the server logs show it listening on `http://localhost:8000`, then
   stop it (`Ctrl+C`).

2. Deploy and start the app — `databricks apps deploy` (from the project
   directory) validates, uploads, and runs the app in one shot. `apps init`
   declares a `genie_space_name` bundle variable but does not set a default,
   so pass it via `--var` (or the deploy will fail with an undefined
   variable):

   ```bash
   databricks apps deploy --var=genie_space_name=Wanderbricks
   ```

   `databricks bundle deploy` alone is **not** sufficient: it deploys the
   bundle but doesn't start the app.

3. Fetch the deployed URL:
   ```bash
   APP_URL=$(databricks apps get vacation-rentals --output json | jq -r '.url')
   echo "$APP_URL"
   ```

## 6. Done

Print a summary of what was created (warehouse, Genie space, Lakebase
project, app) and `$APP_URL` from step 5. Do not print any remaining TODO
items or manual steps.
