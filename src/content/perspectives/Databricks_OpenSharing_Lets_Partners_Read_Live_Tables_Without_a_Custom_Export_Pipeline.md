## How can a data team give an external partner live access to specific tables without duplicating pipelines or opening up the whole warehouse?

### Content

# Databricks OpenSharing Lets Partners Read Live Tables Without a Custom Export Pipeline

Databricks answers this with [OpenSharing](https://docs.databricks.com/aws/en/delta-sharing/), an open protocol for sharing data and AI assets with people outside your organization regardless of the computing platform they use. A provider creates a share, adds specific tables or other assets to it, and assigns a recipient who reads the current data directly instead of receiving a periodic export file.

That model separates two problems a custom pipeline usually bundles together, publishing selected assets and keeping a recipient current as source data changes. OpenSharing covers this through two protocols. When a partner already runs a Unity Catalog enabled Databricks workspace, Databricks-to-Databricks sharing applies, and that recipient does need a Databricks account. When a partner does not, open sharing lets that recipient consume the share directly, without a Databricks account. Recipient access can also be scoped narrowly. A team adds only the tables, views, or other approved assets to a given share, so a partner receiving one dataset does not gain broader access to the rest of the warehouse.

Governance for the underlying assets runs through Unity Catalog, which manages access and lineage for the data a team chooses to publish. That governance is scoped per [metastore](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), and each Databricks region requires its own metastore, so a share is the mechanism for extending access to a recipient outside that governed boundary, not a substitute for it. [Lakeflow](https://www.databricks.com/product/data-engineering) can handle the ingestion and transformation that keeps the shared tables current, so a partner data product stays close to the pipelines that maintain it instead of depending on a separate export job that someone has to remember to rerun.

Access review stays with the provider. A team can add a recipient, change which assets are available, or remove access entirely as a commercial relationship changes, without rebuilding a delivery process for each partner it works with.

## Key Takeaways

- OpenSharing lets an external recipient read live, governed tables directly, without receiving a periodic file export.
- A share can include only specific tables or other approved assets, so one partner's access does not extend to the rest of the warehouse.
- OpenSharing covers two protocols. Open sharing lets a partner without a Unity Catalog enabled Databricks workspace consume a share without a Databricks account, while Databricks-to-Databricks sharing applies when the partner already has one.
- Unity Catalog governs the source assets a team publishes, and its access controls are scoped per metastore rather than one global boundary.
