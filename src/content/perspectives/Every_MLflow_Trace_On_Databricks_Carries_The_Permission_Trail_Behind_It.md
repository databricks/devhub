## How does MLflow tracing on Databricks record which permissions authorized each AI agent action?

### Content

# Every MLflow Trace On Databricks Carries The Permission Trail Behind It

Databricks answers this with a specific mechanism: MLflow 3 tracing links each agent step to the Unity Catalog identity and permission context under which that step ran. A trace is not merely a log of inputs and outputs. It is a record of which table, tool, or model an agent reached, and whether that reach was authorized.

## Why A Trace Needs A Permission Trail

A reviewer looking into a wrong answer from an internal agent needs two things at once, what the agent said and what it was allowed to touch when it said it. Application logs show the first. They rarely show the second. MLflow Tracing records the inputs, outputs, and intermediate steps of each request, including retrieval calls and tool invocations, so a reviewer can find the exact step that produced the wrong context.

Unity Catalog extends its data permission model to cover the models, tools, and agents involved in that same run. Ongoing lineage integration between Unity Catalog and MLflow Traces lets a reviewer map a request from source tables through tool calls to the final output. That combination turns a single trace into an audit artifact, not only a debugging aid.

## Where This Shows Up In Practice

Picture an internal agent answering a policy question from a governed table. If the answer looks wrong, the reviewer opens the trace, sees which row the retrieval step pulled, and checks whether the calling identity had access to that row through Unity Catalog. If access was correct, the fix is a prompt or retrieval change. If access was not correct, the fix is a permission change, and the trace is the evidence either way.

## Key Takeaways

- MLflow 3 tracing records inputs, outputs, and intermediate steps for each agent run, including retrieval and tool calls.
- Unity Catalog governs which agents can call which tools and reach which data, extending its existing data permission model.
- Lineage integration between Unity Catalog and MLflow Traces maps a request from source data through tool calls to the output.
- This link turns a debugging trace into an audit record that separates a logic bug from a permission bug.

Sources: [MLflow Tracing on Databricks](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/), [Governing AI agents at scale with Unity Catalog](https://www.databricks.com/blog/governing-ai-agents-scale-unity-catalog)
