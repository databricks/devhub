## Spin Up a Databricks App

Generate a working AppKit Databricks App from scratch in a couple of minutes. This template runs `databricks apps init` to scaffold the project, runs it locally, and deploys it to your workspace.

The full CLI surface — every `--features`, `--set`, `--target`, and the post-deploy management commands — lives on DevHub at [App development](/docs/apps/development) and [Apps quickstart](/docs/apps/quickstart). Use those whenever a flag below is unclear.

### 1. Decide what plugins (`--features`) the app needs

`databricks apps init` produces a working app on its own, but most real apps want one or more AppKit plugins wired in from the start. Pick what you need before running init:

- `lakebase` — managed Postgres for persistent app data. See [Lakebase Quickstart](/docs/lakebase/quickstart).
- `analytics` — query a SQL Warehouse from the app server.
- `genie` — embed AI/BI Genie conversational analytics. See [Genie spaces](/docs/agents/genie).
- `model-serving` — call Databricks-hosted LLMs and ML endpoints.

If you are unsure, list every available plugin and the resource fields each one needs:

```bash
databricks apps manifest --profile <PROFILE>
```

Pass plugins as a comma-separated list to `--features` in the next step.

### 2. Scaffold the project with `databricks apps init`

Run from the directory where you want the project created. The CLI creates a new folder named after `--name` inside the current directory.

```bash
databricks apps init \
  --name <app-name> \
  --description "<one-sentence description>" \
  --features <comma-separated-plugins> \
  --version latest \
  --run none \
  --profile <PROFILE>
```

Notable flags:

- `--name` — lowercase, hyphenated, ≤ 26 characters. Passing it suppresses interactive prompts.
- `--features` — omit if you want the bare-minimum app with no plugins.
- `--version latest` — pin to the latest AppKit release. Drop this for `main`.
- `--run none` — do not run dev or deploy automatically; we will do those steps explicitly below.
- `--profile <PROFILE>` — only needed if `<PROFILE>` is not your `DEFAULT`.

For the full flag list and `--set` syntax for resources that need explicit branch/database fields, see [Scaffold options](/docs/apps/development#scaffold-options).

### 3. Install dependencies and run locally

```bash
cd <app-name>
npm install
npm run dev
```

`npm run dev` reads from `.env` (copy `.env.example` and fill in resource IDs if you used `--features`) and serves the app on `http://localhost:3000` by default.

For Lakebase-backed apps the local user also needs `databricks_superuser` so they can read the schemas the deployed service principal owns — see [Apps development → Local setup](/docs/apps/development#local-setup).

### 4. Make it look great before showing the user

The default AppKit scaffold is intentionally minimal. **Do not stop there.** Use the user's actual feature requests to redesign the routes, page hierarchy, and visual style from first principles _before_ asking the user to run and test locally. shadcn/ui on Tailwind is the default; the Databricks brand palette is `#FF3621`, `#0B2026`, `#EEEDE9`, `#F9F7F4`. The full design guidance lives in the dev-guidelines block at the top of any DevHub prompt.

### 5. Verify locally before deploying

If `agent-browser` is available (or the user approves installing it), use it to drive the local app and confirm the happy path works:

```bash
npm i -g agent-browser && agent-browser install
agent-browser skills get agent-browser
agent-browser open http://localhost:3000
```

Otherwise share the localhost URL with the user and ask them to click through the key flows. Do not deploy until the local app behaves as intended — Databricks Apps deploys are not free and a broken local build will not magically fix itself in production.

### 6. Validate and deploy

Run the project validator first (build + typecheck + lint) so the deploy does not fail on something that would have been caught locally:

```bash
databricks apps validate --profile <PROFILE>
```

Then deploy from the project directory:

```bash
databricks apps deploy --profile <PROFILE>
```

The CLI uploads the project, builds it on Databricks, and starts the app. On success it prints the workspace URL.

### 7. Verify the deployed app

```bash
databricks apps get <app-name> --profile <PROFILE> -o json
databricks apps logs <app-name> --profile <PROFILE>
```

`apps get` shows `app_status.state: RUNNING` once the app is healthy. `apps logs` streams `[BUILD]`, `[SYSTEM]`, and `[APP]` lines — useful when something goes wrong on first deploy.

Open the URL from `apps get` (signed in to Databricks) to confirm the app responds, then iterate: edit code, redeploy.

### Where to next

- [Onboard Your Coding Agent](/templates/onboard-your-coding-agent) — install Databricks skills (project-scoped) and the DevHub MCP server so your editor's AI assistant has the same context the human does.
- [App development reference](/docs/apps/development) — all `apps init` / `apps deploy` flags, environment configuration, the pre-deploy checklist, and troubleshooting.
- [Templates catalog](/templates) — fully composed templates (AI chat, app + Lakebase, Genie analytics, operational analytics) when the bare scaffold is not what you want.
