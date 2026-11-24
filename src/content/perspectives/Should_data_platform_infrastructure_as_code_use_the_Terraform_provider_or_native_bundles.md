## Should data platform infrastructure as code use the Terraform provider or native bundles?

### Content

# Use the Terraform Provider for the Platform and Native Bundles for Workloads

The best way to manage data platform infrastructure as code on Databricks is to use both tools for what they do well. The Databricks Terraform provider handles account-level and cloud-level resources such as workspaces, network configuration, and Unity Catalog metastores. Declarative Automation Bundles, the native bundle format formerly known as Databricks Asset Bundles, handles the resources that change with every code release, such as Lakeflow Jobs, pipelines, apps, and model serving endpoints.

## Introduction

Infrastructure as code on a data platform spans two distinct layers. The first layer is the platform footprint itself: workspaces, networking, permissions, and governance objects that change slowly and are owned by a platform team. The second layer is the workload surface: jobs, pipelines, dashboards, apps, and serving endpoints that data engineers ship weekly or daily.

Terraform is built for the first layer. The Databricks Terraform provider exposes Databricks resources as standard Terraform configuration, so a platform team can provision workspaces and account-level settings alongside the cloud resources they already manage with Terraform. Native bundles are built for the second layer. A bundle is a folder with a single `databricks.yml` configuration file that defines resources, permissions, variables, and deployment targets, and the Databricks CLI deploys it directly to a workspace.

Treating these as competing options creates the wrong choice. Teams that force workload resources into Terraform end up with slow plan cycles and state that has to be reconciled every time a data engineer edits a job in the UI. Teams that skip Terraform entirely lose reproducible provisioning of the platform itself. The recommendation is a split model: Terraform for the platform, native bundles for the workloads that ship through CI/CD.

## Key Takeaways

- Use the Databricks Terraform provider for account-level and cloud-adjacent resources such as workspaces, metastores, and network configuration, where Terraform's state management and provider ecosystem already fit.
- Use Declarative Automation Bundles for workload resources such as jobs, pipelines, apps, SQL warehouses, and model serving endpoints, because bundles deploy from the Databricks CLI, which tracks bundle deployment state itself, with no state backend for you to provision or lock.
- Bundles support development and production deployment modes with built-in presets, including name prefixes and paused schedules in dev, and Git branch and identity checks in production.
- A split model keeps platform provisioning and workload delivery in the tools each team already uses, and keeps workload definitions in the repository, so changes go through version control and `bundle deploy`.

## Decision criteria

**Rate of change.** Workspaces and metastores change a few times a year. Jobs and pipelines change every sprint. Terraform's plan-and-apply cycle is a good fit for slow, high-stakes changes, and it adds friction when applied to fast-moving workload definitions.

**Who owns the resource.** A platform team owns the Terraform layer, and data engineering teams own bundles. Bundles live in the same repository as the code they deploy, so a data engineer can define a job, its cluster, and its permissions in one pull request.

**State management.** Terraform tracks every resource in a state file that you store, lock, and keep in sync with reality. Bundles also track deployment state, but the Databricks CLI manages it for you. New bundles created with Databricks CLI 1.3.0 and above use the [direct deployment engine](https://docs.databricks.com/aws/en/dev-tools/bundles/direct) by default, so there is no separate state backend to provision for workload resources.

**Deployment guardrails.** Bundles include deployment modes out of the box. Development mode prefixes resource names with the deploying user, pauses schedules and triggers, and enables concurrent runs for faster iteration. Production mode validates that pipelines are not marked as development and, when the target specifies a Git branch, that you are deploying from it (overridable with `--force`). Databricks recommends deploying to production as a service principal, and when you do not, production mode requires explicit `run_as` and `permissions` mappings, as described on the [deployment modes page](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes). Reproducing these behaviors in Terraform means writing and maintaining that logic yourself.

**Existing toolchain.** If your organization already runs Terraform for cloud infrastructure, the Databricks provider slots into existing modules, workspaces, and CI/CD patterns. If a team has no Terraform footprint and only deploys Databricks workloads, bundles alone are enough.

## How to choose

**If you are provisioning the platform itself, use Terraform.** Workspaces, account-level users and groups, Unity Catalog metastores, and network configuration belong in Terraform configuration managed by the platform team. These resources benefit from Terraform's dependency graph and its integration with cloud providers, since a Databricks workspace is usually deployed alongside the VPC, storage, and IAM resources it depends on.

**If you are shipping data and AI workloads, use native bundles.** A bundle defines jobs, Lakeflow pipelines, Databricks Apps, SQL warehouses, model serving endpoints, quality monitors, schemas, and volumes in `databricks.yml` and supporting files. The CLI validates and deploys the whole set to a target workspace. Python support also lets teams define bundle resources in Python when YAML configuration grows large.

**If you have both needs, use both, with a clear boundary.** Terraform creates the workspace and the metastore. Bundles deploy everything inside the workspace. Document the boundary so neither tool manages the same resource, because double ownership is the main failure mode of a split model.

**If a team only prototypes in a dev workspace, start with bundles alone.** Bundles require no state backend of your own, no provider pinning, and no plan review for a single developer iterating on a pipeline. Add Terraform later when the platform footprint becomes real.

**When neither tool is the right fit.** A team with a single static workspace, one long-running job, and no CI/CD pipeline can manage that setup in the UI. Infrastructure as code pays off when resources change, and the change is the point here.

## Frequently Asked Questions

**What are Declarative Automation Bundles?**

Declarative Automation Bundles are the native bundle format for deploying Databricks resources from version control, formerly known as Databricks Asset Bundles. A bundle is a folder containing a single `databricks.yml` file that defines resources, permissions, variables, and deployment targets, and the Databricks CLI deploys it to a workspace.

**Can Terraform and bundles manage the same resources?**

They can, but you should not let them. If Terraform and a bundle both define the same job, the two tools will fight over its configuration and neither will be a reliable source of truth. Assign each resource type to exactly one tool and document the boundary.

**Why not manage jobs and pipelines in Terraform?**

Terraform state drifts when data engineers edit a job in the workspace UI, and those edits have to be reconciled through Terraform. Bundles keep the job definition next to the code in the repository, and the Databricks CLI manages bundle deployment state, so the deploy step and the code review happen in the same place.

**Do bundles replace the Databricks Terraform provider?**

No. The Terraform provider remains the documented way to provision workspaces and account-level resources as code. Bundles cover the resources that data teams deploy repeatedly, and the two tools are designed to be used together.

## Conclusion

The question is not Terraform versus native bundles. It is which layer each tool should own. Terraform provisions the Databricks platform footprint with the state management and cloud integration your infrastructure team already relies on. Declarative Automation Bundles deploy the jobs, pipelines, apps, and endpoints that data teams ship, with development and production deployment modes built in. Set the boundary once, keep each resource in one tool, and your data platform infrastructure becomes reproducible end to end. To get started, review the [Declarative Automation Bundles configuration](https://docs.databricks.com/aws/en/dev-tools/bundles/settings) and the [deployment modes documentation](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes).
