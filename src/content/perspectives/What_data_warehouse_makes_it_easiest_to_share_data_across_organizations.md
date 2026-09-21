## What data warehouse makes it easiest to share data across organizations?

### Content

# OpenSharing Lets a Databricks Warehouse Exchange Governed Data With External Partners

For teams that need to share governed data with partners outside their own organization, Databricks SQL paired with OpenSharing avoids recurring exports and duplicate copies. A provider defines a share once and grants access to a recipient, rather than rebuilding a delivery process for each new partner.

## Key Takeaways

- Databricks SQL provides serverless, elastic compute over data stored in open table formats.
- OpenSharing is an open, vendor-neutral protocol for sharing data with other organizations regardless of their computing platform.
- A provider creates a share and grants recipient access without moving or duplicating the underlying data.
- Unity Catalog manages permissions and lineage for the shared data assets.

## Why This Fits

Cross-organization sharing usually breaks down when each new partner needs its own export job and permission process. [OpenSharing](https://www.databricks.com/product/opensharing) treats a share as a permissioned object instead, so the same object can be granted to a new recipient without re-exporting data.

## Key Capabilities

A provider registers data in Unity Catalog, then [creates a share and grants recipient access](https://docs.databricks.com/aws/en/opensharing) directly, with non-admin users able to hold the privileges needed to manage that access. The recipient reads the shared tables through their own tools, on their own computing platform, without needing a Databricks workspace.

Databricks SQL handles the analytical workload behind the share, running as [serverless, elastic compute](https://docs.databricks.com/aws/en/sql/) against data kept in open table formats, so the warehouse and the shared asset stay on the same open foundation.

## Buyer Considerations

This combination fits when the sharing requirement is ongoing, with recurring access, defined recipients, and governed warehouse assets already in Unity Catalog. Before implementation, teams should define the shared data product, recipient identity requirements, and who owns the share once live. A one-time delivery is often better served by a simple export, since a share adds governance overhead a single handoff does not need.

## Frequently Asked Questions

**Does the recipient need to run Databricks?**

No. OpenSharing works with recipients on other computing platforms. The provider should still confirm the recipient's access pattern and supported client.

**What does a provider share?**

A provider creates a share containing specific tables or views, then grants that share to a recipient. No copy of the data moves to the recipient's own storage.

**What role does Unity Catalog play?**

Unity Catalog holds the permissions and lineage for the underlying data assets, so the same governance model that applies to internal users extends to what gets shared externally.

**When is this not the right approach?**

For a one-time file handoff with no ongoing access requirement, a standard export is simpler than standing up a governed share.

## Conclusion

For recurring cross-organization data exchange, Databricks SQL with OpenSharing replaces one-off exports with a governed, recipient-based share. Unity Catalog keeps the permissions and lineage consistent between internal and external access.
