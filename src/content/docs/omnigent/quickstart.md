---
title: Omnigent quickstart
sidebar_label: Quickstart
description: Start an Omnigent session on Databricks Sandbox or connect your own machine. Install the CLI, configure model access, register a host, and verify your first agent task.
sourceOfTruth:
  docs:
    - https://docs.databricks.com/aws/en/omnigent/quickstart
    - https://docs.databricks.com/aws/en/omnigent/
    - https://docs.databricks.com/aws/en/omnigent/identity-access
    - https://github.com/omnigent-ai/omnigent#1-install
---

# Omnigent quickstart

Start a coding agent in Omnigent, run your first task, and open the same session on your phone. Choose a Databricks Sandbox or connect your laptop or VM to the managed Omnigent server.

:::note[Beta]

Omnigent on Databricks is in [Beta](https://docs.databricks.com/aws/en/release-notes/release-types). For detailed guides and reference, see the [open-source Omnigent documentation](https://omnigent.ai/).

:::

## Before you start

You need access to a Databricks workspace with the **Omnigent** preview enabled and a region that supports Unity Gateway. A workspace admin can enable the preview from the username menu in the workspace's top bar: select **Previews**, then enable **Omnigent**. See [Manage workspace-level previews](https://docs.databricks.com/aws/en/admin/workspace-settings/manage-previews#workspace) and [regional availability](https://docs.databricks.com/aws/en/resources/feature-region-support). Use the cloud selector in those docs for your workspace's cloud.

Find your **workspace URL**, such as `https://my-workspace.cloud.databricks.com`. Throughout this guide, replace `<workspace-url>` with that full HTTPS URL. Use the workspace URL for CLI and app connections; open `<workspace-url>/omnigent` to use the browser UI.

If a coding agent is helping you set up, give it your workspace URL, preferred host, and the coding agent you want to use, such as Claude Code, Codex, or Pi. For a connected machine, also specify which laptop or VM to register and its operating system. Installation and host commands must run on that machine: running them in a remote development environment registers that environment. Complete browser sign-in and interactive credential choices when prompted.

## Choose where your agent runs

Databricks operates the server that coordinates your sessions. The **host** supplies the files, tools, and compute the agent uses. Your host choice also determines how you configure model access and where token usage is billed.

| Host                                                     | Choose it when                                                                                                        | Model access and usage                                                                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Databricks Sandbox**](#start-with-databricks-sandbox) | You want a managed cloud environment that keeps running when your laptop is off. No local CLI installation is needed. | Uses workspace models through **Unity Gateway**. Token usage is governed and billed through Databricks; no provider API keys are needed.                                        |
| [**Your laptop or VM**](#connect-your-own-machine)       | Your agent needs a repository, tools, or network access on that machine. Keep the machine and host process running.   | Reuses supported model configuration and credentials on your machine. Usage follows the configured provider's billing. You can also select Databricks to use **Unity Gateway**. |

Both paths use your workspace identity and the same workspace UI. Follow the setup linked in the table, then [try your first session](#try-your-first-session).

## Start with Databricks Sandbox

Databricks provisions the host and configures model access through your workspace's Foundation Model APIs and **Unity Gateway**. Token usage is governed and billed through Databricks. You do not configure provider API keys for this path.

Your workspace also needs the **Sandbox** preview enabled and support for Databricks Sandbox in its cloud and region. Ask a workspace admin to enable the preview; the Sandbox docs call the setting **Databricks Sandbox**. Check the [Sandbox requirements](https://docs.databricks.com/aws/en/compute/serverless/sandbox) and [managed Omnigent limitations](https://docs.databricks.com/aws/en/omnigent/#limitations) before continuing. Databricks Sandbox does not support workspaces with serverless egress controls enabled.

1. Sign in to your workspace and open `<workspace-url>/omnigent`.
2. Select **New session**.
3. Open the host picker and select **Sandbox**.
4. Choose an available coding agent in the session composer, then send the [first task below](#try-your-first-session).

If **Sandbox** is unavailable, check the preview and regional requirements or use your own machine.

## Connect your own machine

Omnigent can reuse the model configuration and credentials already on your machine. Use `omni setup` below to confirm the detected configuration or choose another provider, including Databricks through Unity Gateway.

### 1. Install the prerequisites

On the machine you are registering, install:

- **Python 3.12+**, used to run Omnigent.
- **Node.js 22 LTS or newer** with **npm**, used by coding-agent runtimes. See [Node.js downloads](https://nodejs.org/en/download).
- **Git**, used for repositories and coding-agent workflows.
- **tmux** on macOS or Linux. Install it with `brew install tmux` on macOS or your Linux package manager.
- **bubblewrap** on Linux for the native coding harnesses' OS sandbox. On Ubuntu or Debian, run `sudo apt-get install tmux bubblewrap`. macOS uses its built-in sandbox.
- The **Databricks CLI**, used by Omnigent's workspace sign-in flow.

To install the Databricks CLI on macOS or Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

On Windows, use PowerShell:

```powershell
winget install Databricks.DatabricksCLI
```

If the installer cannot write its destination, follow the [Databricks CLI installation guide](/docs/tools/databricks-cli#install-or-upgrade). Check the tools before continuing:

```bash
node --version
npm --version
git --version
databricks --version
```

On macOS or Linux, also run `tmux -V`; on Linux, run `bwrap --version`. Install any missing tools before starting an agent.

### 2. Install Omnigent

On macOS or Linux, install Omnigent with the `databricks` integration:

```bash
curl -fsSL https://omnigent.ai/install.sh | sh -s -- --extra "databricks"
```

The installer checks the toolchain and uses uv to install Omnigent with Python 3.12. Follow any prompts for missing dependencies.

On Windows, or if you already use [uv](https://github.com/astral-sh/uv#installation), install it with:

```bash
uv tool install --python 3.12 "omnigent[databricks]"
```

The `databricks` extra adds the managed-platform integration. The `omni` and `omnigent` commands are aliases. Open a new terminal if the installer changed your PATH, then check:

```bash
omni --version
omni host --help
```

Use Omnigent 0.16.0 or later for the host commands below. To update an older install, rerun the installer; for uv, rerun the install command with `--force`.

If a uv installation is not on PATH, run `uv tool update-shell` and open a new terminal. Native Windows supports the web UI and supported SDK harnesses; the tmux-based terminal wrappers are unavailable, and file system and network isolation differ. See the [Windows installation notes](https://github.com/omnigent-ai/omnigent#1-install).

### 3. Configure model access

Run the credential wizard in an interactive terminal on the host:

```bash
omni setup
```

Select the harness you want to use. If its CLI is missing or too old, the wizard offers to install or upgrade it. Complete that step before configuring its credentials.

The wizard detects supported credentials already on your machine. Select the existing configuration you want to reuse, or add credentials for another provider.

To use your workspace's Foundation Model APIs, choose **Databricks** when adding credentials, enter your workspace URL, and complete the browser sign-in. Model requests for that harness then use Unity Gateway. Confirm that the wizard shows the harness as configured before exiting.

Credentials are scoped per harness. Configure each harness you plan to use; setting up Claude Code does not automatically configure Codex or Pi. For a connected machine, you can also choose an existing subscription, provider API key, or another gateway offered by the wizard. The [models and credentials guide](https://omnigent.ai/docs/build/models) describes those options.

### 4. Sign in and register the host

Model credentials let an agent call a model. Workspace sign-in connects this machine to the managed server and associates the host with your workspace identity. Complete both steps.

```bash
omni login "<workspace-url>"
```

Complete any browser sign-in, then wait for the command to succeed. Start the host in the background so your terminal or coding agent can continue working:

```bash
omni host --server "<workspace-url>" --background --no-open --non-interactive
omni host status --server "<workspace-url>"
```

`--no-open` leaves navigation to you. `--non-interactive` makes an authentication failure return an error instead of opening another sign-in flow. If it fails, complete `omni login` and retry.

Confirm that status shows the intended server and an online host. An empty status result is not a registered host. You can also request machine-readable output with `omni host status --server "<workspace-url>" --json`.

The background process keeps running after the command returns, but the machine must stay awake and connected. To run the host in the foreground instead, use `omni host --server "<workspace-url>"` and leave that terminal running.

### 5. Start a session

1. Open `<workspace-url>/omnigent` in your browser and sign in with the same workspace identity.
2. Select **New session**.
3. Open the host picker and select the machine you registered.
4. Choose a coding agent whose credentials you configured, then send the [first task below](#try-your-first-session).

## Try your first session

Send this task in the session composer:

```text
Run a shell command to show the current working directory. Then run Python
to calculate the sum of the integers from 1 through 10 and print the result
as "OMNIGENT_READY: 55". Show the command output. Do not modify any files.
```

Check that the session shows a successful tool execution with `OMNIGENT_READY: 55` in its output. The agent's reply alone is not enough: this checks model access, the host connection, and command execution together. If an approval prompt appears, review it and approve the requested task to continue.

You can now give the agent a task in your project. For a connected machine, specify the repository's absolute path and have the agent confirm it can read the project before editing. For a Sandbox, clone or upload the project into that environment first; files on your laptop are not automatically available there.

## Continue from your phone or desktop app

To try mobile immediately, open `<workspace-url>/omnigent` in your phone's browser and sign in with the same workspace identity. Open the session you just verified and send a follow-up message. It should appear in the browser session on your computer too.

For a native app, install the [desktop app](https://omnigent.ai/docs/interact/desktop) or [mobile app](https://omnigent.ai/docs/interact/mobile). Select **Connect to new server** in the desktop app, or enter a server URL when prompted on mobile. Enter your workspace URL and sign in to open your existing sessions.

Your phone accesses the session through the managed server; execution continues on the host you selected. Keep a connected laptop or VM running. If your workspace requires a VPN or restricts allowed IP addresses, your phone must meet those requirements too. See [mobile network access](https://docs.databricks.com/aws/en/omnigent/identity-access#mobile-network-access).

## Troubleshooting

| Symptom                                                 | What to check                                                                                                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Omnigent page does not open, or Sandbox is missing. | Confirm the workspace URL, required previews, and cloud/region availability with a workspace admin. Sandbox has separate requirements.                            |
| `omni` is not found after installation.                 | Open a new terminal. For uv installs, run `uv tool update-shell` first.                                                                                           |
| Login reports a missing Databricks integration or CLI.  | Install `omnigent[databricks]` and confirm `databricks --version` succeeds. Retry `omni login "<workspace-url>"`.                                                 |
| Your machine is missing from the host picker.           | Check `omni host status --server "<workspace-url>"`. Confirm that the CLI and browser use the same workspace and identity, and that the machine is online.        |
| The host is online but the agent cannot call a model.   | Rerun `omni setup` on that host for the selected harness. For Databricks model permission errors, ask your workspace admin to check access to the selected model. |
| A native coding agent fails to start.                   | Check Node.js, npm, and tmux; on Linux, check bubblewrap. Review any harness-install error. Native Windows does not support the tmux-based wrappers.              |
| The session works on your computer but not your phone.  | Connect to the workspace URL, sign in with the same identity, and check VPN or workspace network restrictions.                                                    |

## Stop a connected host

When you have finished the work running on your laptop or VM, stop the host for this workspace:

```bash
omni host stop --server "<workspace-url>"
```

This stops that host's running sessions and host process. It leaves the managed Omnigent server running. Start the host again with the registration command when you want to resume using the machine.

## Where to next

- [Omnigent overview](/docs/omnigent/overview) for working with multiple coding agents and collaborating with teammates.
- [Identity and access](https://docs.databricks.com/aws/en/omnigent/identity-access) for sharing a session with Read or Edit permissions.
- [DevHub templates](/templates) for a concrete application to build with your agent.
- [Databricks quickstart](https://docs.databricks.com/aws/en/omnigent/quickstart) for the canonical managed setup instructions.
