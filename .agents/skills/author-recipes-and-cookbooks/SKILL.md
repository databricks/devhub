---
name: author-recipes-and-cookbooks
description: Author and maintain DevHub resources on `dev.databricks.com/resources`, including standalone recipes (`content/recipes/*.md`), cookbooks/templates (metadata in `src/lib/recipes/recipes.ts` plus composition pages in `src/pages/resources/*.tsx`), and examples (`content/examples/*.md` plus full app code in `examples/`). Use when creating a new recipe, updating an existing recipe, creating a new cookbook/template from multiple recipes, creating a new example with full working code, adjusting prerequisites/tags/descriptions, or rewriting content to be both copy-pastable for coding agents and readable for humans.
---

# Author Recipes, Cookbooks, And Examples

## Overview

Use this skill to add or update DevHub resources with consistent structure, metadata, and writing quality.
Treat each resource as both an execution prompt for agents and a learning guide for humans.

## Resource Hierarchy

Three tiers of resources exist, from atomic to comprehensive:

1. **Recipe** -- one atomic guide for exactly one outcome.
2. **Cookbook (Template)** -- a complete end-to-end use case composed from multiple recipes.
3. **Example** -- a full working codebase that combines cookbooks and recipes with additional narrative and deployable code.

All three live at `/resources/:id` (flat URL hierarchy). In the UI, cookbooks and recipes are called "Guides" in the UI; examples are "Examples."

## Use The Shared Vocabulary

- Treat `template` and `cookbook` as synonyms in the codebase (the type is `Template`, the UI says "Guide").
- The user-facing filter on `/resources` is "Examples" vs "Guides" (no cookbook/recipe distinction shown to users).
- All resource slugs must be globally unique across examples, templates, and recipes. The content-entries plugin validates this at build time.

One word for all: Resources
Two words for all: Guides and Examples

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

## Author A Cookbook (Template)

1. Confirm the cookbook covers a full standalone use case.
2. Select recipes in the intended execution order.
3. Update `src/lib/recipes/recipes.ts`:
   - add or update an entry in `templates`
   - set `id`, `name`, `description`, `recipeIds`
   - rely on `createTemplate()` to derive `tags` and `services`
4. Create or update `src/pages/resources/<template-id>.tsx` using the existing cookbook pattern:
   - import `TemplateDetail`, `templates`, `useAllRawRecipeMarkdown`
   - import each recipe markdown module from `@site/content/recipes/...`
   - select template via `templates.find((t) => t.id === "<template-id>")`
   - build `rawMarkdown` from `template.recipeIds` joined with `\n\n---\n\n`
   - render recipes in the same order as `recipeIds`, separated with `<hr />`
5. Keep cookbook pages declarative and minimal; avoid extra logic not needed for composition.
6. Verify the slug does not collide with any existing recipe or example id.

## Author An Example

An example is a full working codebase with narrative markdown. It combines cookbooks and recipes as "included resources" and ships deployable code.

### 1. Create The Example Code

Create a directory under `examples/<example-id>/` with this structure:

```
examples/<example-id>/
  README.md                    # setup instructions, architecture overview
  template/                    # the Databricks App (AppKit template format)
    databricks.yml             # bundle config with REPLACE_ME placeholders
    app.yaml                   # runtime env from bundle resources
    package.json               # app dependencies
    appkit.plugins.json        # plugin manifest
    server/                    # Express backend
    client/                    # React frontend
    config/queries/            # SQL query files
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
- Use `REPLACE_ME` placeholders for all workspace-specific values (host, warehouse ID, catalog name, Lakebase project, etc.).
- Never commit workspace-specific values, `.databricks/`, `node_modules/`, or `.env` files.
- Pipeline SQL files should use schema-qualified names (e.g., `silver.users`) and rely on the pipeline YAML `catalog` setting for catalog resolution.
- Include an `.npmrc` pointing to `https://npm-proxy.dev.databricks.com/` if the app uses `@databricks/appkit`.
- SQL files in `config/queries/` run against the **Databricks SQL Warehouse** (Spark SQL dialect), NOT Lakebase Postgres. Use `CURRENT_DATE()` not `NOW()`, `DATE_ADD(d, n)` not `d + INTERVAL`, `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` not `COUNT(*) FILTER (WHERE ...)`. Reference Unity Catalog three-part names (e.g., `catalog.schema.table`).

### 2. Create The Example Markdown

Create `content/examples/<example-id>.md`:

- Start with `## <Example Title>`.
- Brief motivation (1-2 paragraphs): what it demonstrates and why.
- Data flow or architecture description.
- What the user needs to adapt: which resources to create, which placeholders to fill in, manual steps (like configuring Lakehouse Sync or Sync Tables).
- Keep it short and actionable.

### 3. Register The Example

Update `src/lib/recipes/recipes.ts`:

- Add an entry to `examples` using `createExample()`.
- Set `id`, `name`, `description`, `image`, `githubPath`, `initCommand`, `templateIds`, `recipeIds`.
- `templateIds` references cookbooks that the example builds upon.
- `recipeIds` references standalone recipes not already included in a referenced cookbook.
- `createExample()` derives `tags` and `services` from the referenced cookbooks and recipes.
- `image` points to a static SVG/PNG in `static/img/examples/`.
- `initCommand` uses the format: `databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/<example-id> --name <app-name>`.
- `githubPath` is `examples/<example-id>`.

### 4. Add A Hero Image

Place a hero image at `static/img/examples/<example-id>.svg` (or `.png`).
This is shown at the top of the example detail page.

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
cd <devhub-repo>/examples/<example-id>/seed
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
- **Seed data issue** -- fix in `examples/<example-id>/seed/seed.ts`.

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
11. For examples: verify the dry-run deploy succeeded and the app is functional before considering the example complete.

## References

- Read `content/recipes/databricks-local-bootstrap.md` for recipe structure and tone.
- Read `content/examples/agentic-support-console.md` for example markdown style.
- Read `src/lib/recipes/recipes.ts` for all type contracts (`Recipe`, `Template`, `Example`).
- Read `src/pages/resources/app-with-lakebase.tsx` for cookbook composition pattern.
- Read `src/components/examples/example-detail.tsx` for example detail rendering.
- Read `examples/agentic-support-console/` for full example directory structure.
- Read `plugins/content-entries.ts` for slug parity and uniqueness validation.
