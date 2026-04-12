# Resource Quality Checklist

Use this checklist after drafting and before final handoff.

## Scope Correctness

- Confirm a recipe solves exactly one outcome.
- Confirm a cookbook covers an end-to-end use case.
- Confirm an example ships a full working codebase with deployable artifacts.
- Confirm cookbook content does not depend on cookbook-level prerequisites.
- Confirm example markdown focuses on what makes it unique (architecture, data flow, adaptation points).

## Metadata Correctness

- Confirm each recipe has `id`, `name`, `description`, `tags`, and `services`.
- Confirm prerequisite recipe ids exist and are minimal.
- Confirm each template uses valid `recipeIds` in intended order.
- Confirm each example uses valid `templateIds` and `recipeIds` without redundancy.
- Confirm names and descriptions are specific enough to scan quickly on `/resources`.
- Confirm no slug collisions exist across recipes, templates, and examples.

## Execution Quality

- Confirm every command block is copy-pastable.
- Confirm user-specific values are placeholders (`<...>` in recipes, `REPLACE_ME` in example bundle configs).
- Confirm auth/profile requirements appear before commands that depend on them.
- Confirm there are no hidden assumptions between steps.

## Readability Quality

- Confirm sections are clearly numbered in execution order.
- Confirm each step has short explanatory context before commands.
- Confirm text remains understandable without requiring code execution.
- Confirm reference links are minimal and relevant.

## Cookbook Composition Quality

- Confirm `rawMarkdown` concatenation uses `\n\n---\n\n`.
- Confirm JSX render order matches `template.recipeIds`.
- Confirm every imported markdown component is rendered exactly once unless intentional.

## Example Quality

- Confirm example app directory is named `template/` (for `databricks apps init --template` compatibility).
- Confirm optional `pipelines/`, `seed/`, and `provisioning/sql/` live under `template/` (not only at `examples/<id>/` root).
- Confirm **`template/README.md`** is the full runbook: provisioning order (SQL vs manual vs bundles), seeding commands, pipeline and app deploy, and optional `databricks apps init` scaffold URL.
- Confirm all workspace-specific values use `REPLACE_ME` placeholders.
- Confirm `.databricks/`, `node_modules/`, and `.env` are not committed.
- Confirm pipeline SQL uses schema-qualified names (not hardcoded catalog names).
- Confirm `initCommand` in `recipes.ts` uses clone + `cd` into `devhub/examples/<id>/template` (see `createExample()` / example detail page); optional CLI scaffold uses `https://github.com/databricks/devhub/tree/main/examples/<id>`.
- Confirm hero image exists at `static/img/examples/<id>.svg` (or `.png`).
- Confirm `content/examples/<id>.md` exists and matches the example's `id`, and points readers at `template/README.md` for setup.
