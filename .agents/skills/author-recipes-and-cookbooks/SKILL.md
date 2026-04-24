---
name: author-recipes-and-cookbooks
description: Author and maintain DevHub templates on `dev.databricks.com/templates`, including standalone recipes (`content/recipes/*.md`), cookbooks (metadata in `src/lib/recipes/recipes.ts` plus composition pages in `src/pages/templates/*.tsx`), and examples (`content/examples/*.md` plus full app code in `examples/`). Use when creating a new recipe, updating an existing recipe, creating a new cookbook from multiple recipes, creating a new example with full working code, adjusting prerequisites/tags/descriptions, or rewriting content to be both copy-pastable for coding agents and readable for humans.
---

# Author Recipes, Cookbooks, And Examples

## Overview

Use this skill to add or update DevHub templates with consistent structure, metadata, and writing quality.
Treat each template as both an execution prompt for agents and a learning guide for humans.

## Template Hierarchy

Three tiers of templates exist, from atomic to comprehensive:

1. **Recipe** -- one atomic guide for exactly one outcome.
2. **Cookbook** -- a complete end-to-end use case composed from multiple recipes.
3. **Example** -- a full working codebase that combines cookbooks and recipes with additional narrative and deployable code.

All three live at `/templates/:id` (flat URL hierarchy).

## Use The Shared Vocabulary

- In the UI, recipes, cookbooks, and examples are all called "Templates" (no recipe/cookbook/example distinction shown to users).
- All template slugs must be globally unique across recipes, cookbooks, and examples. The content-entries plugin validates this at build time.

One word for all: Templates

## Choose The Authoring Path

1. Determine whether the request is a recipe, a cookbook, an example, or a combination.
2. If the request is one atomic task, author a recipe.
3. If the request is a full use case with multiple milestones, author a cookbook that composes recipes.
4. If the request is a complete deployable application with code, pipelines, and infrastructure, author an example.
5. Reuse existing recipes where possible before creating new ones.

## Author A Recipe

1. Create or update `content/recipes/<recipe-id>.md`.
2. Use a slug-style `recipe-id` that matches the filename.
3. Start the file with:
   - `## <Recipe Title>`
   - one concise outcome sentence
4. Organize steps as numbered H3 sections (`### 1. ...`, `### 2. ...`).
5. Keep each step executable:
   - include exact commands in fenced `bash` blocks
   - use placeholders like `<PROFILE>` and `<workspace-url>` where user-specific values are required
   - explain only what is needed to run the step safely
6. End with `#### References` and only high-signal links.
7. Update `src/lib/recipes/recipes.ts`:
   - add or update the recipe in `recipes`
   - include `id`, `name`, `description`, `tags`, `services`
   - set `prerequisites` only when strictly required
   - place the recipe in `recipesInOrder`
8. Keep recipe metadata and markdown content aligned (name, intent, and scope must match).
9. Verify the slug does not collide with any existing template or example id.

## Author A Cookbook

1. Confirm the cookbook covers a full standalone use case.
2. Select recipes in the intended execution order.
3. Update `src/lib/recipes/recipes.ts`:
   - add or update an entry in `cookbooks`
   - set `id`, `name`, `description`, `recipeIds`
   - rely on `createCookbook()` to derive `tags` and `services`
4. Create or update `src/pages/templates/<cookbook-id>.tsx` using the existing cookbook pattern:
   - import `CookbookDetail`, `templates`, `useAllRawRecipeMarkdown`
   - import each recipe markdown module from `@site/content/recipes/...`
   - select cookbook via `cookbooks.find((t) => t.id === "<cookbook-id>")`
   - build `rawMarkdown` from `cookbook.recipeIds` joined with `\n\n---\n\n`
   - render recipes in the same order as `recipeIds`, separated with `<hr />`
5. Keep cookbook pages declarative and minimal; avoid extra logic not needed for composition.
6. Verify the slug does not collide with any existing recipe or example id.

## Author An Example

An example is a full working codebase with narrative markdown. It combines cookbooks and recipes as "included resources" and ships deployable code.

### 1. Create The Example Code

Create a directory under `examples/<example-id>/` with this structure:

