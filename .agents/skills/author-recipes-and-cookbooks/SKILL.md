---
name: author-recipes-and-cookbooks
description: Author and maintain DevHub templates published at `developers.databricks.com/templates`. A template is the public name for any of three internal entry kinds — atomic snippets, multi-step end-to-end walkthroughs, and full deployable example apps. Use when creating, updating, or reorganizing any template-tier content.
---

# Author DevHub Templates

## Overview

Use this skill to add or update DevHub templates with consistent structure, metadata, and writing quality. Treat each template as an execution prompt for AI coding agents — an inspirational gallery of what's possible, not a step-by-step manual guide.

## The Three Internal Kinds

Internally the catalog is built from three kinds of content that compose into each other:

- **Recipe** — an atomic, copy-pasteable agent prompt for one outcome (e.g. "Create a Lakebase instance"). The smallest unit; everything else is built from these.
- **Cookbook** — composes multiple recipes into a longer end-to-end guide, plus its own meta content (intro, narrative, ordering). No app source.
- **Example** — a cookbook _plus_ a full deployable `examples/<slug>/template/` codebase. Bundles recipes and cookbook narrative around runnable app code.

So: recipes are the atoms, cookbooks compose recipes with additional context, and examples are cookbooks with shipped code.

## Public Vocabulary

User-facing, all three kinds are presented as one thing: **template**. The site at `developers.databricks.com/templates`, navigation, filters, copy-pasted prompts, `llms.txt`, and the `/templates.md` markdown index all say "template(s)" — never "guide", "recipe", or "cookbook". When you write user-facing or agent-facing copy (titles, descriptions, intros, prerequisites, references), say "template".

## Internal Implementation Tiers

The internal kind names (`recipe`, `cookbook`, `example`) **live only in code, file paths, and this skill** — they never appear in shipped UI, markdown content, or generated indexes.

| Internal kind | Source location                                                                        | Route at runtime    | When to use                                                                |
| ------------- | -------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------- |
| `recipe`      | `content/recipes/<slug>/{goal,prerequisites}.md` + entry in `recipes`                  | `/templates/<slug>` | One atomic outcome, copy-pasteable in a single agent prompt.               |
| `cookbook`    | Entry in `cookbooks` (composes recipes) + manual page `src/pages/templates/<slug>.tsx` | `/templates/<slug>` | End-to-end walkthrough composed from multiple recipes.                     |
| `example`     | `content/examples/<slug>/goal.md` + full app source under `examples/<slug>/template/`  | `/templates/<slug>` | Full deployable codebase that bundles cookbooks/recipes plus runnable app. |

All three are registered in `src/lib/recipes/recipes.ts`, share a flat `/templates/<slug>` URL hierarchy, and must have globally unique slugs (the content-entries plugin asserts this at build time). Choose the kind that matches the **shape of the work**, not the customer-facing label.

## Decision Flow

1. One atomic, self-contained step for an agent → author a `recipe`.
2. A multi-recipe walkthrough that ships a coherent end-to-end use case (no full app source) → author a `cookbook` composing existing recipes.
3. A full deployable app (`template/` source tree, README runbook, optional pipelines and seed) → author an `example`.
4. Reuse existing recipes whenever you can. New recipes are the most valuable; new cookbooks/examples should compose them.

## Author A `recipe`

1. Create `content/recipes/<slug>/goal.md`. Optionally add `prerequisites.md`.
2. The slug must equal the folder name and be globally unique across the catalog.
3. Write `goal.md` as a concise outcome description — what the agent should build, what the user will have when done. Keep it short (5-10 lines). Agent skills handle the implementation details.
4. Optionally add `prerequisites.md` for workspace-specific requirements the agent should verify before starting (e.g., "Lakebase Postgres available", "Genie enabled", "AWS workspace"). Do NOT include "Databricks CLI authenticated" — the localBootstrap recipe already handles that.
5. Register the recipe in `src/lib/recipes/recipes.ts`:
   - add it to `recipes` with `id`, `name`, `description`, `tags`, `services`
   - set `prerequisites` only when strictly required
   - place it in `recipesInOrder`
