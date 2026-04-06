---
title: Development
---

# Development

This guide continues from [Getting Started](/docs/agents/getting-started), where you cloned the `agent-openai-agents-sdk` template and ran the quickstart. Here you'll find the full local dev workflow, project structure, evaluation, deployment pipeline, and app management commands.

## Local dev loop

Start the server:

```bash
cd agent-openai-agents-sdk
uv run start-app
```

This starts the FastAPI agent server and a chat UI frontend process at `http://localhost:8000`. The server also serves a built-in chat UI at the root (`/`), so you can alternatively run just the server:

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

## Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Key variables:

| Variable                    | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `DATABRICKS_CONFIG_PROFILE` | CLI profile for local auth (e.g., `DEFAULT`) |
| `DATABRICKS_HOST`           | Workspace URL (alternative to profile)       |
| `DATABRICKS_TOKEN`          | PAT for local dev (alternative to profile)   |
| `MLFLOW_EXPERIMENT_ID`      | MLflow experiment for tracing                |

For deployed apps, the platform injects `DATABRICKS_HOST`, `DATABRICKS_CLIENT_ID`, and `DATABRICKS_CLIENT_SECRET` automatically.

## MLflow experiment

Create an experiment for agent tracing:

```bash title="Common"
DATABRICKS_USERNAME=$(databricks current-user me -o json | jq -r .userName)
databricks experiments create-experiment \
  /Users/$DATABRICKS_USERNAME/my-agent-experiment
```

```bash title="All Options"
DATABRICKS_USERNAME=$(databricks current-user me \
  --profile $DATABRICKS_PROFILE -o json | jq -r .userName)
databricks experiments create-experiment \
  /Users/$DATABRICKS_USERNAME/$EXPERIMENT_NAME \
  --artifact-location $ARTIFACT_LOCATION \
  --json '{}' \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option                | Required | Description                                           |
| --------------------- | -------- | ----------------------------------------------------- |
| `NAME`                | yes      | Experiment name (typically `/Users/<email>/<name>`)   |
| `--artifact-location` | no       | Storage location for experiment artifacts             |
| `--json`              | no       | Inline JSON or `@path/to/file.json` with request body |
| `--debug`             | no       | Enable debug logging                                  |
| `-o json`             | no       | Output as JSON (default: text)                        |
| `--target`            | no       | Bundle target to use (if applicable)                  |
| `--profile`           | no       | Databricks CLI profile name                           |

Add the returned `experiment_id` to your `.env`:

```text
MLFLOW_EXPERIMENT_ID=<experiment-id>
```

The `uv run quickstart` script in [agent templates](/docs/agents/getting-started) creates this automatically.

## Adding tools

Extend your agent with additional tools and data sources:

- **MCP servers**: connect to [Databricks MCP servers](https://docs.databricks.com/aws/en/generative-ai/mcp/) for workspace tools
- **Vector Search**: add retrieval with `databricks_openai.VectorSearchRetrieverTool`
- **Unity Catalog functions**: call registered functions as agent tools
- **Custom tools**: define tools in `agent_server/agent.py` using the OpenAI Agents SDK

See [Agent Framework tools](https://docs.databricks.com/aws/en/generative-ai/agent-framework/agent-tool) for the full reference.

## Evaluation

Agent templates include a built-in evaluation suite:

```bash
uv run agent-evaluate
```

This executes `agent_server/evaluate_agent.py`, which uses a `ConversationSimulator` to generate multi-turn conversations from test cases, then scores each with LLM judges for relevance, safety, and other metrics. After completion, open the MLflow UI link to inspect results.

Customize evaluation by editing `agent_server/evaluate_agent.py` to adjust the dataset and scorers.

## Deploy

The template uses [Databricks Asset Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/):

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

### Common issues

**"An app with the same name already exists"**: the app was created outside of DABs. Bind it to your bundle:

```bash
databricks bundle deployment bind agent_openai_agents_sdk <app-name> --auto-approve --profile <PROFILE>
databricks bundle deploy --profile <PROFILE>
```

**App is running old code after deploy**: `bundle deploy` only uploads files. Run `databricks bundle run agent_openai_agents_sdk` to restart with the new code.

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

See [Apps development](/docs/apps/development) for option tables covering `get`, `logs`, `stop`, `start`, and `delete`. `apps delete` prompts for confirmation; pass `--auto-approve` in CI to skip the prompt.

## Related recipes

| Recipe                                                                                                       | Description                                         |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| [Streaming AI Chat](/resources/ai-chat-app-template#streaming-ai-chat-with-model-serving)                    | Streaming chat with Model Serving and Vercel AI SDK |
| [Query AI Gateway Endpoints](/resources/ai-chat-app-template#query-ai-gateway-endpoints)                     | Access foundation models through AI Gateway         |
| [Lakebase Chat Persistence](/resources/ai-chat-app-template#lakebase-chat-persistence)                       | Persist chat sessions to Lakebase                   |
| [Genie Conversational Analytics](/resources/analytics-dashboard-app-template#genie-conversational-analytics) | Natural language data queries with Genie            |

## Source of truth

- [Author an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
- [Deploy an agent (Model Serving)](https://docs.databricks.com/aws/en/generative-ai/agent-framework/deploy-agent)
- [Query an agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/query-agent)
- [Agent template README](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk)
- [Databricks Asset Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
