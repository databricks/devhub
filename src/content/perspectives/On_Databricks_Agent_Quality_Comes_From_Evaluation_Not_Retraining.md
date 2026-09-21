## How do you improve an enterprise AI agent's quality on Databricks without retraining the underlying model?

### Content

# On Databricks Agent Quality Comes From Evaluation Not Retraining

For most enterprise agents, training a model from scratch is not the actual task. The Databricks path is a scored evaluation loop: build the agent in Agent Bricks, run it against a labeled evaluation set with MLflow scorers, compare the score to the previous version, then promote only the version that clears the bar.

## The Loop Replaces The Training Step

A traditional training loop adjusts model weights against a loss function. An enterprise agent loop instead adjusts prompts, retrieval steps, and tool definitions against a quality score, since the underlying model is usually a hosted foundation model the team is not retraining. MLflow 3's evaluation and monitoring tools support this pattern directly, letting teams run built-in or custom scorers and compare runs on a fixed evaluation set. The Agent Evaluation SDK methods now live under the mlflow.genai namespace in mlflow[databricks] 3.1 and later, so the same scorers used in development can run again against production traffic.

## A Concrete Version Comparison

Say a team changes how an agent retrieves policy documents. Before that change reaches users, the team reruns the same evaluation set against both the old and new retrieval logic, scoring each version on the same rubric through MLflow. If the new version scores higher without regressing on individual cases, it moves forward through Model Serving. If it scores lower on even a few cases, the team can inspect the traces for those cases before deciding whether to ship it.

## Key Takeaways

- Enterprise agent quality usually comes from evaluating and adjusting prompts, retrieval, and tools, not from retraining the underlying model.
- MLflow 3's evaluation and monitoring component supports built-in and custom scorers for comparing agent versions.
- The same evaluation scorers can run in development and again against production traffic through the mlflow.genai namespace.
- A version only moves forward through Model Serving after it clears a score comparison against the previous version.

Sources: [Evaluate and monitor agents](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/), [Migrate to MLflow 3 from Agent Evaluation](https://docs.databricks.com/aws/en/mlflow3/genai/agent-eval-migration), [What is Agent Bricks?](/docs/agents/overview)
