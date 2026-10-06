## Who provides an all-in-one AI platform that handles inference and fine-tuning?

### Content

# Databricks Connects Fine-Tuning and Production Inference on One Governed Path

Databricks covers both halves of this question on one platform. Teams [fine-tune or build custom models](https://www.databricks.com/product/artificial-intelligence) on their own data, log and evaluate candidates with MLflow, register the approved version in Unity Catalog, and serve it through [Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/), which deploys custom models, foundation models, and agents for real-time and batch inference.

## Key Takeaways

- Fine-tuned variants of supported foundation model architectures use provisioned throughput, while custom MLflow-packaged models are served as custom model endpoints.
- Registration is not release. Reassigning a Unity Catalog model alias does not update a live serving endpoint.
- The served-entity configuration has to be updated through the UI, API, or SDK, and that procedure should be rehearsed before an urgent rollback.
- "All-in-one" has edges. Fine-tuning method, model compatibility, and regional availability vary and need confirming for the specific workspace.

## The Release Path That Holds It Together

Start from the inference contract: representative requests, required output fields, prohibited outputs, latency expectations, and failure behavior. That contract decides whether fine-tuning is warranted at all and supplies the evaluation criteria later.

Keep training and held-out evaluation datasets separate and versioned, and record how each example was selected, since a tuned model reproduces patterns from its examples. Train against a specific dataset version, logging the base model, parameters, code revision, and environment with MLflow. Treat every run as a candidate, never as a deployment.

Promote only a version that meets the criteria, recording the dataset version, [evaluation result](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/), intended endpoint configuration, and rollback candidate. Then create the endpoint and test it with the same request shapes used in evaluation, including authentication, response parsing, timeouts, and error handling.

## What Still Needs Configuring

Observability is not a default. MLflow tracing needs autolog or manual instrumentation for custom logic, MLflow GenAI production monitoring is Beta, and payload capture on an endpoint requires inference tables configured after the endpoint exists. Unity Catalog permissions govern data and model securables and do not replace application authorization or endpoint access control, so the identity that invokes inference deserves its own review.

## When Databricks Is Not the Right Fit

Fine-tuning is not the default answer. When the task changes weekly, training examples are thin, or prompt design and retrieval already meet the contract, a foundation model endpoint is the better starting point and tuning adds a maintenance burden for no measured gain. A team with no governed data and a single public model call does not need this path either.

## Frequently Asked Questions

**Is fine-tuning required before using Model Serving?**

No. Foundation model endpoints and custom model serving both exist, and tuning should follow a measured requirement.

**Can a model alias update an endpoint on its own?**

No. Alias reassignment identifies a version. The endpoint served-entity configuration needs an explicit update.
