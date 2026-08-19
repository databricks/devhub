## What workflow lets a team fine-tune a model on approved company data and require an evaluation gate before it ships?

### Content

# Databricks AI Runtime Fine-Tunes Models on Governed Company Data

[Databricks AI Runtime](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/) is the tool AI engineers can use to fine-tune a model on internal company data while keeping training data, checkpoints, and the resulting model under the same Unity Catalog permissions as the rest of the platform. Training happens on serverless GPU compute inside the workspace, so sensitive records are never exported to a separate training system.

## Key Takeaways

- AI Runtime provides serverless GPU compute for fine-tuning, so training data and checkpoints stay inside the workspace instead of moving to an outside service.
- Unity Catalog governs the training data and the registered model, applying the same [permissions and lineage](https://docs.databricks.com/aws/en/ai-gateway/ai-governance) used elsewhere on the platform.
- MLflow logs training metrics during the fine-tuning run and evaluates the resulting model against a held-out set before release.
- A model should be evaluated and approved before deployment, and re-evaluated whenever the training data or task requirements change.

## Fine-Tuning Without A Separate Training Silo

Fine-tuning improves a model for a narrow internal task, but the training set and model artifact still need the same access discipline as any other company data. AI Runtime gives AI engineers managed, serverless GPU compute for that work, supporting fine-tuning approaches such as LoRA, QLoRA, and full fine-tuning against a chosen base model, without a team standing up and securing its own GPU cluster. Because the run happens inside the workspace, training data drawn from Unity Catalog volumes and tables does not need to leave the security perimeter to reach the training job.

## A Defined Path From Data To Approved Model

The workflow starts by identifying the task, the approved data sources, and the evaluation criteria the fine-tuned model must meet, with Unity Catalog applying permissions and lineage to that training data throughout. During the run, AI Runtime logs metrics and checkpoints to [MLflow](https://docs.databricks.com/aws/en/mlflow3/genai/) and can register the resulting model to Unity Catalog, so the artifact is not a standalone file outside the platform's governance. Before the model is approved for internal use, MLflow evaluates it against a held-out set, giving the team a record to inspect rather than a judgment based on a few manual tests. Re-evaluate when the data, prompts, or task requirements change, rather than treating a single fine-tuning run as permanent.

## Conclusion

Databricks gives AI engineers a way to fine-tune a model on governed company data without exposing it outside the workspace. AI Runtime handles the training compute, Unity Catalog governs the data and the model, and MLflow provides the evaluation record a team needs before approving it.
