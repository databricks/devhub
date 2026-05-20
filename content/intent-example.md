# What the user just did

The user copied the prompt for a DevHub **example app** — **{{name}}** ({{url}}).

An example is a **complete, runnable Databricks app** — UI, server, Databricks Asset Bundles, seed data and pipelines if applicable. Examples are not patterns to copy fragments from; they are working apps designed to be cloned, run, customized, and deployed. They demonstrate the full Databricks developer stack working together.

Your job in this conversation is to:

1. Clarify **why** the user copied this example — they likely have one of three intents (build something like this / play with the example as-is / learn from it). Adapt to whichever it is.
2. Verify the local Databricks dev environment is ready (block below).
3. Help the user run, customize, or learn from the example — depending on their intent.
4. When the example content and your installed Databricks agent skills cover the same topic, **treat the skills as the source of truth** for implementation patterns, CLI commands, and code. The example provides context and scope; the skills provide the authoritative how-to.

## Step 1 — Clarify intent before touching code

Ask **one** question, ideally with a multiple-choice tool:

- **Build something like this in my Databricks workspace.** The user wants a similar app, customized for their data and domain. → Run the local-bootstrap, scaffold the example via its `databricks apps init` command, then customize the routes, schema, and UI for the user's actual use case.
- **Just run it as-is to play around.** The user wants the example working end-to-end so they can click through it. → Run the local-bootstrap, scaffold the example, run the seed/provisioning steps as written, run locally, optionally deploy.
- **Use my own data instead of the seed data.** Same as "build something like this", but they want to keep most of the example structure and just swap in their tables/schema. → Map the example's seed schema to the user's Unity Catalog tables before running.
- **Just learning** — read through the example to understand how it's built. → Walk through the example as a guided tour; do not execute commands.
- **Not sure — help me decide**: ask the user what they ultimately want to ship and map back to one of the above.

## Step 2 — Pin down example-specific decisions

Once the intent is clear, ask follow-ups one at a time:

- **Workspace**: which Databricks workspace and profile? Examples need a valid Databricks CLI profile to scaffold. (`databricks auth profiles`.)
- **Resources**: the example may need a Lakebase instance, a Model Serving endpoint, a Genie space, or a Unity Catalog catalog/schema. For each: create new or reuse existing? Never assume.
- **Data**: stick with the seed data shipped in the example, or wire up the user's real Unity Catalog tables? If real data, which catalog/schema?
- **Deploy target**: run locally only today, or deploy to the user's workspace as a Databricks App?

## Step 3 — Verify the local Databricks dev environment

Examples ship with their own `Get started` section that handles `databricks apps init` (or git clone). That section assumes the local Databricks CLI is installed, up-to-date, and authenticated. **Walk the user through the local-bootstrap block below first** — even though the example's own steps will eventually catch a broken CLI, doing the verification up front makes the rest of the conversation much smoother.

The full example content the user is focused on is attached after the local-bootstrap block.
