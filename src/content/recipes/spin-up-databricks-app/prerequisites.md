This template scaffolds a fresh AppKit Databricks App from scratch using `databricks apps init`. Use it when the user wants the smallest possible Databricks App as a starting point — you can layer plugins, routes, and deploy from here.

- **Permission to deploy Databricks Apps in the target workspace.** This template ends with `databricks apps deploy`. If Apps is not enabled for the user's identity, deploy fails with `PERMISSION_DENIED`.
- **Node.js `22.16+`, `pnpm`, and `git` on PATH.** AppKit projects are Node/TypeScript. The default template uses pnpm: `databricks apps init` installs dependencies with it from the public registry, and the project scripts call it.
- **An app name and description in mind.** Names must be lowercase, hyphenated, and ≤ 26 characters. Ask the user for a name and a one-sentence description before running `apps init`.
