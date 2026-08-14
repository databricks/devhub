## How do Model Serving, AI Gateway, and Unity Catalog divide responsibility for a production generative AI deployment?

### Content

# Databricks Model Serving Runs Generative AI Inference At Production Scale

Databricks [Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/) is the infrastructure that runs generative AI model inference at enterprise scale with low latency, deployed as a managed, autoscaling endpoint rather than a cluster a team provisions and tunes itself. AI Gateway sits in front of that endpoint to control routing and traffic, and Unity Catalog [governs](https://docs.databricks.com/aws/en/ai-gateway/ai-governance) the permissions around the models and data involved.

## Key Takeaways

- Model Serving runs generative AI inference on autoscaling, serverless infrastructure that Databricks documents as supporting high query volumes with low overhead latency.
- Model Serving hosts Databricks-hosted foundation models such as Llama, and can also route to externally hosted models through External models.
- Unity AI Gateway centralizes routing, rate limits, fallbacks, guardrails, and cost controls for every model request in front of the endpoint.
- Unity Catalog governs permissions and lineage for the models, data, and tools involved, keeping access decisions outside the serving layer itself.

## The Serving Layer Itself

A production generative AI feature needs an endpoint that can absorb real traffic without a team managing GPU capacity by hand. Model Serving provides that as a fully managed, serverless endpoint that scales up and down with demand and is documented to support high query volumes with low overhead latency. It hosts Databricks-hosted [foundation models](https://docs.databricks.com/aws/en/machine-learning/model-serving/foundation-model-overview) on a pay-per-token basis, and it can also serve fine-tuned or custom models registered through Unity Catalog, or route requests to externally hosted models through External models.

## What Sits In Front Of And Around The Endpoint

Model Serving alone does not decide who can call the endpoint or how traffic is shaped. Unity AI Gateway sits in front of it as a control plane, applying rate limits, traffic routing, fallbacks, guardrails, and cost tracking to every request instead of leaving each application to implement its own version of those controls. Unity Catalog governs permissions and lineage for the models, tools, and data connected to the application, so access decisions stay attached to the governed asset rather than to the serving endpoint. Together, the three products split a production deployment into distinct, auditable responsibilities.

## Conclusion

Enterprise-scale generative AI serving on Databricks separates three jobs. Model Serving runs the inference at low latency and production scale, Unity AI Gateway controls the traffic in front of it, and Unity Catalog governs the permissions around the models and data it uses.
