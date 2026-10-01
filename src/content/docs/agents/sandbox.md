---
title: Databricks Sandbox
sidebar_label: Sandbox
description: "Run agents and AI-written code in an isolated, serverless Databricks Sandbox with a persistent home directory. Drive it from the Python SDK or SSH in."
sourceOfTruth:
  docs:
    - https://docs.databricks.com/aws/en/compute/serverless/sandbox
    - https://docs.databricks.com/aws/en/compute/serverless/sandbox-usage-guide
    - https://docs.databricks.com/aws/en/dev-tools/cli/reference/sandbox-commands
  note: "No agent skill covers Databricks Sandbox yet. Size, storage, quotas, region support, and pricing are owned by the canonical docs. SDK and CLI behavior was verified against databricks-sdk and Databricks CLI v1.17 in a live workspace."
---

# Databricks Sandbox

:::note[Beta]

Databricks Sandbox is in [Beta](https://docs.databricks.com/aws/en/release-notes/release-types). A workspace admin enables it with the **Databricks Sandbox** setting on the workspace [Previews page](https://docs.databricks.com/aws/en/admin/workspace-settings/manage-previews).

:::

**Databricks Sandbox** gives an agent an isolated, serverless Linux machine in your workspace where it can write and run code, install packages, edit files, and call tools, away from your app, your laptop, and your production systems. Each sandbox comes with Python, Node.js, and the Databricks CLI already signed in to your workspace, keeps a persistent home directory across restarts, and runs without your machine staying on.

## What you can use a sandbox for

| Use case                          | What the sandbox does                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Run code an agent writes**      | Executes model-generated Python or shell code as a code interpreter, for example to analyze data and return a result or chart.       |
| **Give a coding agent a machine** | Clones a repository, installs dependencies, runs tests and builds, and iterates on failures, without touching your laptop.           |
| **Run long or background tasks**  | Keeps an agent harness such as Claude Code or Codex working on a multi-hour task, or runs a background worker, after you disconnect. |
| **Run untrusted code**            | Isolates code your users submit, or packages you haven't vetted, from your app and its credentials.                                  |
| **Evaluate agents**               | Gives each evaluation task its own clean environment, so one run can't affect the next.                                              |

Code in a sandbox can call your workspace through the signed-in Databricks CLI, and it has open outbound network access. Before you run code you don't trust, make sure that access is acceptable for it.

## Prerequisites

- A workspace in a [supported region](https://docs.databricks.com/aws/en/resources/feature-region-support) with the Databricks Sandbox preview enabled.
- For the SDK, Python 3.10 or above and the Databricks SDK for Python: `pip install --upgrade databricks-sdk`.
- For SSH, the [Databricks CLI](/docs/tools/databricks-cli), [authenticated](/docs/tools/databricks-cli#authenticate) to your workspace.

## Run code from your agent with the SDK

The Python SDK is the recommended way to drive a sandbox from code. This example creates a sandbox, runs a command, and stops it:

```python title="example.py"
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.sandbox import Sandbox

w = WorkspaceClient()

sandbox = w.sandbox.create_sandbox(sandbox=Sandbox(), sandbox_id="my-sandbox")
name = sandbox.name  # "sandboxes/my-sandbox"

# Wait until w.sandbox.get_sandbox(name).status.state is SANDBOX_STATE_RUNNING, then:
result = w.sandbox.execute_command_sync(
    name,
    "/bin/bash",
    args=["-c", "python3 --version && echo done > /home/sandbox-agent/status.txt"],
)
print(result.exit_code, result.stdout, result.stderr)

w.sandbox.stop_sandbox(name)  # Releases compute; the home directory is kept.
```

`execute_command_sync` runs a program directly, without a shell, so wrap shell syntax in `/bin/bash -c`. Commands run as the `sandbox-agent` user, but `$HOME` isn't set to the home directory, so write persistent files to the absolute path `/home/sandbox-agent`.

To resume, call `start_sandbox(name)`. To remove the sandbox and its home directory, call `delete_sandbox(name)`. For updating the idle timeout, listing sandboxes, and the full client, see [Create and manage sandboxes with the SDK](https://docs.databricks.com/aws/en/compute/serverless/sandbox-usage-guide).

## Work in a sandbox over SSH

To run a coding agent or IDE session that keeps going without your machine, create a sandbox and SSH in with the CLI:

```bash
databricks sandbox register    # Generate and register an SSH key for this machine
databricks sandbox create      # Create a sandbox; it becomes your default
databricks sandbox ssh         # Connect to your default sandbox
```

Inside the sandbox, the Databricks CLI is already authenticated to your workspace. On your first connection, Databricks configures common coding agents, such as Claude Code and Codex, to call models through [Unity Gateway](/docs/unity-gateway/overview) when your workspace has it set up. Add Git credentials yourself if you clone private repositories.

To manage sandboxes, use `databricks sandbox list`, `stop`, `start`, and `delete`. To change when one auto-stops, run `databricks sandbox config <sandbox-id> --idle-timeout 1h`. For every command, see the [CLI reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/sandbox-commands).

## What a sandbox keeps

- **Home directory:** `/home/sandbox-agent` persists across stops and starts until you delete the sandbox. Keep installed packages, repositories, and configuration here, because the environment outside it resets.
- **Everything else:** files outside the home directory, including `/tmp`, are deleted when the sandbox stops.
- **Network:** outbound access is open and not configurable, and inbound access is closed.
- **Compute:** each sandbox has 4 vCPUs and 8 GB of RAM. The size isn't configurable.

A stopped sandbox still stores its home directory, so delete sandboxes you no longer need. For storage limits, quotas, and pricing, see [Databricks Sandbox](https://docs.databricks.com/aws/en/compute/serverless/sandbox#limitations).

## Where to next

- [Omnigent](/docs/omnigent/overview), which runs coding agents on Databricks Sandbox for you.
- [Agent Bricks CLI](/docs/agents/cli) to build and deploy an agent.
- [Unity Gateway](/docs/unity-gateway/overview) to govern the model calls that agents in a sandbox make.
