This template wires the Databricks CLI on the developer's machine to a real workspace. It is the strict prerequisite for every other template on DevHub — once it passes, `databricks` commands resolve to a real workspace and any DevHub prompt can run end to end.

- **A Databricks workspace you can sign in to.** Have the workspace URL handy (e.g. `https://<workspace>.cloud.databricks.com`); you will paste it into `databricks auth login` in step 3. If you do not have access, ask your workspace admin.
- **A terminal on macOS, Windows, or Linux.** All install paths run from a terminal session. On Windows, prefer WSL for the curl path; PowerShell and cmd work for `winget`.
- **Permission to install software on this machine.** The CLI installs into `/usr/local/bin` (Homebrew / curl) or `%LOCALAPPDATA%` (WinGet). If `/usr/local/bin` is not writable, rerun the curl installer with `sudo`.
