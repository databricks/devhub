---
title: Agent Bricks quickstart
sidebar_label: Quickstart
description: Build and deploy your first custom agent on Databricks in a few commands. Scaffold a LangGraph agent with the Agent Bricks CLI, run it locally, and deploy it to the agent runtime with managed memory, sessions, and tracing.
sourceOfTruth:
  docs:
    - /docs/agents/cli
    - https://github.com/databricks/databricks-ai-bridge/blob/main/integrations/agentbricks/README.md
  note: "No agent skill covers the Agent Bricks CLI. This page is a trimmed version of the Develop a new agent steps in /docs/agents/cli; keep the two in sync. Commands follow the databricks-ai-bridge agentbricks README."
---

# Agent Bricks quickstart

:::note[Experimental]

The Agent Bricks CLI is experimental. Commands and behavior can change.

:::

This quickstart takes you from an empty directory to a deployed custom agent with the [Agent Bricks CLI](/docs/agents/cli) (`agentbricks`). The CLI scaffolds the agent from a framework template and sets up model access, memory, sessions, and tracing for you, so you can focus on the agent's logic.

## Prerequisites

- The [Databricks CLI](/docs/tools/databricks-cli), installed.
- Python 3.10 or above, and [`uv`](https://docs.astral.sh/uv/).
- Install the Agent Bricks CLI:

  ```bash
  pip install databricks-agentbricks
  ```

## Step 1: Authenticate

To authenticate to your workspace with OAuth, save a named profile, and set it as the Agent Bricks CLI's default, run the following:

```bash
databricks auth login --host https://<your-workspace-url> --profile <profile>
agentbricks login --profile <profile>
```

## Step 2: Scaffold the project

To scaffold a LangGraph agent with a browser chat app, run the following:

```bash
agentbricks init --framework langgraph my-agent
cd my-agent
```

`agentbricks init` writes the agent code and `agent.toml`, which declares the memory store, session store, and tracing experiment the deployed agent uses. Pass `--framework openai` to scaffold an OpenAI Agents SDK project instead.

## Step 3: Run the agent locally

To run the agent on your machine, run the following:

```bash
agentbricks dev
```

Open `http://localhost:8000` to chat with the agent. The chat UI links to a local MLflow server, where you can view a trace of each request.

## Step 4: Deploy the agent

To deploy the agent to the agent runtime, run the following:

```bash
agentbricks deploy my-agent
```

The CLI creates the stores and tracing experiment that `agent.toml` declares, grants the agent access to them, and deploys it as a Databricks app named `agent-bricks-my-agent`. When it finishes, it prints the app's URL. Open the URL to chat with your deployed agent.

## Where to next

- [Agent Bricks CLI](/docs/agents/cli) for each step in detail, querying the agent from your terminal or code, and bringing an existing agent.
- [Deploy agents on the agent runtime](/docs/agents/runtime) for how the deployed agent runs, recovers, and authenticates.
- [Agent memory and sessions](/docs/agents/memory) to work with the agent's conversation history and long-term memory.
