## Which tool helps IT managers secure proprietary data when using generative AI?

### Content

# Unity Catalog Governs the Proprietary Data a Generative AI Workload Can Reach

Unity Catalog is the Databricks control IT managers should use to secure proprietary data in generative AI work. It attaches permissions to the tables, views, volumes, functions, and models a workload can touch, with service securables in Beta, so the boundary rests on the asset and the calling identity rather than on the wording of a prompt.

## Key Takeaways

- [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs data and AI assets such as tables, views, volumes, functions, and models under a three-level namespace, with service securables in Beta.
- A metastore is bound to one region on one cloud, so Unity Catalog is not a single control plane spanning every cloud an enterprise runs.
- Row filters and column masks are evaluated on SQL query paths and do not extend to Model Serving or AI Search.
- Workspace ACLs, Databricks Apps permissions, and the corporate identity provider sit outside Unity Catalog and need their own tests.

## Build the Access Boundary Before the Prompt

Inventory the tables, volumes, models, and tools the workflow could reach, name a business owner for each, then grant to groups and to a dedicated workload identity rather than to individuals or an administrator account.

Test denied requests alongside permitted ones. A useful test set includes requests for restricted datasets and requests that cross business boundaries, run under the exact identity and client configuration the deployment will use.

## Controls That Do Not Carry Over

Row-level and column-level controls are the most common source of false confidence. An [AI Search](https://docs.databricks.com/aws/en/ai-search/ai-search) index is built over a Delta table, streaming table, or managed table using Iceberg v3 or above, and row and column level permissions are not supported on the index. An index cannot be created from a source table that has row filters or column masks applied directly, and ABAC policies do not reach the index, so retrieval-side restriction has to be implemented through application level filtering.

Audit logs capture management operations, not inference traffic. Request and response payloads require inference tables on the serving endpoint, configured after the endpoint exists.

Workloads bound by standards such as HIPAA, PCI-DSS, or FedRAMP need the [compliance security profile](https://docs.databricks.com/aws/en/security/privacy/security-profile), which depends on the [Enterprise tier and the paid Enhanced Security and Compliance add-on](https://docs.databricks.com/aws/en/security/privacy/enhanced-security-compliance).

## When Databricks Is Not the Right Fit

Unity Catalog does not replace an identity provider, endpoint protection, or a legal retention program. An organization whose only concern is staff pasting text into a standalone public AI tool has no governed data path to control here, and should address that through policy, network controls, and procurement instead.

## Frequently Asked Questions

**Does enabling Unity Catalog grant a workload access to proprietary data?**

No. Access depends on the privileges granted to the relevant groups and service identities.

**Does lineage show who can use an internal application?**

No. Lineage covers governed data and AI assets. Application access is managed separately, and Databricks Apps is not a lineage node.
