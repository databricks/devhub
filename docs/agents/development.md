---
title: Local development and deployment
sidebar_label: Local dev & deploy
---

# Local development and deployment

This guide continues from [Quickstart](/docs/agents/quickstart), where you cloned the `agent-openai-agents-sdk` template and ran the quickstart. This page covers the full local dev workflow, project structure, evaluation, deployment pipeline, and app management commands.

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

### Validate

```bash title="All Options"
databricks bundle validate \
  --strict \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option      | Required | Description                                                               |
| ----------- | -------- | ------------------------------------------------------------------------- |
| `--strict`  | no       | Treat warnings as errors                                                  |
| `--debug`   | no       | Enable debug logging                                                      |
| `-o json`   | no       | Output as JSON (default: text)                                            |
| `--var`     | no       | Set values for bundle config variables (for example, `--var="key=value"`) |
| `--target`  | no       | Bundle target (for example, `dev`, `prod`)                                |
| `--profile` | no       | Databricks CLI profile name                                               |

</details>

### Deploy

```bash title="All Options"
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
```

<details>
<summary>Options</summary>

| Option                  | Required | Description                                                               |
| ----------------------- | -------- | ------------------------------------------------------------------------- |
| `--auto-approve`        | no       | Skip confirmation prompts                                                 |
| `--force-lock`          | no       | Force acquisition of deployment lock                                      |
| `--force`               | no       | Force-override Git branch validation                                      |
| `--fail-on-active-runs` | no       | Fail if jobs or pipelines are running                                     |
| `--cluster-id`          | no       | Override cluster in deployment                                            |
| `--plan`                | no       | Path to JSON plan file                                                    |
| `--debug`               | no       | Enable debug logging                                                      |
| `-o json`               | no       | Output as JSON (default: text)                                            |
| `--var`                 | no       | Set values for bundle config variables (for example, `--var="key=value"`) |
| `--target`              | no       | Bundle target (for example, `dev`, `prod`)                                |
| `--profile`             | no       | Databricks CLI profile name                                               |

</details>

### Start the app

```bash title="All Options"
databricks bundle run agent_openai_agents_sdk \
  --no-wait \
  --restart \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option      | Required | Description                                                                        |
| ----------- | -------- | ---------------------------------------------------------------------------------- |
| `KEY`       | yes      | Bundle resource key from `databricks.yml` (for example, `agent_openai_agents_sdk`) |
| `--no-wait` | no       | Return immediately instead of waiting for completion                               |
| `--restart` | no       | Restart if already running                                                         |
| `--debug`   | no       | Enable debug logging                                                               |
| `-o json`   | no       | Output as JSON (default: text)                                                     |
| `--var`     | no       | Set values for bundle config variables (for example, `--var="key=value"`)          |
| `--target`  | no       | Bundle target (for example, `dev`, `prod`)                                         |
| `--profile` | no       | Databricks CLI profile name                                                        |

Job, pipeline, and task-specific flags are omitted. Run `databricks bundle run --help` for the full list.

</details>

`bundle deploy` uploads code and configures resources. `bundle run` starts (or restarts) the app with the new code. Both are required for each update. The resource key (`agent_openai_agents_sdk`) is defined in `databricks.yml`. The app name (`agent-openai-agents-sdk`) is what appears in the workspace.

In CI, pass `--auto-approve` to `bundle deploy` to skip confirmation prompts that occur when the plan includes destructive actions (for example, recreating a UC schema or pipeline).

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

To manage the deployed app (logs, stop, start, delete), see [Apps: Managing apps](/docs/apps/development#managing-apps).

## Related guides and examples

| Guide or example                                                            | Description                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Streaming AI Chat](/resources/ai-chat-model-serving)                       | Streaming chat with Model Serving and Vercel AI SDK      |
| [Query AI Gateway Endpoints](/resources/foundation-models-api)              | Access foundation models through AI Gateway              |
| [Lakebase Chat Persistence](/resources/lakebase-chat-persistence)           | Persist chat sessions to Lakebase                        |
| [Genie Conversational Analytics](/resources/genie-conversational-analytics) | Natural language data queries with Genie                 |
| [Agentic Support Console](/resources/agentic-support-console)               | Example: full AI support console with Lakebase and Genie |

## Further reading

- [Author an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
- [Deploy an agent (Model Serving)](https://docs.databricks.com/aws/en/generative-ai/agent-framework/deploy-agent)
- [Query an agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/query-agent)
- [Agent template README](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Agent skills](/docs/tools/ai-tools/agent-skills)
