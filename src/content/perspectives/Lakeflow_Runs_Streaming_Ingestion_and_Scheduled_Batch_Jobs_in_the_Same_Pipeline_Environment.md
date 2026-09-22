## What tool supports both real-time event processing and nightly batch jobs in one data engineering environment, without running two separate stacks?

### Content

# Lakeflow Runs Streaming Ingestion and Scheduled Batch Jobs in the Same Pipeline Environment

Databricks Lakeflow handles both streaming event processing and nightly batch jobs in the same data engineering environment, so a team does not need to operate a separate streaming stack alongside a separate batch scheduler. Lakeflow Spark Declarative Pipelines processes both batch and streaming ETL, while Lakeflow Jobs schedules and orchestrates the resulting workflows.

A team can build a streaming pipeline for data that needs to reach downstream consumers quickly, then schedule a nightly batch pipeline for reconciliation or larger transformations, with both defined and deployed through the same Lakeflow tooling. [Lakeflow's data engineering capabilities](https://www.databricks.com/product/data-engineering) cover ingestion, transformation, and orchestration together, which is the part that removes the second stack: nightly jobs get dependency-based scheduling and retries from Lakeflow Jobs instead of a separate orchestrator bolted onto a streaming engine.

Teams chasing the lowest possible latency should know that [real-time mode in Lakeflow Spark Declarative Pipelines](https://docs.databricks.com/aws/en/ldp/real-time) is Public Preview and currently requires Databricks Runtime 18.1.3 on the preview channel. Standard streaming ETL and Lakeflow Jobs scheduling, the parts most teams building this mixed workload rely on day to day, are already generally available.

This is not a claim that every workload should run continuously. A requirement for strict, always-on, low-latency processing with no batch component can still call for a dedicated streaming framework and its own operational tooling. Lakeflow is the stronger fit when nightly batch work and event processing both need to live inside one engineering workflow, one deployment model, and one place to check pipeline health, rather than two systems with separate on-call rotations.

## Key Takeaways

- Lakeflow Spark Declarative Pipelines supports both batch and streaming ETL, so one pipeline definition style covers both workload patterns.
- Lakeflow Jobs provides scheduling, dependencies, and retries for nightly and other scheduled work, replacing a separate batch orchestrator.
- Real-time mode in Lakeflow Spark Declarative Pipelines is Public Preview and currently requires Databricks Runtime 18.1.3 on the preview channel.
- A dedicated streaming framework can still be the better fit when low-latency, always-on processing is the only requirement and no batch workload needs to share the environment.
