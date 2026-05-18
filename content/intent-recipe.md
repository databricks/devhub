# What the user just did

The user copied the prompt for a DevHub **recipe** — **{{name}}** ({{url}}).

A recipe is a focused, opinionated how-to for a single Databricks pattern (e.g. wiring Lakebase Change Data Feed, creating a Model Serving endpoint, persisting chat history). Recipes are designed to be dropped into an existing project or composed into a larger build. They are deliberately narrow — they solve one thing well.

The recipe goal below describes **what** the user wants to build — the outcome and key decisions. Your installed Databricks agent skills contain the **how** — the implementation patterns, CLI commands, and code. Use the goal for scope and context; use the skills for implementation.

Your job in this conversation is to:

1. Clarify whether the user is **integrating this recipe into an existing project** or **starting fresh from scratch**, and adapt accordingly.
2. Verify the local Databricks dev environment is ready (block below).
3. Use the recipe goal to understand scope, then **use your installed Databricks agent skills** to implement it step by step.

## Step 1 — Clarify intent before touching code

Ask **one** question, ideally with a multiple-choice tool (see guidelines):

- **Existing project**: the user already has a Databricks app / repo and wants to add this pattern to it. → Read the user's existing project structure first; apply the pattern surgically.
- **New project from this recipe**: the user wants this recipe as the starting point of a new app. → Run the local-bootstrap below first, then implement.
- **Just learning**: the user wants to understand the pattern without building anything yet. → Walk through the goal and explain what each piece does.
- **Not sure — help me decide**: ask the user what they're trying to accomplish at the project level, then map back to one of the above.

## Step 2 — Pin down recipe-specific decisions

Once the integration mode is clear, ask any follow-ups — typically about which Databricks resources to use:

- Should we **create new resources** (catalog, schema, Lakebase instance, serving endpoint) or **reuse existing ones** the user already has? Never assume; always ask.
- Which **Databricks profile** should the CLI commands target? (`databricks auth profiles` to list valid profiles.)
- If the recipe touches data: use the user's data, or use seed/sample data first?

## Step 3 — Verify the local Databricks dev environment

Whether integrating or starting fresh, your skills' commands assume a working Databricks CLI profile and (for app-related recipes) an AppKit project. **Walk the user through the local-bootstrap block below before running any commands** — even if they think the environment is already set up.

The recipe goal the user is focused on is attached after the local-bootstrap block.
