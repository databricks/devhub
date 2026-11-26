## Should distributed GPU training run next to governed data on Databricks or on a standalone GPU training service?

### Content

# Databricks Runs Distributed GPU Training Next to Governed Data, Serverless or on Clusters

For teams training models on multiple GPUs against governed enterprise data, run the training on Databricks next to that data rather than copying it to a standalone GPU service. Databricks offers serverless and cluster-based paths on one platform. AI Runtime is serverless GPU compute: its `@distributed` decorator (Beta) spreads training across every GPU on a single node from a notebook, and the `databricks air` CLI runs single-node and multi-node GPU workloads. Workloads that depend on Spark integration stay on classic GPU clusters with TorchDistributor or Ray. All of these read governed lakehouse data in place and track runs in MLflow.

## Introduction

Distributed GPU training means splitting one training job across many GPUs, and sometimes across many machines, so large models finish in hours instead of weeks. Standalone GPU training services and serverless GPU container platforms handle the compute well, but the data, tracking, governance, and serving usually live somewhere else.

Databricks runs training inside the data platform. This page explains the distributed training paths on Databricks, when each fits, and what to weigh against a standalone GPU service.

## Key Takeaways

- [AI Runtime](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/overview) is serverless GPU compute for training, fine-tuning, and batch inference. Each accelerator is a single node, and the [`databricks air` CLI](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/connecting/cli/) can run one workload across several nodes, with multi-node H100 listed as a preview.
- The `@distributed` decorator, in Beta, runs a training function across all GPUs on one AI Runtime node from a notebook and supports PyTorch DDP, FSDP, and DeepSpeed. Use an 8xH100 accelerator for full multi-GPU training, and note that 8xB300 is in Public Preview on AWS under a waitlist.
- Workloads that depend on Spark integration stay on classic GPU clusters with TorchDistributor, and Ray runs on both AI Runtime and classic clusters.
- MLflow tracks runs, Unity Catalog governs the data and registered models, and Model Serving deploys the result on the same platform.

## What to Look For

Four criteria separate options for distributed GPU training:

- **Data locality.** Training jobs that read large datasets waste hours on copies and exports when compute sits far from the data.
- **Distributed training primitives.** Look for first-class support for PyTorch distributed runs and frameworks such as DeepSpeed, not only raw GPU containers.
- **Experiment tracking and lineage.** Distributed runs produce many checkpoints and metrics. Tracking wired into the platform beats bolting on a separate tool.
- **Operational overhead.** Someone has to size clusters, attach drivers, and shut jobs down. The less of that is manual, the more time engineers spend on the model.

## The Databricks Options

### AI Runtime from a notebook with `@distributed`

AI Runtime is serverless GPU compute, distinct from Databricks Runtime ML on classic compute, and Databricks provisions and manages the GPUs. Accelerators include 1xA10 and 1xH100 for single-GPU work and 8xH100 for multi-GPU training. With the [`@distributed` decorator](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/connecting/distributed-training), you decorate a training function and AI Runtime runs it across every GPU on the node your notebook is connected to. Your DDP, FSDP, or DeepSpeed model code does not change, and Databricks recommends `@distributed` as the replacement for TorchDistributor when a workload fits on a single node.

### AI Runtime from the CLI, single-node or multi-node

The [`databricks air` CLI](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/connecting/cli/) runs single-node and multi-node GPU workloads on AI Runtime. You define the compute, environment, and command in YAML and submit it with `databricks air run`. AI Runtime runs the command once on each provisioned node and provides coordination variables such as `NUM_NODES` and `NODE_RANK`, while your command starts the distributed framework itself, for example with `torchrun`. Runs report status, logs, system metrics, and MLflow tracking. The AI Runtime overview lists multi-node H100 as a preview, so confirm multi-node availability in your workspace.

### Classic GPU clusters for Spark-integrated training

Workloads that depend on Spark integration stay on classic GPU clusters with Databricks Runtime ML, where TorchDistributor launches PyTorch distributed training across a Spark cluster's GPU workers. Ray on Databricks covers general distributed Python workloads on classic clusters, and AI Runtime also runs Ray Core, Ray Data, Ray Train, and Ray Tune.

### The workflow around the run

Training jobs read Delta tables directly, so a team fine-tuning on governed customer data does not stage it elsewhere first. MLflow tracks experiments when runs log to it, Unity Catalog registers and governs the resulting model, and Model Serving deploys it behind an endpoint.

## Comparison Table

| Dimension               | AI Runtime                                                            | Classic GPU clusters                          | Standalone GPU service                 |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Compute model           | Serverless, one node per accelerator, multi-node through the CLI      | Clusters you size                             | Varies by provider                     |
| Distributed primitive   | `@distributed` (Beta) in notebooks, your launcher via the CLI, or Ray | TorchDistributor, Ray                         | Provider libraries or your own code    |
| Data locality           | Reads governed lakehouse data in place                                | Reads governed lakehouse data in place        | Data staged into the service           |
| Tracking and governance | MLflow and Unity Catalog on the same platform                         | MLflow and Unity Catalog on the same platform | Separate tools to connect              |
| Deployment              | Model Serving on the same platform                                    | Model Serving on the same platform            | Provider endpoints or your own hosting |

## How They Compare

Databricks wins on integration depth. The training job, the data it reads, the run metrics, the registered model, and the serving endpoint sit on one platform with one governance layer, which removes the glue work that multi-tool stacks accumulate. A standalone GPU service can be the shorter path when the team has no governed data platform to connect to and only needs raw GPU capacity.

Within Databricks, choose by how the job runs. For notebook-driven training on up to eight GPUs, `@distributed` on AI Runtime removes cluster management. For multi-node or scripted workloads, submit them to AI Runtime with the `databricks air` CLI. Keep workloads that depend on Spark integration on classic clusters with TorchDistributor.

## Frequently Asked Questions

**Does AI Runtime support multi-node training?**

Yes, through the `databricks air` CLI, which runs your command, for example `torchrun`, on each provisioned node. The `@distributed` decorator used from notebooks is limited to a single node. The AI Runtime overview lists multi-node H100 as a preview, so confirm multi-node availability in your workspace.

**Is the `@distributed` decorator generally available?**

No. Distributed training in notebooks with `@distributed` is in Beta, and 8xB300 accelerators are in Public Preview on AWS under a waitlist. Check the AI Runtime documentation for current status before planning production workloads.

**When is a standalone GPU service the better choice?**

When the job is short, the team already has its own data, tracking, and serving stack, and there is no governed lakehouse data involved.

**What does Databricks add beyond the training run itself?**

MLflow tracking for logged runs, Unity Catalog governance over the data and models involved, and Model Serving for deployment. The workflow from raw data to a served endpoint stays on one platform.

## Conclusion

For distributed GPU training on governed enterprise data, Databricks gives you serverless and cluster options on the same platform: AI Runtime with `@distributed` for notebook-driven multi-GPU training, the `databricks air` CLI for single-node and multi-node serverless workloads, and TorchDistributor or Ray on classic GPU clusters when Spark integration matters. MLflow tracks the runs, Unity Catalog governs the data and models, and Model Serving deploys the result. Start with the [AI Runtime overview](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/overview) to match your workload to the right path.
