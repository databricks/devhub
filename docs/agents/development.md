---
title: Development
---

# Development

This guide continues from [Getting Started](/docs/agents/getting-started), where you cloned the `agent-openai-agents-sdk` template and ran the quickstart. This page covers the full local dev workflow, project structure, evaluation, deployment pipeline, and app management commands.

## Local dev loop

Start the server:

```bash
cd agent-openai-agents-sdk
uv run start-app
```

This starts the FastAPI agent server and a chat UI frontend process at `http://localhost:8000`. The server also serves a built-in chat UI at the root (`/`), so alternatively run the server alone:

```bash
uv run start-server
```

For development with hot-reload:

```bash
uv run start-server --reload
```

Other options:

```bash
uv run start-server --port 8001       # Change the server port
uv run start-server --workers 4       # Multiple workers
CHAT_APP_PORT=3001 uv run start-app   # Change the internal chat UI port
```

`--port` controls the port you open in the browser. `CHAT_APP_PORT` controls an internal frontend process that `start-app` launches on port 3000 by default (set it in `.env` or inline if port 3000 is in use).

## Project structure

```text
agent-openai-agents-sdk/
  agent_server/
    agent.py            # Agent logic: tools, system prompt, behavior
    start_server.py     # MLflow AgentServer setup (rarely modified)
    evaluate_agent.py   # Evaluation dataset and scorers
    utils.py            # Auth helpers (OBO user client)
  pyproject.toml        # Python dependencies (managed by uv)
  databricks.yml        # App resources, permissions, deploy targets
  app.yaml              # Runtime config (command, env vars)
  .env.example          # Template for local environment variables
  .env                  # Local config (not committed)
```

