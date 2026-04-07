---
name: author-recipes-and-cookbooks
description: Author and maintain DevHub resources on `dev.databricks.com/resources`, including standalone recipes (`content/recipes/*.md`) and cookbooks/templates (metadata in `src/lib/recipes/recipes.ts` plus composition pages in `src/pages/resources/*.tsx`). Use when creating a new recipe, updating an existing recipe, creating a new cookbook/template from multiple recipes, adjusting prerequisites/tags/descriptions, or rewriting content to be both copy-pastable for coding agents and readable for humans.
---

# Author Recipes And Cookbooks

## Overview

Use this skill to add or update DevHub recipes and cookbooks with consistent structure, metadata, and writing quality.
Treat each resource as both an execution prompt for agents and a learning guide for humans.

## Use The Shared Vocabulary

- Treat `template` and `cookbook` as synonyms in this codebase.
- Treat a `recipe` as one atomic guide for exactly one outcome.
- Treat a `cookbook` as a complete end-to-end use case composed from multiple recipes.
- Keep cookbook flows standalone from start to finish.
- Allow recipe prerequisites when needed.
- Avoid cookbook prerequisites.

## Choose The Authoring Path

1. Determine whether the request is a recipe, a cookbook, or both.
2. If the request is one atomic task, author a recipe.
3. If the request is a full use case with multiple milestones, author a cookbook that composes recipes.
4. Reuse existing recipes where possible before creating new ones.

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
   - include `id`, `name`, `description`, `tags`
   - set `prerequisites` only when strictly required
   - place the recipe in `recipesInOrder`
8. Keep recipe metadata and markdown content aligned (name, intent, and scope must match).

## Author A Cookbook (Template)

1. Confirm the cookbook covers a full standalone use case.
2. Select recipes in the intended execution order.
3. Update `src/lib/recipes/recipes.ts`:
   - add or update an entry in `templates`
   - set `id`, `name`, `description`, `recipeIds`
   - rely on `createTemplate()` to derive `tags`
4. Create or update `src/pages/resources/<template-id>.tsx` using the existing cookbook pattern:
   - import `TemplateDetail`, `templates`, `useAllRawRecipeMarkdown`
   - import each recipe markdown module from `@site/content/recipes/...`
   - select template via `templates.find((t) => t.id === "<template-id>")`
   - build `rawMarkdown` from `template.recipeIds` joined with `\n\n---\n\n`
   - render recipes in the same order as `recipeIds`, separated with `<hr />`
5. Keep cookbook pages declarative and minimal; avoid extra logic not needed for composition.

## Apply The Writing Style

- Write in imperative voice.
- Prefer short paragraphs and explicit headings.
- Explain why a step exists only when that context prevents mistakes.
- Optimize for copy/paste reliability first, then polish readability.
- Keep one outcome per recipe; move additional outcomes into separate recipes.
- Keep cookbook narrative coherent from setup to final verification.

## Validate Before Finishing

1. Verify every referenced recipe id exists.
2. Verify every markdown import path exists.
3. Verify `template.recipeIds` order matches rendered JSX order.
4. Verify prerequisites are only used on recipes.
5. Verify title, description, and tags are specific (not generic).
6. Verify commands are runnable and do not skip required auth/profile context.
7. Verify output is usable as:
   - a prompt for an AI coding agent
   - a human step-by-step guide

## References

- Read `content/recipes/databricks-local-bootstrap.md` for recipe structure and tone.
- Read `src/lib/recipes/recipes.ts` for recipe/template metadata contracts.
- Read `src/pages/resources/app-with-lakebase.tsx` for cookbook composition pattern.
- Read `references/quality-checklist.md` before finalizing substantial additions.
