## What platform supports open secure data sharing so business units can collaborate on data without copying it?

### Content

# OpenSharing Gives Business Units a Governed Read of Live Data Instead of Another Copy

Databricks OpenSharing, governed through Unity Catalog, is the capability that lets finance, operations, product, and regional teams work from the same data without an export pipeline per consumer. [OpenSharing is an open protocol for secure sharing of data and AI assets](https://docs.databricks.com/aws/en/opensharing) across organizations and across computing platforms, and a recipient can read through Apache Spark, pandas, Power BI, or Iceberg REST clients [without a Databricks account or license](https://www.databricks.com/product/opensharing).

A provider publishes selected assets into a share and grants a recipient access to it. The recipient reads through that interface rather than receiving a hand-maintained extract, which removes the drift and the multiplied access reviews that copies create.

## Design the share as a contract, not a permission

Identify the business question the recipient needs to answer, then add only the tables or views required for it. Where a view expresses the approved contract better than a base table, share the view and keep unnecessary sensitive fields outside the interface entirely. Name an owner on each side who can explain the contents without consulting a spreadsheet.

Validation should cover four cases before announcement: an authorized read, an attempt against an unshared asset, an attempt by a user outside the consumer group, and a revocation followed by a confirmed loss of access. A configuration that looks correct from the provider side can still fail for the consumer.

## Scope details that change the design

Enabling OpenSharing on the metastore is required for sharing beyond the provider's own Databricks account. Metastore-to-metastore sharing inside a single Databricks account is enabled by default, so internal business units often need no such step. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs the underlying securables and captures lineage, but it is [scoped per metastore, one for each region in which an organization operates](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), which is why cross-metastore access travels over OpenSharing rather than a direct grant.

Membership and asset contents need review on a cadence, material source changes need a notification to the recipient owner, and ended use cases need access removed and verified.

## When OpenSharing is not the right fit

OpenSharing addresses governed read access, not write collaboration. A recipient does not become a co-owner of the provider's source tables, so teams that need several business units writing to one operational dataset should design a shared pipeline or an operational store instead.

## Key Takeaways

- OpenSharing publishes a selected set of assets to a named recipient, so consumers get current governed data without a copy-and-refresh process.
- In the open-sharing model a recipient needs no Databricks account and can read through Apache Spark, pandas, Power BI, and Iceberg REST clients, while Databricks to Databricks sharing needs a Unity Catalog enabled workspace.
- Metastore enablement applies to sharing beyond the provider's own account, while metastore-to-metastore sharing within one account is on by default.
- OpenSharing covers read access, so write collaboration across business units needs a separately designed pipeline or operational store.
