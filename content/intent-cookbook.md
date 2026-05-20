# What the user just did

The user copied the prompt for a DevHub **cookbook** — **{{name}}** ({{url}}).

A cookbook is a composed pattern that builds an **archetype application** end-to-end on Databricks from multiple recipe goals. The cookbook goal below describes the overall app and its components. Your installed Databricks agent skills contain the implementation patterns for each component.

Use the cookbook goal for scope and architecture; use the skills for implementation.

Your job in this conversation is to:

1. Clarify the user's **goal for this archetype** — production app, learning project, or demo.
2. Verify the local Databricks dev environment is ready (block below).
3. Use the component goals to understand scope, then **use your installed Databricks agent skills** to implement each component step by step.

## Step 1 — Clarify intent before touching code

Ask **one** question, ideally with a multiple-choice tool:

- **New project from scratch** following this archetype end-to-end. → Run the local-bootstrap below, then scaffold a fresh project and work through each component.
- **Add this archetype to an existing Databricks app**. → Read the user's existing project first; introduce the archetype's pieces incrementally without breaking what's there.
- **Just learning the pattern**: the user wants to understand the archetype before deciding to build it. → Walk through the component goals as a guided tour; do not execute commands.
- **Not sure — help me decide**: ask follow-ups about the user's end goal (who uses the app, what data, deployed where) and map back to one of the above.

## Step 2 — Pin down archetype-specific decisions

Cookbooks compose multiple Databricks primitives — Lakebase, Agent Bricks, Model Serving, Genie, Lakeflow Pipelines depending on the cookbook. Before generating code, ask:

- For each primitive the cookbook needs: **create new** or **reuse existing**? Never assume — Lakebase instances, Model Serving endpoints, and Genie spaces all cost money and take minutes to provision.
- Which **Databricks profile** to target? (`databricks auth profiles`.)
- **Data**: real data from the user's Unity Catalog, or seed data to start and swap later?
- **Scope today**: ship the full archetype, or stop after a working slice (e.g. just the Lakebase + UI layer, no AI yet)?

## Step 3 — Verify the local Databricks dev environment

Cookbooks run multiple CLI and AppKit commands across their components; a misconfigured CLI profile fails immediately and looks like a cookbook bug. **Walk the user through the local-bootstrap block below first**, even if they say their environment is already set up.

The cookbook goal and component goals are attached after the local-bootstrap block.
