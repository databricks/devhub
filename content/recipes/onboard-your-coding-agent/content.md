## Onboard Your Coding Agent

Make a Databricks repo agent-ready in four steps: install Databricks platform skills into the user's coding agent (project-scoped, so the rules ride with the repo), wire up the DevHub Docs MCP server so the agent can fetch any DevHub page on demand, and bootstrap an `AGENTS.md` (with a symlinked `CLAUDE.md`) that pins the workspace defaults this codebase should use.

References:

- [Agent skills](/docs/tools/ai-tools/agent-skills) — what the Databricks skills give your agent and the full `databricks aitools` flag matrix.
- [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server) — what the DevHub MCP server exposes and how to verify it is connected.

### 1. Install Databricks agent skills (project-scoped)

Skills are task-specific instruction files (`databricks-apps`, `databricks-core`, `databricks-lakebase`, `databricks-pipelines`, `databricks-jobs`, etc.) that tell the user's coding agent how Databricks works — CLI conventions, auth patterns, resource shapes — so it generates correct code instead of guessing.

By default, skills install **globally** to each agent's user-level config directory. For a repo handed off to a team, prefer **project scope** so the rules live alongside the code and travel with the repo:

```bash
databricks aitools install --project
```

This installs every Databricks skill into the current project directory's agent config (e.g. `.cursor/rules/`, `.claude/skills/`). Run from the repo root.

If the user only wants a subset, scope by skill name and/or by agent:

```bash
databricks aitools install --project --skills databricks-apps,databricks-lakebase --agents cursor,claude-code
```

Verify what got installed:

```bash
databricks aitools list --project
```

`databricks aitools install --help` is the source of truth for the flag list — DevHub mirrors it on the [agent skills page](/docs/tools/ai-tools/agent-skills) but the CLI is authoritative.

### 2. Wire up the DevHub Docs MCP server

The DevHub MCP server gives coding agents read access to every page on `dev.databricks.com` (docs, templates, and examples) without leaving the editor. The agent can call `list_docs_resources` to see the index and `get_doc_resource(slug)` to fetch any page as markdown.

Install at project scope so the server is bound to this repo (drop `-g` if you want it user-wide):

```bash
npx add-mcp https://dev.databricks.com/api/mcp --name devhub-docs
```

To target a specific agent (otherwise the installer auto-detects):

```bash
npx add-mcp https://dev.databricks.com/api/mcp --name devhub-docs -a cursor
```

Restart the editor after installation. Some editors (Cursor) require visiting the MCP settings page and toggling `devhub-docs` to enabled.

Verify the connection:

1. Confirm `devhub-docs` shows up in the agent's tool list.
2. Ask the agent to call `list_docs_resources` — it should return the DevHub markdown index.
3. Ask the agent to call `get_doc_resource(slug: "start-here")` — it should return the [start-here doc](/docs/start-here) as markdown.

### 3. Bootstrap an `AGENTS.md` with this repo's Databricks defaults

`AGENTS.md` is the project-root file that any modern coding agent reads first to learn how to behave on this codebase. We want a "Working with Databricks" section that pins the resources and CLI profile this repo should default to, so the agent stops guessing on every prompt.

#### 3a. Detect existing files first — do not overwrite

Before writing anything, check what already exists:

```bash
ls AGENTS.md CLAUDE.md 2>/dev/null
```

- **Both exist as separate files** → ask the user whether `CLAUDE.md` is a symlink to `AGENTS.md` (run `ls -l CLAUDE.md`) or a divergent file. If divergent, surface that to the user and ask before merging — never overwrite hand-written agent instructions.
- **Only `AGENTS.md` exists** → append the "Working with Databricks" section below. Then `ln -s AGENTS.md CLAUDE.md` so Claude Code reads the same content.
- **Only `CLAUDE.md` exists** → rename to `AGENTS.md` (`mv CLAUDE.md AGENTS.md`), then symlink (`ln -s AGENTS.md CLAUDE.md`). Append the section.
- **Neither exists** → create `AGENTS.md` with the template below, then `ln -s AGENTS.md CLAUDE.md`.

#### 3b. Ask the user for this repo's defaults

