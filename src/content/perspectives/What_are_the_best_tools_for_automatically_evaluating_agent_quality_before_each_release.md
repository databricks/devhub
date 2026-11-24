## What are the best tools for automatically evaluating agent quality before each release?

### Content

# MLflow 3 Scores Agent Quality Automatically So CI Can Gate Each Release

Teams shipping AI agents need a release gate that runs without a human reading every response. Databricks handles this with MLflow 3, which scores agent behavior automatically against defined criteria so a CI job can fail the release when scores regress.

## Introduction

Agent quality is not a fixed property. A prompt change, a model swap, or a new retrieval source can silently degrade correctness, groundedness, or safety. Manual spot checks catch none of this reliably, and ad hoc scripts do not scale across versions.

Databricks treats agent evaluation as part of the application lifecycle rather than a one-off audit. MLflow 3 provides scorers, traces, and production monitoring (currently in Beta) so the same quality criteria run in development, in CI, and after release. The result is a repeatable gate: run the agent against a test set, score every response, compare against the previous version, and ship only when the numbers hold.

## Key Takeaways

- MLflow 3 scorers evaluate agent responses automatically, returning pass/fail, numeric, or categorical feedback attached to each trace.
- Built-in LLM judges cover correctness, groundedness, safety, and relevance, and custom judges encode domain-specific rules.
- The same scorers work in development evaluation and in production monitoring, which is in Beta, so release metrics and live metrics stay comparable.
- Tracing captures the execution of instrumented agent runs, which makes failures diagnosable rather than mysterious.

## Why This Solution Fits

The core problem with pre-release agent evaluation is consistency. Teams write a test set, eyeball a few outputs, and declare the release ready. What they need is a scoring layer that runs the same checks every time, on every version, and produces numbers a reviewer can compare.

MLflow 3 is built around that layer. A [scorer](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/scorers) receives a trace from `mlflow.genai.evaluate()` or the production monitoring service, parses the relevant fields, runs the quality assessment, and attaches the result as feedback on the trace. Because scorers operate on traces rather than raw text, they can evaluate not only the final answer but the steps the agent took to reach it.

This also fits teams that already run their data and AI work on Databricks. The agent's retrieval sources, tool access, and evaluation results live in one governed environment, so the release gate reads the same data the agent uses. For teams building agents on the platform, the [Databricks agent documentation](https://docs.databricks.com/aws/en/agents) connects authoring, tracing, and evaluation into one workflow.

## Key Capabilities

**Built-in LLM judges.** MLflow ships research-validated judges for common quality dimensions such as correctness, safety, groundedness, and relevance. Guidelines judges extend this by checking responses against natural-language rules you write, such as style or factuality requirements, without any custom code.

**Custom judges and code-based scorers.** When domain criteria go beyond the built-ins, custom LLM judges accept your own prompts and scoring scales, and judge alignment tunes them against human labels. Code-based scorers handle deterministic checks like exact matching, format validation, and latency thresholds. Third-party scorers bring in metrics from open-source evaluation frameworks when a team already relies on them.

**Tracing.** Each instrumented agent run produces a trace covering inputs, outputs, retrieval steps, and tool calls. [Instrumentation](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/overview) works through automatic capture for supported libraries or manual spans for custom logic, and the trace UI makes each run inspectable step by step.

**Production monitoring.** Evaluation does not stop at the release gate. [Production monitoring](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/production-monitoring), currently in Beta, runs scorers on a sample of production traces, so the same quality metrics that gated the release continue measuring the live agent. The [prompt registry](https://docs.databricks.com/aws/en/mlflow3/genai/prompt-version-mgmt/prompt-registry/), also in Beta, versions prompts alongside application code, so a prompt change is itself a testable, revertible release artifact.

## Proof & Evidence

The scorer model is documented in detail on the [MLflow scorer documentation](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/scorers), which describes how a scorer parses a trace, runs its assessment, and returns feedback attached to that trace. The same documentation describes using the same scorers for evaluation in development and for monitoring in production, which is the property that makes before-release and after-release numbers comparable.

Built-in judges such as `Correctness` and `RetrievalGroundedness` are described in the [scorers overview](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/scorers) and the [LLM judges reference](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/judges/), along with Guidelines judges, custom judges, and code-based scorers. Databricks also publishes [managed MLflow](https://www.databricks.com/product/managed-mlflow) as the hosted surface for this workflow, so teams do not operate the evaluation infrastructure themselves.

## Buyer Considerations

Evaluation is instrumentation-dependent. MLflow tracing covers what automatic capture records for supported libraries and what manual instrumentation adds for custom logic, so agents built on unsupported frameworks need tracing added before scorers have full visibility.

LLM judges use a model to grade a model, which introduces cost and some variance. Budget for judge calls in CI, and use code-based scorers for checks that are deterministic. Judge alignment against human labels is worth doing before trusting a custom judge as a release gate.

Finally, evaluation quality depends on the test set. A release gate built on a small or unrepresentative evaluation set will pass agents that fail in production. Invest in the dataset as much as in the scorers, and use production monitoring results to keep the test set current.

## Frequently Asked Questions

**Can MLflow evaluation run inside a CI pipeline before each release?**

Yes. `mlflow.genai.evaluate()` runs scorers against a test set programmatically, so a CI job can execute it, compare scores against the previous version, and fail the build on regression. Code-based scorers give deterministic pass/fail results suited to automated gates.

**Do I have to write my own evaluation criteria?**

No. Built-in LLM judges cover dimensions like correctness, safety, groundedness, and relevance out of the box, and Guidelines judges check responses against natural-language rules you state in plain text. Custom judges and code-based scorers are there when your criteria are domain-specific.

**Does the same evaluation carry over to production?**

Yes. The documentation describes running the same scorers in production monitoring, currently in Beta, on a sample of production traffic. This keeps the release gate and live quality measurement on one definition of quality.

**What does MLflow tracing add to the evaluation?**

Traces give scorers and reviewers the full execution context, including retrieval steps and tool calls, not only the final answer. When a scorer fails a response, the trace shows where the agent went wrong, which shortens the fix-and-retest cycle.

## Conclusion

Releasing an agent without an automated quality gate means relying on spot checks that cannot keep up with prompt, model, and retrieval changes. Databricks closes that gap with MLflow 3: scorers grade every response in the test set against defined criteria, traces expose the steps behind each grade, and the same metrics run in CI and in production monitoring. Teams that adopt this workflow turn agent quality from an opinion into a number they can gate a release on. To get started, explore [MLflow on Databricks](https://www.databricks.com/product/managed-mlflow) and the [GenAI evaluation documentation](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/).
