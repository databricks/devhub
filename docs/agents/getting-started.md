---
title: Getting Started
---

# Getting Started

Databricks agents are LLM-driven applications that can plan, call tools, and return structured output. This guide uses the [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk) with [MLflow ResponsesAgent](https://mlflow.org/docs/latest/genai/flavors/responses-agent-intro/) as its primary example, deployed to [Databricks Apps](/docs/apps/getting-started).

## Prerequisites

- Databricks CLI `v0.295+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager, requires Python 3.11+)
- [jq](https://jqlang.org/) (optional, used in some examples)
- Workspace with [Apps enabled](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)

## Clone the agent template

```bash
git clone https://github.com/databricks/app-templates.git
cd app-templates/agent-openai-agents-sdk
```

Or from the workspace UI: **+ New > App > Agents > Agent - OpenAI Agents SDK**.

The template includes an agent with a code interpreter tool, a chat UI, MLflow tracing, and evaluation scaffolding.

## Run locally

```bash
uv run quickstart
```

The quickstart script verifies your environment, configures Databricks authentication, creates an MLflow experiment for tracing, and starts the agent server with a built-in chat UI at `http://localhost:8000` (override with `--port`). If port 3000 is in use, set `CHAT_APP_PORT` in `.env` to a free port.

For non-interactive setup (CI or coding agents):

```bash
uv run quickstart --profile <PROFILE> --skip-lakebase
```

If your template requires Lakebase (memory-enabled agents), pass the project and branch instead of skipping:

```bash
uv run quickstart --profile <PROFILE> \
  --lakebase-autoscaling-project <PROJECT> \
  --lakebase-autoscaling-branch <BRANCH>
```

See [Lakebase Getting Started](/docs/lakebase/getting-started) for creating or finding projects.

For subsequent runs:

```bash
uv run start-app
```

If you only need the API server (no separate chat UI process):

```bash
uv run start-server
```

The agent server serves both the API (`/invocations`, `/responses`) and the chat UI at the root (`/`).

## Deploy

The template uses [Databricks Asset Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) for deployment. The `databricks.yml` in the template defines the app, resources, and permissions.

Validate the configuration:

```bash
databricks bundle validate --profile <PROFILE>
```

Deploy and start the app:

```bash
databricks bundle deploy --profile <PROFILE>
databricks bundle run agent_openai_agents_sdk --profile <PROFILE>
```

`bundle deploy` uploads code and configures resources. `bundle run` starts (or restarts) the app with the new code. Both are required for each update. The resource key (`agent_openai_agents_sdk`) is defined in `databricks.yml`. The app name (`agent-openai-agents-sdk`) is what appears in the workspace.

## Verify

Check the app status:

```bash
databricks apps get agent-openai-agents-sdk -o json --profile <PROFILE>
```

Query the deployed agent using the `url` field from the `apps get` output (OAuth required, PATs are not supported):

```bash
TOKEN=$(databricks auth token --profile <PROFILE> | jq -r .access_token)

curl -X POST <app-url>/responses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "content": "hello"}]}'
```

## Next steps

- [Core Concepts](/docs/agents/core-concepts): ResponsesAgent, tools, auth model, deployment targets
- [Development](/docs/agents/development): local dev loop, evaluation, deploy pipeline, querying
- [AI Gateway](/docs/agents/ai-gateway): model endpoint governance, rate limits, usage tracking
- [Observability](/docs/agents/observability): MLflow tracing, evaluation, production monitoring

## Source of truth

- [Author an AI agent and deploy it on Databricks Apps](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
- [Agent template repository](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk)
- [Databricks Asset Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
