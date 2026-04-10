---
title: Observability
---

# Observability

Monitor, debug, and improve agents using MLflow tracing, evaluation, and Databricks monitoring surfaces.

## MLflow experiment setup

Create an experiment to store traces and evaluation results:

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

Set the returned `experiment_id` in your `.env`:

```text
MLFLOW_EXPERIMENT_ID=<experiment-id>
```

The `uv run quickstart` script in [agent templates](/docs/agents/getting-started) creates this automatically.

## Auto-tracing

MLflow AgentServer provides automatic tracing with no additional code:

- Methods decorated with `@invoke()` and `@stream()` are traced automatically
- LLM calls are captured through [MLflow autologging](https://mlflow.org/docs/latest/genai/tracing/#one-line-auto-tracing-integrations)
- Streaming responses are aggregated into complete traces

Traces appear in the MLflow experiment UI and include inputs, outputs, intermediate tool calls, and latency per step.

## Custom tracing

For more granular instrumentation beyond auto-tracing, use the MLflow tracing API directly. This is useful for tracing custom tool calls, data lookups, or pre/post-processing steps that auto-tracing does not capture.

See [App instrumentation](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/app-instrumentation/) for the API reference.

## Production tracing

For agents deployed using `databricks bundle deploy` to Apps, tracing is automatic. Traces are logged to the MLflow experiment linked to the app.

For agents on Model Serving (using `agents.deploy()`), tracing is also automatic. If using a custom CPU serving endpoint, enable tracing with environment variables:

```text
ENABLE_MLFLOW_TRACING=true
MLFLOW_EXPERIMENT_ID=<experiment-id>
```

See [Production tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/prod-tracing) for configuration details.

## Evaluation

Agent templates include a built-in evaluation suite:

```bash
uv run agent-evaluate
```

This executes `agent_server/evaluate_agent.py`, which uses a `ConversationSimulator` to generate multi-turn conversations from test cases, then scores each conversation with LLM judges.

:::tip[Not using the template?]
`uv run agent-evaluate` is a template script that wraps `evaluate_agent.py`. Run evaluation directly with [`mlflow.evaluate()`](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) against any `ResponsesAgent`.
:::

<details>
<summary>Example output</summary>

```text
Simulating conversations:  50%|█████     | 1/2 [Elapsed: 00:15, Remaining: 00:15]
Simulating conversations: 100%|██████████| 2/2 [Elapsed: 00:29, Remaining: 00:00]
Evaluating:  25%|██▌       | 1/4 [Elapsed: 00:06, Remaining: 00:18]
Evaluating: 100%|██████████| 4/4 [Elapsed: 00:09, Remaining: 00:00]

Evaluation completed.

Metrics and evaluation results are logged to the MLflow run:
  Run name: omniscient-fish-617
  Run ID: fa92ad535f154ba091eedbf38be9fd1a
View the evaluation results at https://<workspace-url>/ml/experiments/<id>/evaluation-runs?selectedRunUuid=<run-id>
```

</details>

Agent templates typically include scorers for `Completeness`, `ConversationCompleteness`, `ConversationalSafety`, `KnowledgeRetention`, `UserFrustration`, `Fluency`, `RelevanceToQuery`, `Safety`, and `ToolCallCorrectness`.

Customize the test cases and scorers in `agent_server/evaluate_agent.py`. For retriever-based agents, MLflow RETRIEVER spans enable additional groundedness and relevance judges.

See [MLflow evaluation](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) for the full evaluation framework.

## Production monitoring

Production monitoring applies the same scorers used in offline evaluation to live traffic:

- Samples production traces at a configurable rate
- Runs LLM judges and scorers on sampled traces
- Results sync to Delta tables (approximately 15-minute delay)

This lets you track quality, latency, cost, and safety trends over time without separate instrumentation for dev and prod.

See [Production monitoring](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/production-monitoring) for setup.

## Inference tables

AI Gateway logs request/response payloads to Unity Catalog inference tables when payload logging is enabled. Usage metrics are tracked in system tables (`system.serving.endpoint_usage` for serving endpoints, `system.ai_gateway.usage` for AI Gateway Beta endpoints).

These tables enable:

- Cost analysis per endpoint, user, or time period
- Debugging failed or slow requests
- Compliance and audit logging

See [AI Gateway](/docs/agents/ai-gateway) for enabling payload logging and usage tracking.

## Further reading

- [MLflow 3 for GenAI](https://docs.databricks.com/aws/en/mlflow3/genai/)
- [App instrumentation (custom tracing)](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/app-instrumentation/)
- [Production tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/prod-tracing)
- [Production monitoring](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/production-monitoring)
- [AI Gateway for serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)
