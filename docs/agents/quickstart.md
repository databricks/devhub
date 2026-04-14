---
title: Quickstart
---

# Quickstart

Databricks agents are LLM-driven applications that can plan, call tools, and return structured output. Agents are deployed as [Databricks Apps](/docs/apps/quickstart).

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager, requires Python 3.11+)
- [jq](https://jqlang.org/) (optional, used in some examples)
- Workspace with [Apps enabled](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)

## Choose your framework

The platform works with any Python framework. The steps below use the OpenAI Agents SDK template.

| Framework                                                               | Best for                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk) | Most agents. Used in this guide. Tools, handoffs, streaming.     |
| [LangGraph](https://langchain-ai.github.io/langgraph/)                  | Complex workflows with explicit state and branching logic.       |
| Custom                                                                  | Bring your own framework. Implement the ResponsesAgent contract. |

See [How agents work](/docs/agents/core-concepts) for the full platform contract.

## Clone the agent template

```bash
git clone https://github.com/databricks/app-templates.git
cd app-templates/agent-openai-agents-sdk
```

Or from the workspace UI: **+ New > App > Agents > Agent - OpenAI Agents SDK**.

The template includes an agent with a code interpreter tool, a chat UI, MLflow tracing, and evaluation scaffolding.

## Run locally

```bash title="Common"
uv run quickstart
```

```bash title="All Options"
uv run quickstart \
  --profile $DATABRICKS_PROFILE \
  --lakebase-autoscaling-project $PROJECT_ID \
  --lakebase-autoscaling-branch $BRANCH_ID
```

Without Lakebase (for example CI or templates that do not use Lakebase):

```bash
uv run quickstart --skip-lakebase
```

The quickstart script verifies your environment, configures Databricks authentication, creates an MLflow experiment for tracing, and starts the agent server with a built-in chat UI at `http://localhost:8000` (override with `--port`). If port 3000 is in use, set `CHAT_APP_PORT` in `.env` to a free port.

See [Lakebase quickstart](/docs/lakebase/quickstart) for creating or finding projects when you use Lakebase-backed templates.

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

The template uses [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) for deployment. The `databricks.yml` in the template defines the app, resources, and permissions.

Validate the configuration:

```bash
databricks bundle validate
```

Deploy and start the app:

```bash
databricks bundle deploy
databricks bundle run agent_openai_agents_sdk
```

`bundle deploy` uploads code and configures resources. `bundle run` starts (or restarts) the app with the new code. Both are required for each update. The resource key (`agent_openai_agents_sdk`) is defined in `databricks.yml`. The app name (`agent-openai-agents-sdk`) is what appears in the workspace.

For all flags, see [Development: Deploy](/docs/agents/development#deploy).

## Verify

Check the app status:

```bash title="Common"
databricks apps get agent-openai-agents-sdk -o json
```

```bash title="All Options"
databricks apps get $APP_NAME \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option      | Required | Description                                                               |
| ----------- | -------- | ------------------------------------------------------------------------- |
| `NAME`      | yes      | App name                                                                  |
| `--debug`   | no       | Enable debug logging                                                      |
| `-o json`   | no       | Output as JSON (default: text)                                            |
| `--target`  | no       | Bundle target to use (if applicable)                                      |
| `--var`     | no       | Set values for bundle config variables (for example, `--var="key=value"`) |
| `--profile` | no       | Databricks CLI profile name                                               |

</details>

Query the deployed agent using the `url` field from the `apps get` output (OAuth required, PATs are not supported):

```bash
TOKEN=$(databricks auth token --profile <PROFILE> | jq -r .access_token)

curl -X POST <app-url>/responses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "content": "hello"}]}'
```

## Customize the template

After verifying the deploy works, consider the following customizations:

- **Change the system prompt**: Edit the `instructions` field in `agent_server/agent.py`.
- **Swap the model**: Change the `model` parameter (for example, `databricks-claude-sonnet-4-5`, `databricks-meta-llama-4-maverick`).
- **Add a tool**: Define a function with `@function_tool` in `agent_server/agent.py`, or connect an [MCP server](https://docs.databricks.com/aws/en/generative-ai/mcp/) for workspace tools. See [Development: Adding tools](/docs/agents/development#adding-tools).
- **Install additional agent skills**: Install Databricks [agent skills](/docs/tools/ai-tools/agent-skills) for platform-aware AI assistance.
- **Add Lakebase memory**: Use the [stateful agents template](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk-short-term-memory) for persistent chat history.
- **Grant resource access**: Add serving endpoints, Genie spaces, or Vector Search indexes to `databricks.yml` and redeploy.

## Next steps

- [Core Concepts](/docs/agents/core-concepts): ResponsesAgent, tools, auth model, deployment targets
- [Development](/docs/agents/development): local dev loop, evaluation, deploy pipeline, querying
- [AI Gateway](/docs/agents/ai-gateway): model endpoint governance, rate limits, usage tracking
- [Observability](/docs/agents/observability): MLflow tracing, evaluation, production monitoring

## Further reading

- [Author an AI agent and deploy it on Databricks Apps](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
- [Agent template repository](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
