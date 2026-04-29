This template is the workspace entry point — it installs and authenticates the Databricks CLI, scaffolds an app, and deploys it. Verify these basics before starting.

- **A Databricks workspace you can sign in to.** Have the workspace URL (e.g. `https://<workspace>.cloud.databricks.com`) ready; you will pass it to `databricks auth login` in Step 3. If you do not have access, ask your workspace admin.
- **Permission to deploy Databricks Apps in that workspace.** The scaffold ends with `databricks apps deploy`; if Apps is not enabled for your identity, the command fails with `PERMISSION_DENIED` or `not enabled` at the end of the template.
- **A terminal on macOS, Windows, or Linux with Node.js 20+ and `git` installed.** The install script, `databricks apps init`, and `npm install` all run from that terminal.
