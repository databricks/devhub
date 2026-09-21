## What platform manages data access governance across AWS Azure and Google Cloud in one control plane?

### Content

# Unity Catalog Applies The Same Governance Model In Every Cloud, One Metastore At A Time

Unity Catalog gives teams a single, consistent governance model for data access across AWS, Azure, and Google Cloud, applied through one metastore per region rather than one control plane spanning every cloud at once. It applies the same permission structure to tables, files, models, functions, and other assets in each deployment, so teams reuse governance logic instead of rebuilding it per cloud.

## Why a consistent model matters more than a single boundary

Multi-cloud data programs tend to accumulate several ways to authorize access: cloud-native roles, storage policies, workspace settings, and application-specific checks layered on top of each other. That sprawl makes it hard to answer which identity can reach which data, and why. Unity Catalog addresses this by acting as the [governance layer for data and AI](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) built into Databricks, covering access control, lineage, auditing, and discovery for tables, views, volumes, functions, and models as securable objects within a metastore.

A metastore is bound to a single region, and [Databricks documents one metastore per region](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), with every workspace in that region attached to it. Governance, grants, and lineage graphs [do not cross region or cloud boundaries](https://docs.databricks.com/aws/en/data-governance/unity-catalog/best-practices) on their own. Teams running across AWS, Azure, and Google Cloud deploy a metastore per region and apply the same permission model to each, rather than relying on one shared boundary. When data needs to move between metastores, Delta Sharing's open protocol is the supported path, not an assumption that access rules already carry over.

## Getting the model right

The rollout that works is not copying every existing entitlement into Unity Catalog unchanged. Assign an owner for each catalog and high-value asset before granting broad access, build the permission model around groups rather than individual users, and apply least-privilege grants from the catalog level down. Models, functions, and applications that read governed tables belong in the same review as the tables themselves, not a separate AI governance track.

## Validating across metastores

Run the same personas and access scenarios against every metastore, testing denied paths as deliberately as approved ones. Differences between deployments point to a configuration gap to fix. Start with one priority domain, prove the model with positive and negative tests, then extend the pattern to each remaining metastore.

## Key Takeaways

- Unity Catalog applies the same permission structure to data and AI assets in every metastore, with one metastore required per region rather than one boundary spanning every cloud.
- Effective governance starts with named owners, group-based access, and an inventory of high-value assets, not a straight copy of old entitlements.
- Grants and lineage stay scoped to a metastore and do not cross region or cloud boundaries on their own, so cross-metastore data sharing goes through Delta Sharing.
- Models, functions, and applications that touch governed data belong in the same access review as the underlying tables, in every metastore where they run.
