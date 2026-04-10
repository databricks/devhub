---
title: Databricks CLI
---

# Databricks CLI

Use Databricks CLI for repeatable local workflows, deployment automation, and workspace operations.

If you start from a [template](/resources) or recipe, the CLI is part of that workflow—for how DevHub fits together, see [Start here](/docs/start-here).

## Install

This guidance applies to Databricks CLI `0.295+`.

### Linux or macOS (Homebrew, recommended)

```bash
brew tap databricks/tap
brew install databricks
```

### Linux, macOS, or Windows (curl installer)

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

Notes:

- for Windows, Databricks recommends WSL
- if `/usr/local/bin` is not writable on macOS/Linux, rerun with `sudo`
- if the target path already exists, remove the old binary and rerun

### Windows (WinGet)

```bash
winget search databricks
winget install Databricks.DatabricksCLI
```

### Windows (Chocolatey, experimental)

```bash
choco install databricks-cli
```

### Manual source install (all OSes)

Download the matching release zip from the Databricks CLI GitHub Releases page, extract it, and place the `databricks` executable on your `PATH`.

### Verify installation

```bash
databricks -v
# or
databricks version
```

If the CLI is missing or below `0.295`, install or upgrade before continuing.

## Authenticate

Browser-based OAuth (`databricks auth login`) is the default for local and ad-hoc use:

```bash
databricks auth login --host <workspace-url>
```

Use `--profile` for multi-workspace setups.

Confirm configured profiles:

```bash
databricks auth profiles
```

## Profile selection (required)

Always select a profile explicitly before running workspace/resource commands:

1. list profiles with `databricks auth profiles`
2. choose the target profile/workspace
3. run all commands with `--profile <PROFILE>`

Using `--profile` prevents accidental operations in the wrong workspace.

## Typical usage patterns

- workspace and resource inspection
- app sync/deploy workflows
- scripted automation in CI/CD

Quick auth smoke check:

```bash
databricks workspace list / --profile <PROFILE>
```

## Data exploration shortcuts (AI tools)

For table discovery and ad-hoc SQL exploration, prefer the `experimental aitools` commands:

```bash
# discover columns, types, sample rows, and stats
databricks experimental aitools tools discover-schema <CATALOG>.<SCHEMA>.<TABLE> --profile <PROFILE>

# run SQL queries without manually wiring warehouse execution
databricks experimental aitools tools query "SELECT * FROM <CATALOG>.<SCHEMA>.<TABLE> LIMIT 10" --profile <PROFILE>

# resolve default SQL warehouse
databricks experimental aitools tools get-default-warehouse --profile <PROFILE>
```

## Agent skills

Install [agent skills](/docs/tools/ai-tools/agent-skills) to give AI coding assistants Databricks platform knowledge:

```bash
databricks experimental aitools skills install
```

## Command gotchas

- some command groups use positional arguments, not flags
- always validate syntax with `--help` for the exact subcommand

Examples:

```bash
# Unity Catalog uses positional args:
databricks schemas list <CATALOG> --profile <PROFILE>
databricks tables list <CATALOG> <SCHEMA> --profile <PROFILE>
databricks tables get <CATALOG>.<SCHEMA>.<TABLE> --profile <PROFILE>

# check command shape before use:
databricks schemas list --help
```

## Best practices

- prefer OAuth over legacy PAT flows where possible
- keep credentials out of source control
- standardize on named profiles per environment
- use token or OAuth client-credential flows for CI/CD and service automation (no browser step)
- pass `--profile <PROFILE>` on every command in automation and agent workflows
- DevHub **Common** examples assume a single default workspace profile. For CI, agents, and multi-workspace setups, pass `--profile` explicitly or set `DATABRICKS_CONFIG_PROFILE`
- verify CLI command shape with `--help` instead of guessing flags

## Further reading

- [Install or update the Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/install)
- [Authentication for the Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/authentication)
- [Agent skills](/docs/tools/ai-tools/agent-skills)