```
examples/<example-id>/
  template/                    # full runnable tree (AppKit app + optional pipelines/seed/provisioning)
    README.md                  # canonical provisioning, SQL, seed, and deploy instructions
    databricks.yml             # bundle config with REPLACE_ME placeholders
    app.yaml                   # runtime env from bundle resources
    package.json               # app dependencies
    appkit.plugins.json        # plugin manifest
    server/                    # Express backend
    client/                    # React frontend
    config/queries/            # SQL query files
    provisioning/sql/          # optional baseline SQL (Unity Catalog, Postgres, etc.)
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

- The app directory MUST be named `template/` (not `app/`) so that `databricks apps init --template` works.
- **All runnable assets for the example** (app, optional `pipelines/`, `seed/`, `provisioning/sql/`) live **under** `template/`. Do not leave `pipelines/` or `seed/` only at `examples/<example-id>/` root; the template subtree is what users clone into or scaffold, and `template/README.md` must describe the full path from zero to deployed app.
- Use `REPLACE_ME` placeholders for all workspace-specific values (host, warehouse ID, catalog name, Lakebase project, etc.).
- Never commit workspace-specific values, `.databricks/`, `node_modules/`, or `.env` files.
- Pipeline SQL files should use schema-qualified names (e.g., `silver.users`) and rely on the pipeline YAML `catalog` setting for catalog resolution.
- Include an `.npmrc` pointing to `https://npm-proxy.dev.databricks.com/` if the app uses `@databricks/appkit`.
- SQL files in `config/queries/` run against the **Databricks SQL Warehouse** (Spark SQL dialect), NOT Lakebase Postgres. Use `CURRENT_DATE()` not `NOW()`, `DATE_ADD(d, n)` not `d + INTERVAL`, `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` not `COUNT(*) FILTER (WHERE ...)`. Reference Unity Catalog three-part names (e.g., `catalog.schema.table`).

### `template/README.md` (canonical runbook)

This file is the **single source of truth** for operators and coding agents. The example detail page on DevHub points users here via clone + `cd` into `template/`; keep it complete enough to deploy without guessing.

Include, as appropriate for the example:

1. **Architecture** — Short diagram or bullet flow (OLTP → sync → pipelines → app, etc.).
2. **Components** — What lives in `client/`, `server/`, `pipelines/`, `seed/`, and `provisioning/sql/`.
3. **Provisioning** — **Order of operations** (numbered). For each step, state clearly what is:
   - **Runnable SQL** — point to files under `template/provisioning/sql/` (with placeholder names like `__CATALOG_NAME__` documented).
   - **Manual / UI only** — Lakehouse Sync, Sync Tables, Genie space, catalog creation with storage root, etc. (no fake one-size-fits-all SQL).
   - **CLI / bundles** — which directory to `cd` into, `databricks bundle deploy` targets, and dependencies between pipelines and app.
4. **Seeding** — Exact commands from `template/seed/` (`cd seed`, `npm install`, `DATABASE_URL=... npm run seed`). Note any Postgres prerequisites (e.g. `REPLICA IDENTITY FULL`) and whether the seed script applies them or SQL does.
5. **Deploy** — From `template/` (app): install, build, `databricks bundle deploy`. Link pipeline deploys before or after as required.
6. **Optional** — `databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/<example-id>` for users who scaffold instead of cloning the monorepo.

Do **not** maintain a separate long-form `provisioning/README.md` beside the SQL — duplicate instructions drift. Put narrative in `template/README.md` only; keep `provisioning/sql/*.sql` as executable artifacts with brief header comments.

For examples with **no** Unity Catalog DDL (Lakebase-only apps), still add `template/provisioning/sql/` with a short comment-only file (e.g. `00_no_unity_catalog_ddl.sql`) that explains nothing is required and points back to the README — so every example has a predictable place for SQL.

### `examples/README.md` (examples index)

Optional but recommended: describe that each example ships a `template/` folder and that **`template/README.md`** is the runbook; link to the richest example (e.g. agentic support console) for a full-stack pattern.

### Agent skills in templates (optional)

To bundle Databricks agent skills with an example, install into `template/` (e.g. `npx skills add databricks/databricks-agent-skills -a cursor -y`). Commit `.agents/skills/` and `skills-lock.json` under `template/` when present.

### 2. Create The Example Markdown

Create `content/examples/<example-id>.md`:

- Start with `## <Example Title>`.
- Brief motivation (1-2 paragraphs): what it demonstrates and why.
- Data flow or architecture description.
- What the user needs to adapt: which resources to create, which placeholders to fill in, manual steps (like configuring Lakehouse Sync or Sync Tables).
- Add a sentence under **What to Adapt** (or equivalent) that **provisioning, seeding, and deployment** are documented in the repository’s **`template/README.md`** — do not duplicate the full runbook in this markdown; the site example page + GitHub runbook stay in sync that way.
- Keep it short and actionable.

