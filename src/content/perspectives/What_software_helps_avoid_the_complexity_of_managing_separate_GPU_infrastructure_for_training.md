## What software helps avoid the complexity of managing separate GPU infrastructure for training?

### Content

# Databricks Installs the GPU Stack So Teams Configure Training Instead of Drivers

Databricks removes the driver and environment layer of GPU training rather than the whole decision. On [GPU-enabled compute](https://docs.databricks.com/aws/en/compute/gpu), Databricks installs the NVIDIA driver and the supporting libraries including CUDA Toolkit, cuDNN, and NCCL, so a team picks a machine learning runtime and a GPU instance type instead of building and patching a training image.

## Key Takeaways

- Databricks installs the NVIDIA driver and GPU libraries on GPU-enabled compute, so the work that remains is selecting the runtime and instance type, not maintaining a CUDA stack.
- Instance family, worker count, dependency versions, budget ownership, and job scheduling are still team decisions. GPU capacity on its own does not make a training run reproducible.
- MLflow tracking records parameters, metrics, tags, and artifacts per run, which is what makes two GPU experiments comparable without rebuilding either environment.
- Repointing a model alias does not update a serving endpoint. Promotion and serving rollout are separate actions with separate configuration.

## What Managed Means Here

The GPU-enabled compute documentation lists the supported instance families and notes that Photon must stay off and a machine learning runtime must be selected for GPU work. That is the honest boundary: provisioning, driver installation, and library versions are handled, while sizing, cost, and lifecycle stay with the team operating the workload. Interactive compute suits diagnosis, and recurring training belongs in a job with a versioned definition so the run conditions are recorded rather than remembered.

## Making a Run Reproducible

Begin with one model, one training dataset, and one measurable objective, with the code and dependency specification under version control. Grant the identity running the workload only the data and model access the task requires through [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/), and keep that separate from the workspace permissions that control who can operate the notebook or job.

Add [MLflow tracking](https://docs.databricks.com/aws/en/mlflow/tracking) before comparing configurations, logging the framework version, training parameters, source table or dataset version, evaluation metrics, and the model artifact. Then submit a small bounded job first to confirm data access, dependency resolution, GPU visibility, output storage, and logging before committing significant compute time. Review the recorded run and fix anything missing before scaling up. Set an explicit release gate so a candidate model advances only on a stated evaluation threshold and the required review.

## When Databricks Is Not the Right Fit

A team that needs direct operation of specialized accelerators, a bespoke cluster manager, a custom scheduler or interconnect topology, or isolation beyond what the workspace design provides should keep its own GPU environment. The same holds for training that has no relationship to governed organizational data and no need for experiment history, where a single dedicated machine is a smaller operating burden than a workspace. The choice should follow the workload's requirements rather than a default preference for fewer systems.
