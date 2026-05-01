This template scaffolds a fresh AppKit Databricks App from scratch using `databricks apps init`. Use it when the user wants the smallest possible Databricks App as a starting point — you can layer plugins, routes, and deploy from here.

- **A working Databricks CLI profile.** The init flow calls the workspace API to resolve the AppKit template registry and any `--features` resource bindings, so it fails immediately without auth. If `databricks auth profiles` does not show a `Valid: YES` profile, run [Set Up Your Local Dev Environment](https://dev.databricks.com/templates/set-up-your-local-dev-environment) first.
- **Permission to deploy Databricks Apps in the target workspace.** This template ends with `databricks apps deploy`. If Apps is not enabled for the user's identity, deploy fails with `PERMISSION_DENIED`.
- **Node.js `22+` and `git` on PATH.** AppKit projects are Node/TypeScript and `npm install` runs against the public registry.
- **An app name and description in mind.** Names must be lowercase, hyphenated, and ≤ 26 characters. Ask the user for a name and a one-sentence description before running `apps init`.