Before generating `AGENTS.md`, walk through these questions one at a time (using a multiple-choice tool when available). Leave any answer blank with `TODO:` if the user does not know yet — you can fill it in later as the project develops. Do not infer or invent values.

- **CLI profile** for this repo (e.g. `DEFAULT`, `my-prod-workspace`). Get the list with `databricks auth profiles`.
- **Workspace URL** (the `Host` column from `databricks auth profiles` for the chosen profile).
- **Unity Catalog defaults** — catalog name and schema name this repo's tables should land in. Defaults are often `<team_name>_dev` and `<project_name>` respectively.
- **Lakebase defaults** (only if the app uses Lakebase) — project name, branch (typically `production`), database name, endpoint name (typically `primary`).
- **Genie space ID** (only if the app embeds Genie).
- **Model Serving endpoint name** (only if the app calls Databricks-hosted models).

#### 3c. Write the section

Append this block to `AGENTS.md` (substituting the user's answers; keep `TODO:` markers for anything they did not specify):

```markdown title="AGENTS.md (excerpt)"
## Working with Databricks

This repo deploys onto a single Databricks workspace. When suggesting CLI commands, infrastructure-as-code, or queries, default to these values unless the user asks for something else. Surface the assumption out loud whenever you act on one of them so the user can correct you.

**CLI profile**: `<PROFILE>` — pass `--profile <PROFILE>` on every `databricks` command, or set `export DATABRICKS_CONFIG_PROFILE=<PROFILE>` in the shell session.

**Workspace URL**: `<https://<workspace>.cloud.databricks.com>`

**Unity Catalog defaults**:

- Catalog: `<catalog>`
- Schema: `<schema>`
- Reference tables as `` `<catalog>.<schema>.<table>` `` in SQL.

**Lakebase defaults** _(only if the app persists data in Lakebase)_:

- Project: `<project>`
- Branch: `production`
- Database: `<database>`
- Endpoint: `primary`

**Genie space** _(only if the app uses conversational analytics)_:

- Space ID: `<space-id>`

**Model Serving endpoint** _(only if the app calls Databricks-hosted models)_:

- Endpoint name: `<endpoint>`

**Conventions**:

- Always run `databricks auth profiles` and confirm `<PROFILE>` shows `Valid: YES` before running anything that hits the workspace.
- For non-trivial destructive operations (`databricks apps delete`, `DROP TABLE`, etc.), ask the user to confirm before running.
- DevHub is the source of truth for the Databricks developer stack. When unsure of a CLI flag or a plugin shape, fetch the matching page from <https://dev.databricks.com/llms.txt> via the `devhub-docs` MCP server before guessing.
```

#### 3d. Symlink `CLAUDE.md` → `AGENTS.md`

Claude Code (and Codex) read `CLAUDE.md` if present and `AGENTS.md` otherwise. To keep one source of truth:

```bash
ln -s AGENTS.md CLAUDE.md
```

On Windows without symlink support, copy instead and remind the user to keep them in sync (or use `mklink /H CLAUDE.md AGENTS.md` for a hard link in cmd).

Confirm:

```bash
ls -l AGENTS.md CLAUDE.md
```

`CLAUDE.md` should show as `-> AGENTS.md`.

### 4. Smoke-test the agent

Open a fresh chat with the user's coding agent and ask it:

> Look at AGENTS.md and tell me which CLI profile and Unity Catalog schema this repo uses by default.

The agent should answer correctly without needing to fetch any extra context — that confirms the agent is reading `AGENTS.md` and the Databricks skills are loaded. If it cannot, re-check that the skill install step ran in the project directory (`databricks aitools list --project`) and that `AGENTS.md` is at the repo root.

### Where to next

- [Templates catalog](/templates) — pick a template, copy the prompt, and the agent now has full Databricks context to execute against your workspace defaults.
- [DevHub Docs MCP Server reference](/docs/tools/ai-tools/docs-mcp-server) — full tool list and connection troubleshooting.
- [Agent skills reference](/docs/tools/ai-tools/agent-skills) — the full skill catalog plus `--global` / `--project` / `--agents` / `--skills` flag matrix.