### 3. Register The Example

Update `src/lib/recipes/recipes.ts`:

- Add an entry to `examples` using `createExample()`.
- Set `id`, `name`, `description`, `githubPath`, `initCommand`, `templateIds`, `recipeIds`.
- `templateIds` references cookbooks that the example builds upon.
- `recipeIds` references standalone recipes not already included in a referenced cookbook.
- `createExample()` derives `tags` and `services` from the referenced cookbooks and recipes.
- `initCommand` uses the format: `git clone --depth 1 https://github.com/databricks/devhub.git` then `cd devhub/examples/<example-id>/template` (shown on the example detail page; users follow `template/README.md` for provisioning and deploy). Optional CLI scaffold: `databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/<example-id>`.
- `githubPath` is `examples/<example-id>`.

### 4. Add Preview And Gallery Images (Optional)

Images are **optional**. When omitted, the UI automatically falls back to the generic guide card art — that's fine for a first pass, and the site will look clean either way.

When you add images, they must conform to the DevHub resource-image contract. The pre-commit hook runs `npm run verify:images`; any non-conforming file blocks the commit.

**Contract (enforced):**

- **Aspect ratio:** 16:9 (±2%)
- **Minimum resolution:** 1600×900 px (recommended: 1920×1080)
- **Formats:** PNG, JPEG, or WEBP. SVG is not a valid preview image — the site expects real screenshots at this slot.
- **Storage:** `static/img/examples/<example-id>-<slot>-<theme>.png`, e.g. `saas-tracker-dashboard-light.png` and `saas-tracker-dashboard-dark.png`.

**Always ship both a light and a dark variant.** The site picks the matching image based on the visitor's color mode. If only one variant is set the other mode reuses it, which looks jarring (bright light-mode screenshot flashed onto a dark card, or vice versa). Capture the same screen twice at the same viewport and zoom — once with the app in light mode, once in dark mode — so the two frames align perfectly in the carousel.

**Schema fields on `Example` (all optional, same contract for all three resource types):**

- `previewImageLightUrl` / `previewImageDarkUrl` — single theme-aware preview. Used on the landing carousel card, the `/resources` list card, and the example detail hero when no `galleryImages` are set. Either omit both or provide both.
- `galleryImages?: Array<{ lightUrl: string; darkUrl: string }>` — themed slides for the example detail-page carousel. Each slide must provide both a light and dark URL. Omit when a single preview image is enough.

`Template` and `Recipe` also accept `previewImageLightUrl` / `previewImageDarkUrl` and will surface the image on their `/resources` list and landing cards when set.

**Style the app in the Databricks brand palette before capturing screenshots.** We want example apps to feel like Databricks apps, not generic demos. The site's theme tokens live in `src/css/custom.css`; reuse the same hex values in the example app's own CSS / Tailwind config:

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

Guidance for screenshots:

- **Light mode:** `--db-bg` + `--db-card` surfaces, navy text, orange accents.
- **Dark mode:** `--db-navy` + `--db-navy-light` surfaces, `--db-lava-light` accents, near-white text. Do not use pure-black CSS defaults.
- Use orange (`--db-lava` / `--db-lava-light`) sparingly — primary CTAs, active / selected state, single accents. Avoid saturating whole regions.
- The AppKit defaults already wire these tokens into Tailwind; look at an existing example's `template/client/tailwind.config.ts` as the starting point so new examples are on-brand by default.

**Verify locally:** `npm run verify:images`. The script walks `static/img/examples/` and reports ratio + size issues with a suggested fix per file.

### 5. Verify DevHub Build

Run `npm run fmt && npm run typecheck && npm run build && npm run test` from the repo root. The content-entries plugin validates slug uniqueness and generates routes automatically. No manual page file is needed in `src/pages/resources/` (unlike cookbooks).

### 6. Test With A Dry Run

**Two directories, two purposes.** `examples/` is committed source code with `REPLACE_ME` placeholders. `../../demos/<example-id>/` (outside the repo) is the scratch workspace for installing, configuring, and deploying.

NEVER `npm install`, deploy, or write workspace-specific values inside `examples/`. ALWAYS work from the demos folder outside the repo.

NEVER reuse existing workspace resources (Lakebase projects, Genie spaces, apps, UC catalogs) unless the developer explicitly says to. Always create fresh resources for the dry run to avoid corrupting or overwriting existing data.

The demos folder must be **outside the git repo** because `databricks bundle deploy` respects `.gitignore` and will skip files in gitignored directories.

#### Dry-run workflow