6. Keep registry metadata aligned with the markdown (name, scope, intent must match).

### Prerequisites Belong In `prerequisites.md` — Never In `goal.md`

Prerequisites have a single home: `content/<recipes|examples>/<slug>/prerequisites.md`. The route plugin renders that file under a `## Prerequisites` H2 on the detail page.

Rules:

- **Do not** add prerequisites to `goal.md`. Keep goal focused on the outcome.
- When a recipe depends on completing another template first, list it as a bullet inside `prerequisites.md` with a link to `/templates/<slug>` (relative — see [Link Style](#link-style-use-relative-urls-for-devhub-pages)).
- Workspace-feature checks (Lakebase enabled, Apps enabled, Genie enabled, etc.) belong in `prerequisites.md` as `databricks` CLI commands the agent can run to verify each capability.
- Do NOT include "Databricks CLI authenticated" checks — the localBootstrap recipe injected into every agent prompt already handles CLI auth verification.

## Author A `cookbook`

1. Confirm the cookbook covers a full end-to-end use case.
2. Pick the recipes in execution order.
3. Update `src/lib/recipes/recipes.ts`:
   - add an entry to `cookbooks` with `id`, `name`, `description`, `recipeIds`
   - rely on `createCookbook()` to derive `tags` and `services`
4. Create `src/pages/templates/<slug>.tsx` following the existing pattern:
   - import `CookbookDetail` and `useCookbookMarkdown`
   - import the cookbook's `goal.md` from `@site/content/cookbooks/<slug>/goal.md`
   - use `useCookbookMarkdown("<slug>")` to get the `cookbook` and `rawMarkdown`
   - render just `<Goal />` as children of `<CookbookDetail>`
5. Keep the page declarative — no logic beyond composition.

## Author An `example`

An example is a full working codebase plus narrative markdown. It bundles cookbooks/recipes as included resources and ships deployable code.

### 1. Create The Example Code

Create `examples/<slug>/` with:

```
examples/<slug>/
  template/                    # full runnable tree (AppKit app + optional pipelines/seed/provisioning)
    README.md                  # canonical provisioning, SQL, seed, and deploy runbook
    databricks.yml             # bundle config with REPLACE_ME placeholders
    app.yaml                   # runtime env from bundle resources
    package.json               # app dependencies
    appkit.plugins.json        # plugin manifest
    server/                    # Express backend
    client/                    # React frontend
    config/queries/            # SQL query files
    provisioning/sql/          # baseline SQL (Unity Catalog, Postgres, etc.)
    pipelines/                   # Lakeflow pipelines (optional)
      <pipeline-name>/
        databricks.yml
        resources/*.yml
        src/**/*.sql or *.py
    seed/                        # seed script for demo data (optional)
      seed.ts
      package.json
```

Key conventions:

- The app directory MUST be named `template/` (not `app/`) so `databricks apps init --template` works.
- All runnable assets (app, optional `pipelines/`, `seed/`, `provisioning/sql/`) live **under** `template/`. Do not leave `pipelines/` or `seed/` at the example root — `template/README.md` must describe the full path from zero to deployed app.
- Use `REPLACE_ME` placeholders for workspace-specific values (host, warehouse ID, catalog name, Lakebase project, etc.).
- Never commit workspace-specific values, `.databricks/`, `node_modules/`, or `.env`.
- Pipeline SQL files use schema-qualified names (e.g., `silver.users`); rely on the pipeline YAML `catalog` setting for catalog resolution.
- Add `.npmrc` pointing to `https://npm-proxy.dev.databricks.com/` if the app uses `@databricks/appkit`.
- SQL files in `config/queries/` run against the **Databricks SQL Warehouse** (Spark SQL dialect), NOT Lakebase Postgres. Use `CURRENT_DATE()` not `NOW()`, `DATE_ADD(d, n)` not `d + INTERVAL`, `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` not `COUNT(*) FILTER (WHERE ...)`. Reference Unity Catalog three-part names (e.g., `catalog.schema.table`).

### `template/README.md` (canonical runbook)

This file is the single source of truth for operators and coding agents. The example detail page on DevHub points users here via clone + `cd` into `template/`; it must be complete enough to deploy without guessing.

Include, as appropriate:

1. **Architecture** — short diagram or bullet flow (OLTP → sync → pipelines → app, etc.).
2. **Components** — what lives in `client/`, `server/`, `pipelines/`, `seed/`, `provisioning/sql/`.
3. **Provisioning** — numbered order of operations. For each step, state clearly what is:
   - **Runnable SQL** — point to files under `template/provisioning/sql/`.
   - **Manual / UI only** — Lakehouse Sync, Sync Tables, Genie space, catalog creation with storage root, etc.
   - **CLI / bundles** — which directory to `cd` into, `databricks bundle deploy` targets, dependencies between pipelines and app.
4. **Seeding** — exact commands from `template/seed/` (`cd seed`, `npm install`, `DATABASE_URL=... npm run seed`). Note Postgres prerequisites (e.g. `REPLICA IDENTITY FULL`).
5. **Deploy** — from `template/`: install, build, `databricks bundle deploy`. Link pipeline deploys before/after as required.
6. **Optional** — `databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/<slug>` for users who scaffold instead of cloning.

Do **not** maintain a separate long-form `provisioning/README.md` next to the SQL — duplicate instructions drift. Keep narrative in `template/README.md` only.

For examples with no Unity Catalog DDL, still add `template/provisioning/sql/` with a comment-only file (e.g. `00_no_unity_catalog_ddl.sql`) so every example has a predictable place for SQL.

### 2. Create The Example Markdown

Create `content/examples/<slug>/goal.md`:

- Write a concise outcome description (5-10 lines): what the example builds, what you'll have when done.
- Optionally add `prerequisites.md` for workspace-specific requirements.
- Keep it focused on the "what", not the "how" — agent skills and `template/README.md` handle implementation details.

### 3. Register The Example

Update `src/lib/recipes/recipes.ts`:

- Add an entry to `examples` using `createExample()`.
- Set `id`, `name`, `description`, `githubPath`, `initCommand`, `templateIds`, `recipeIds`.
- `templateIds` references cookbooks the example builds upon.
- `recipeIds` references standalone recipes not already pulled in via a cookbook.
- `createExample()` derives `tags` and `services`.
- `initCommand` format: `git clone --depth 1 https://github.com/databricks/devhub.git` then `cd devhub/examples/<slug>/template`. Optional CLI scaffold: `databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/<slug>`.
- `githubPath` is `examples/<slug>`.

### 4. Add Preview And Gallery Images (Optional)

Images are optional. When omitted, the UI falls back to the generic card art. When you add them, they must conform to the DevHub image contracts that `npm run verify:images` enforces (the pre-commit hook runs this script).

**Contract for template preview/gallery images:**

- Aspect ratio: 16:9 (±2%)
- Minimum resolution: 1600×900 px (recommended: 1920×1080)
- Formats: PNG, JPEG, or WEBP. SVG is not a valid preview.
- Storage: `static/img/examples/<slug>-<slot>-<theme>.png` (e.g. `saas-tracker-dashboard-light.png` and `saas-tracker-dashboard-dark.png`).

**Always ship both a light and a dark variant.** The site picks the matching image based on the visitor's color mode. Capture the same screen twice at the same viewport once with the app in light mode and once in dark mode so the carousel slides align.

**Schema fields (all optional, same contract for all three template kinds):**

- `previewImageLightUrl` / `previewImageDarkUrl` — single theme-aware preview used on landing carousels, the `/templates` list card, and the detail hero when no `galleryImages` are set.
- `galleryImages?: Array<{ lightUrl: string; darkUrl: string }>` — themed slides for the example detail-page carousel.

Style the app in the Databricks brand palette before capturing screenshots. Theme tokens live in `src/css/custom.css`; reuse the same hex values in the example app's own CSS / Tailwind config:

| Token             | Hex       | Role                                                                |
| ----------------- | --------- | ------------------------------------------------------------------- |
| `--db-navy`       | `#0b2026` | Primary dark surface (dark-mode page background, sidebars, headers) |
| `--db-navy-light` | `#1b3139` | Secondary dark surface (dark-mode cards, raised panels)             |
| `--db-lava`       | `#ff3621` | Primary brand orange (buttons, highlights, focus states, badges)    |
| `--db-lava-dark`  | `#eb1600` | Hover / pressed state for the primary orange                        |
| `--db-lava-light` | `#ff5542` | Primary orange in dark mode (keeps contrast against navy)           |
| `--db-oat-medium` | `#eeede9` | Cream accent (secondary buttons, muted rows, light chips)           |
| `--db-bg`         | `#f9f7f4` | Light-mode page background (soft off-white)                         |
| `--db-card`       | `#ffffff` | Light-mode cards / raised surfaces                                  |

Screenshot guidance:

- Light mode: `--db-bg` + `--db-card` surfaces, navy text, orange accents.
- Dark mode: `--db-navy` + `--db-navy-light` surfaces, `--db-lava-light` accents, near-white text. Avoid pure-black CSS defaults.
- Use orange (`--db-lava` / `--db-lava-light`) sparingly — primary CTAs, active state, single accents. Avoid saturating whole regions.
- AppKit defaults already wire these tokens into Tailwind; copy from an existing example's `template/client/tailwind.config.ts` so new examples are on-brand by default.

### 5. Verify The DevHub Build

Run `npm run fmt && npm run typecheck && npm run build && npm run test` from the repo root. The content-entries plugin validates slug uniqueness across the whole catalog and generates routes automatically.

### 6. Test With A Dry Run

**Two directories, two purposes.** `examples/` is committed source code with `REPLACE_ME` placeholders. `../../demos/<slug>/` (outside the repo) is the scratch workspace for installing, configuring, and deploying.

NEVER `npm install`, deploy, or write workspace-specific values inside `examples/`. ALWAYS work from the demos folder outside the repo.

NEVER reuse existing workspace resources (Lakebase projects, Genie spaces, apps, UC catalogs) unless the developer explicitly says to. Always create fresh resources for the dry run to avoid corrupting or overwriting existing data.

The demos folder must be **outside the git repo** because `databricks bundle deploy` respects `.gitignore` and will skip files in gitignored directories.

#### Dry-run workflow

```bash
# 1. Copy the template tree into demos (outside the repo)
mkdir -p ../../demos/<slug>
cp -r examples/<slug>/template/* ../../demos/<slug>/

# 2. Fill in workspace-specific values
#    Edit ../../demos/<slug>/databricks.yml — replace REPLACE_ME with real IDs

# 3. Install and build
cd ../../demos/<slug>
npm install
npm run build

# 4. Create required Databricks resources (use databricks-core and databricks-lakebase skills)
#    - Lakebase project, branch, database
#    - SQL Warehouse (or use default)
#    - Genie Space (if used)
#    - Unity Catalog table (if analytics queries need warehouse-accessible data)

# 5. Seed data (if the example has a seed script)
cd <devhub-repo>/examples/<slug>/template/seed
npm install
DATABASE_URL="postgresql://..." npm run seed

# 6. Deploy from demos
cd ../../demos/<slug>
databricks apps deploy --profile <PROFILE>

# 7. Get the app URL
databricks apps get <app-name> --profile <PROFILE>
```

#### Fixing issues found during dry run

- **Code bug** (build fails, runtime error, wrong SQL dialect) — fix in `examples/<slug>/` in the repo, then re-copy to `../../demos/<slug>/` and retry.
- **Instruction gap** (missing step, unclear placeholder) — fix in `content/examples/<slug>/goal.md` or the relevant recipe under `content/recipes/`.
- **Seed data issue** — fix in `examples/<slug>/template/seed/seed.ts`.

#### Cleanup

After verifying the deployed app works, delete `../../demos/<slug>/`. Optionally tear down test resources if they were created just for testing.

## Author A `solution`

Solutions live at `developers.databricks.com/solutions/<slug>` and are launch posts, deep-dive write-ups, or curated perspectives on the Databricks developer stack. They sit alongside the linked Databricks Blog posts that the registry hand-picks.

A native (DevHub-authored) solution has two pieces:

- **A registry entry in `src/lib/solutions/solutions.ts`** with `id`, `title`, `description`, `tags`, `authors`, and `publishedAt`. This is the **single source of truth** for the page title, summary, byline, and date — every render path (detail page, served `.md`, frontmatter for MCP consumers) reads from here.
- **A flat markdown file at `content/solutions/<slug>.md`** that contains only the article body.

### Solution Markdown Body Rules

The detail page (`src/components/solutions/solution-detail.tsx`) renders `solution.title` as the page H1 and the description below it from the registry, then renders the markdown body underneath. To keep the rendered page from showing two stacked titles and to keep the registry as the single source of truth:

- **Do not start `content/solutions/<slug>.md` with a `# ` H1 heading.** The first line of the file must be the opening paragraph (lede).
- **Do not use a setext H1 (`===` underline).** Same reason.
- **Section headings start at `## `** and may go deeper (`###`, `####`).
- **Do not include frontmatter.** `prependSolutionFrontmatter` (in `api/content-markdown.ts`) builds the served frontmatter entirely from the registry whenever the markdown is fetched as `.md` or via the docs MCP server. Any frontmatter in the source file is stripped before serving, so embedding it just creates drift.

These rules are enforced mechanically by `scripts/validate-content.mjs`, which fails the pre-commit hook if any solution markdown contains a `# ` ATX heading or a setext H1 underline.

### Authoring Steps

1. Add the registry entry in `src/lib/solutions/solutions.ts` with `type: "native"`, the canonical `title` / `description`, `tags`, `authors` (IDs from `src/lib/solutions/authors.ts`), and an ISO `publishedAt` (`YYYY-MM-DD`).
2. Author `content/solutions/<slug>.md`. Open with the lede paragraph (no heading), then organize the rest with `## ` and deeper headings.
3. Use root-relative DevHub links (see [Link Style](#link-style-use-relative-urls-for-devhub-pages)) — the same rule that applies to recipes and docs.
4. Run `npm run validate:content && npm run typecheck && npm run build` to confirm the registry, slug, and H1 rule all pass before committing.

## URL Structure

All templates share a flat URL hierarchy:

| Internal kind | Public URL          | Route source                                                               |
| ------------- | ------------------- | -------------------------------------------------------------------------- |
| `recipe`      | `/templates/<slug>` | Generated by content-entries plugin from `content/recipes/<slug>/goal.md`  |
| `cookbook`    | `/templates/<slug>` | Manual page in `src/pages/templates/<slug>.tsx`                            |
| `example`     | `/templates/<slug>` | Generated by content-entries plugin from `content/examples/<slug>/goal.md` |

Slugs must be globally unique. The plugin throws at build time if any collision exists.

## Writing Style

- Use "template" in every public string. Never write "recipe", "cookbook", "guide", or "guides" in titles, descriptions, intros, prerequisites, or references that ship to the site, `llms.txt`, or `/templates.md`.
- Write in imperative voice.
- Prefer short paragraphs and explicit headings.
- Explain why a step exists only when that context prevents mistakes.
- Optimize for copy/paste reliability first, then polish readability.
- Keep one outcome per recipe; move additional outcomes into separate recipes.
- Keep cookbook narrative coherent from setup through final verification.
- Keep example markdown focused on what makes the example unique (data flow, architecture, adaptation points) — the included templates cover the how-to details.

### Link Style: Use Relative URLs For DevHub Pages

When linking to another DevHub page (`/templates/...`, `/docs/...`, `/solutions/...`) from any markdown content (`content/**/*.md`, `docs/**/*.md`, intent files, dev-guidelines, about), use a **root-relative** path. Never hardcode `https://developers.databricks.com/<path>` inside markdown link or autolink syntax.

- Good: `[Spin Up a Databricks App](/templates/spin-up-databricks-app)`
- Bad: `[Spin Up a Databricks App](https://developers.databricks.com/templates/spin-up-databricks-app)`
- Good: `</llms.txt>` and `[ref]: /docs/start-here`
- Bad: `<https://developers.databricks.com/llms.txt>` and `[ref]: https://developers.databricks.com/docs/start-here`

`absolutizeMarkdown` in `src/lib/copy-preamble.ts` rewrites every root-relative link to the caller's origin when a page or markdown payload is served (Vercel functions, MCP server, in-browser "Copy as Markdown"), so relative links work transparently in `localhost:3001`, preview deployments, and production. Hardcoding the canonical origin makes in-site navigation a full reload and sends local-dev visitors to prod.

`scripts/validate-content.mjs` enforces this rule and fails the build on `https://developers.databricks.com/(templates|docs|solutions)/...` references inside markdown link, autolink, or reference-definition syntax.

Allowed exceptions (the validator skips these):

- Bare textual URLs in prose that identify the site or are agent fetch directives (e.g. `Website: https://developers.databricks.com`, "fetch the index from `https://developers.databricks.com/llms.txt`"). `rewriteOrigin` substitutes the canonical origin at copy time, so these still resolve correctly.
- URLs inside fenced code blocks (e.g. `npx add-mcp https://developers.databricks.com/api/mcp` — the install command must be canonical).
- External links (`github.com/...`, `docs.databricks.com/...`, etc.) — always absolute.

## Validate Before Finishing

1. Verify every referenced template id exists in the registry.
2. Verify every markdown import path resolves.
3. For cookbooks: verify `recipeIds` order matches the rendered JSX order.
4. Verify prerequisites are only used on recipes.
5. Verify no `goal.md` file contains prerequisite content — that lives only in `prerequisites.md`.
6. Verify title, description, and tags are specific (not generic) and do **not** contain the words "recipe", "cookbook", or "guide".
7. Verify commands are runnable and do not skip required auth/profile context.
8. Verify no slug collisions across recipes, cookbooks, and examples.
9. Verify the output reads cleanly as a prompt for an AI coding agent.
10. Run `npm run validate:content && npm run fmt && npm run typecheck && npm run build && npm run test`.
11. For examples: verify `examples/<slug>/` contains only `REPLACE_ME` placeholders — no real workspace hosts, warehouse IDs, Lakebase project names, or Genie space IDs.
12. For examples: verify `examples/<slug>/template/README.md` covers provisioning (manual vs SQL), seeding, pipeline deploys, and app deploy end-to-end.
13. For examples: verify the dry-run deploy succeeded and the app is functional before considering the example complete.

## References

- Read `content/recipes/set-up-your-local-dev-environment/goal.md` for atomic-template goal structure and tone.
- Read `content/examples/agentic-support-console/goal.md` for example-template goal style.
- Read `src/lib/recipes/recipes.ts` for all type contracts (`Recipe`, `Cookbook`, `Example`).
- Read `src/pages/templates/app-with-lakebase.tsx` for the cookbook composition pattern.
- Read `src/components/examples/example-detail.tsx` for example detail rendering.
- Read `examples/agentic-support-console/template/README.md` for a full example runbook (provisioning, SQL, seed, pipelines, deploy).
- Read `plugins/content-entries.ts` for slug parity and uniqueness validation.