:::tip[Not using the template?]
The `uv run start-app` and `uv run start-server` commands are template convenience scripts. Under the hood, they start an [MLflow AgentServer](/docs/agents/core-concepts#agentserver). Any Python runner that starts AgentServer works. The project structure above is a convention, not a requirement.
:::

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Key variables:

| Variable                    | Purpose                                             |
| --------------------------- | --------------------------------------------------- |
| `DATABRICKS_CONFIG_PROFILE` | CLI profile for local auth (for example, `DEFAULT`) |
| `DATABRICKS_HOST`           | Workspace URL (alternative to profile)              |
| `DATABRICKS_TOKEN`          | PAT for local dev (alternative to profile)          |
| `MLFLOW_EXPERIMENT_ID`      | MLflow experiment for tracing                       |

For deployed apps, the platform injects `DATABRICKS_HOST`, `DATABRICKS_CLIENT_ID`, and `DATABRICKS_CLIENT_SECRET` automatically.

## MLflow experiment

Tracing requires an MLflow experiment. The `uv run quickstart` script creates one automatically. To create one manually or see all CLI options, see [Observability: MLflow experiment setup](/docs/agents/observability#mlflow-experiment-setup).

Add the returned `experiment_id` to your `.env`:

```text
MLFLOW_EXPERIMENT_ID=<experiment-id>
```

## Adding tools

Extend your agent with additional tools and data sources:

- **MCP servers**: connect to [Databricks MCP servers](https://docs.databricks.com/aws/en/generative-ai/mcp/) for workspace tools
- **Vector Search**: add retrieval with `databricks_openai.VectorSearchRetrieverTool`
- **Unity Catalog functions**: call registered functions as agent tools
- **Custom tools**: define tools in `agent_server/agent.py` using the OpenAI Agents SDK

See [Agent Framework tools](https://docs.databricks.com/aws/en/generative-ai/agent-framework/agent-tool) for the full reference.

## Evaluation

Run the built-in evaluation suite with `uv run agent-evaluate`. This executes `agent_server/evaluate_agent.py`, which simulates conversations and scores them with LLM judges. Customize test cases and scorers by editing that file.

See [Observability: Evaluation](/docs/agents/observability#evaluation) for details about scorers, example output, and the full evaluation framework.

## Deploy

The template uses [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/):

```bash title="Common"
databricks bundle validate
databricks bundle deploy
databricks bundle run agent_openai_agents_sdk
```

```bash title="All Options"
databricks bundle validate \
  --strict \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE

databricks bundle deploy \
  --auto-approve \
  --force-lock \
  --force \
  --fail-on-active-runs \
  --cluster-id $CLUSTER_ID \
  --plan $PLAN_FILE \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE

databricks bundle run agent_openai_agents_sdk \
  --no-wait \
  --restart \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

See [Deploy](/docs/agents/getting-started#deploy) for option tables for each command. `bundle deploy` uploads files and configures resources. `bundle run` starts the app. Both are required for each update.

To grant access to additional resources (serving endpoints, Genie spaces, Vector Search), add them to `databricks.yml` and redeploy.

## Troubleshooting

For the full error reference, see [Debug a deployed AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/debug-agent).

- **`The provided MLFLOW_EXPERIMENT_ID does not exist`**: Verify `MLFLOW_TRACKING_URI` in `.env` uses the `databricks://PROFILE_NAME` format with your CLI profile name, not a raw URL.
- **`Port already in use`**: Another process is using port 8000. Use `uv run start-app --port 8001` or stop the existing process.
- **`Module not found`**: Dependencies aren't installed. Run `uv sync` to install.
- **`An app with the same name already exists`**: The app was created outside of DABs. Bind it to your bundle:

  ```bash
  databricks bundle deployment bind agent_openai_agents_sdk <app-name> --auto-approve --profile <PROFILE>
  databricks bundle deploy --profile <PROFILE>
  ```

- **App is running old code after deploy**: `bundle deploy` only uploads files. Run `databricks bundle run agent_openai_agents_sdk` to restart with the new code.
- **302 redirect when querying deployed app**: You're using a Personal Access Token (PAT). Apps require OAuth. Get a token with `databricks auth token --profile <PROFILE>`.
- **Resource permission errors** (Genie, Vector Search, UC functions, serving endpoints): Add the resource to `databricks.yml` under `resources.apps.<name>.resources` with the appropriate permission, then redeploy.

## Querying deployed agents

**Python** (using `databricks-openai`):

```python
from databricks.sdk import WorkspaceClient
from databricks_openai import DatabricksOpenAI

w = WorkspaceClient()
client = DatabricksOpenAI(workspace_client=w)

response = client.responses.create(
    model="apps/<app-name>",
    input=[{"role": "user", "content": "hello"}],
)
```

**curl** (OAuth required, PATs not supported):

```bash
TOKEN=$(databricks auth token --profile <PROFILE> | jq -r .access_token)

curl -X POST <app-url>/responses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "content": "hello"}]}'
```

For streaming, add `"stream": true` to the request body.

## Managing the app

```bash title="Common"
databricks apps get agent-openai-agents-sdk -o json
databricks apps logs agent-openai-agents-sdk
databricks apps stop agent-openai-agents-sdk
databricks apps start agent-openai-agents-sdk
databricks apps delete agent-openai-agents-sdk
```

```bash title="All Options"
databricks apps get $APP_NAME \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps logs $APP_NAME \
  --follow \
  --tail-lines 200 \
  --timeout 5m \
  --source APP \
  --search "$SEARCH_TERM" \
  --output-file $LOG_FILE \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps stop $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps start $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps delete $APP_NAME \
  --auto-approve \
  --force-lock \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

See [Apps development](/docs/apps/development) for option tables covering `get`, `logs`, `stop`, `start`, and `delete`. `apps delete` prompts for confirmation. Pass `--auto-approve` in CI to skip the prompt.

## Related recipes

| Recipe                                                                                          | Description                                         |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [Streaming AI Chat](/resources/ai-chat-app#streaming-ai-chat-with-model-serving)                | Streaming chat with Model Serving and Vercel AI SDK |
| [Query AI Gateway Endpoints](/resources/ai-chat-app#query-ai-gateway-endpoints)                 | Access foundation models through AI Gateway         |
| [Lakebase Chat Persistence](/resources/ai-chat-app#lakebase-chat-persistence)                   | Persist chat sessions to Lakebase                   |
| [Genie Conversational Analytics](/resources/genie-analytics-app#genie-conversational-analytics) | Natural language data queries with Genie            |

## Further reading

- [Author an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
- [Deploy an agent (Model Serving)](https://docs.databricks.com/aws/en/generative-ai/agent-framework/deploy-agent)
- [Query an agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/query-agent)
- [Agent template README](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
