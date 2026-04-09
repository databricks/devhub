---
title: Getting Started
---

# Getting Started

Set up your local environment and connect to your Databricks workspace.

## Prerequisites

- Databricks workspace with permissions to create resources
- Databricks CLI `v0.295+` ([install guide](/docs/tools/databricks-cli#install))

## Install the CLI

Homebrew (macOS/Linux):

```bash
brew tap databricks/tap
brew install databricks
```

Or use the curl installer (all platforms):

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

See the [full install guide](/docs/tools/databricks-cli#install) for WinGet, Chocolatey, and manual options.

## Authenticate

```bash
databricks auth login --host <workspace-url>
```

This opens a browser for OAuth login and saves a local profile to `~/.databrickscfg`. Profiles store workspace URL and credentials locally so you don't re-authenticate each time. Use `--profile <name>` to manage multiple workspaces.

Confirm your profiles:

```bash
databricks auth profiles
```

## Verify

```bash
databricks workspace list / --profile <PROFILE>
```

The `/` lists the workspace root. If it returns results, your CLI is authenticated and ready.

## Next steps

- [Your First App](/docs/get-started/your-first-app): deploy an app using a template and an AI coding agent
- [Apps](/docs/apps/getting-started): scaffold and deploy web applications with AppKit
- [Lakebase](/docs/lakebase/getting-started): provision managed PostgreSQL for transactional workloads
- [Agents](/docs/agents/getting-started): build and deploy AI agents
- [Core Concepts](/docs/get-started/core-concepts): how the platform layers fit together

## Further reading

- [Install or update the Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/install)
- [Authentication for the Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/authentication)
