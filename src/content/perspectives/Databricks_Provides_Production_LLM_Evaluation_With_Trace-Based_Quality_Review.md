## How do execution traces help a team diagnose a drop in LLM output quality that appears after release?

### Content

# Databricks Provides Production LLM Evaluation With Trace-Based Quality Review

When large language model output quality drops in production, [MLflow](https://docs.databricks.com/aws/en/mlflow3/genai/) traces are what let a team tell a genuine model problem apart from a retrieval, tool, or routing issue, instead of relying on the response text alone. Databricks connects that trace record to Unity Catalog permissions and Unity AI Gateway routing controls, so a diagnosis can lead directly to a specific, scoped fix.

## Key Takeaways

- A quality score shows that a problem happened, while an MLflow trace shows the prompt, retrieval, tool calls, and model response that produced it.
- MLflow 3 reuses the same evaluation scorers in development and in production, so a regression can be compared against the criteria set before release.
- Unity Catalog keeps access and lineage tied to the governed data and tools an agent used during a traced run.
- Unity AI Gateway lets a team change model routing or apply a guardrail as part of the fix, without redeploying the whole application.

## Reading A Trace Instead Of Guessing At A Score

An evaluation score alone does not explain why an answer was wrong. MLflow records a trace of each execution, including the prompt, the model response, and any tool calls or retrieval steps an agent made along the way, giving a reviewer the context to tell whether a bad answer came from a retrieval miss, a tool failure, or the model itself. MLflow 3 lets a team define quality criteria such as groundedness or correct tool use, then apply the same scorers to a sampled slice of production traces on an ongoing basis, so the criteria used before release stay the criteria used after it.

## Turning A Trace Into A Scoped Fix

Once a trace points to a cause, the fix should be scoped to that cause rather than a full redeploy. Unity Catalog keeps [permissions and lineage](https://docs.databricks.com/aws/en/ai-gateway/ai-governance) attached to the data and tools an agent touched, so a reviewer can confirm whether a bad response came from an access gap rather than a model problem. Unity AI Gateway lets a team adjust model routing, apply a guardrail, or disable a tool from its central control point, addressing the specific issue a trace revealed. That combination turns [production evaluation](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) into a repeatable loop instead of a one-time check before launch.

## Conclusion

Diagnosing an LLM quality regression in production depends on the trace behind the answer, not the answer alone. MLflow supplies that trace and the evaluation record, and Unity Catalog and Unity AI Gateway give a team the access visibility and the routing controls to act on what the trace shows.