```bash
# 1. Copy the template into demos (outside the repo)
mkdir -p ../../demos/<example-id>
cp -r examples/<example-id>/template/* ../../demos/<example-id>/

# 2. Fill in workspace-specific values
#    Edit ../../demos/<example-id>/databricks.yml — replace REPLACE_ME with real IDs

# 3. Install and build
cd ../../demos/<example-id>
npm install
npm run build

# 4. Create required Databricks resources (use databricks-core and databricks-lakebase skills)
#    - Lakebase project, branch, database
#    - SQL Warehouse (or use default)
#    - Genie Space (if the example uses genie)
#    - Unity Catalog table (if analytics queries need warehouse-accessible data)

# 5. Seed data (if the example has a seed script)
cd <devhub-repo>/examples/<example-id>/template/seed
npm install
DATABASE_URL="postgresql://..." npm run seed

# 6. Deploy from demos
cd ../../demos/<example-id>
databricks apps deploy --profile <PROFILE>

# 7. Get the app URL
databricks apps get <app-name> --profile <PROFILE>
```

#### Fixing issues found during dry run

- **Code bug** (build fails, runtime error, wrong SQL dialect) -- fix in `examples/<example-id>/` in the repo, then re-copy to `../../demos/<example-id>/` and retry.
- **Instruction gap** (missing step, unclear placeholder) -- fix in `content/examples/<example-id>.md` or the relevant recipe in `content/recipes/`.
- **Seed data issue** -- fix in `examples/<example-id>/template/seed/seed.ts`.

#### Cleanup

After verifying the deployed app works, delete `../../demos/<example-id>/`. Optionally tear down test resources (Lakebase project, Genie space, UC catalog) if they were created just for testing.

## URL Structure

All resources share a flat URL hierarchy:

| Resource | URL                        | Route source                                                     |
| -------- | -------------------------- | ---------------------------------------------------------------- |
| Recipe   | `/resources/<recipe-id>`   | Generated by content-entries plugin from `content/recipes/*.md`  |
| Cookbook | `/resources/<template-id>` | Manual page in `src/pages/resources/<template-id>.tsx`           |
| Example  | `/resources/<example-id>`  | Generated by content-entries plugin from `content/examples/*.md` |

Slugs must be globally unique. The plugin throws at build time if any collision exists.

## Apply The Writing Style

- Write in imperative voice.
- Prefer short paragraphs and explicit headings.
- Explain why a step exists only when that context prevents mistakes.
- Optimize for copy/paste reliability first, then polish readability.
- Keep one outcome per recipe; move additional outcomes into separate recipes.
- Keep cookbook narrative coherent from setup to final verification.
- Keep example markdown focused on what makes the example unique (data flow, architecture, adaptation points) -- the included cookbooks cover the how-to details.

## Validate Before Finishing

1. Verify every referenced recipe, template, and example id exists.
2. Verify every markdown import path exists.
3. Verify `template.recipeIds` order matches rendered JSX order (for cookbooks).
4. Verify prerequisites are only used on recipes.
5. Verify title, description, and tags are specific (not generic).
6. Verify commands are runnable and do not skip required auth/profile context.
7. Verify no slug collisions across examples, templates, and recipes.
8. Verify output is usable as:
   - a prompt for an AI coding agent
   - a human step-by-step guide
9. Run `npm run fmt && npm run typecheck && npm run build && npm run test` to confirm everything passes.
10. For examples: verify `examples/<id>/` contains only `REPLACE_ME` placeholders -- no real workspace hosts, warehouse IDs, Lakebase project names, or Genie space IDs.
11. For examples: verify `examples/<id>/template/README.md` covers provisioning (manual vs SQL), seeding, pipeline deploys (if any), and app deploy end-to-end.
12. For examples: verify the dry-run deploy succeeded and the app is functional before considering the example complete.

## References

- Read `content/recipes/databricks-local-bootstrap.md` for recipe structure and tone.
- Read `content/examples/agentic-support-console.md` for example markdown style.
- Read `src/lib/recipes/recipes.ts` for all type contracts (`Recipe`, `Template`, `Example`).
- Read `src/pages/resources/app-with-lakebase.tsx` for cookbook composition pattern.
- Read `src/components/examples/example-detail.tsx` for example detail rendering.
- Read `examples/agentic-support-console/template/README.md` for a full template runbook (provisioning, SQL, seed, pipelines, deploy).
- Read `examples/README.md` for the examples index pattern.
- Read `plugins/content-entries.ts` for slug parity and uniqueness validation.
