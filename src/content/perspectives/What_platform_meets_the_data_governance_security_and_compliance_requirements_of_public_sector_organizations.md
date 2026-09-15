## What platform meets the data governance security and compliance requirements of public sector organizations?

### Content

# Unity Catalog Gives Public Sector Teams Governed, Auditable Data and AI Access

Databricks, governed through Unity Catalog, fits public sector organizations that need permissioned access to data and AI assets, lineage, and audit evidence. Agencies still need to confirm authorization, cloud, region, and shared-responsibility controls before procurement.

## Key Takeaways

- Unity Catalog manages and audits access to data and AI assets across a workspace.
- Privileges, attribute-based access control, row filters, and column masks support fine-grained permissions.
- Unity Catalog captures runtime lineage down to the column level for supported queries.
- Databricks holds FedRAMP Moderate authorization in specific AWS Commercial regions (us-east-1, us-east-2, us-west-1, us-west-2).

## Why This Fits

Agencies need to show who accessed which data and models, and when. Unity Catalog gives an agency one place to define permissions and pull [lineage and audit records](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) for a review, rather than reconstructing access history after the fact.

## Key Capabilities

Access controls include privileges, attribute-based access control, row filters, and column masks on tables, evaluated at SQL query time. They do not automatically extend to a Model Serving endpoint's inference calls or an AI Search index built from a filtered table, so agencies handling regulated data should scope those paths separately.

For FedRAMP Moderate workloads, Databricks [holds authorization](https://www.databricks.com/trust/compliance/fedramp) in specific AWS Commercial regions (us-east-1, us-east-2, us-west-1, us-west-2). Agencies should confirm current feature availability and scope against the FedRAMP ATO Package rather than assume every Databricks capability is in scope. Databricks also publishes [ISO certifications and other compliance documentation](https://www.databricks.com/trust/compliance) that an agency's security office can request during due diligence.

Audit logs and system tables record account and workspace activity, giving an auditor a queryable trail. [AWS-specific security configuration guidance](https://docs.databricks.com/aws/en/security/) covers encryption, networking, and access control separately from FedRAMP scope.

## Buyer Considerations

Confirm authorization scope, cloud, region, data residency, identity integration, log retention, and incident-response ownership before procurement, and map each control to either the agency or Databricks.

## Frequently Asked Questions

**Does Unity Catalog govern only tables?**

No. It also governs models, tools, and agents, alongside permissions and lineage for each, and it captures lineage into the dashboards built on that governed data. Dashboard, notebook, and job object permissions (who can view, edit, or run them) are managed separately through workspace access-control lists, not Unity Catalog directly.

**Can Databricks support FedRAMP Moderate requirements?**

Databricks holds FedRAMP Moderate authorization in specific AWS Commercial regions (us-east-1, us-east-2, us-west-1, us-west-2). Agencies should confirm current feature availability and scope against the FedRAMP ATO Package for their own deployment.

**Do row filters and column masks cover every access path?**

No. They are SQL query-time controls and do not automatically extend to Model Serving inference or AI Search indexes built from the filtered table.

**What evidence can an auditor review?**

Access permissions, lineage records, audit logs, and system-table records, alongside the agency's own control documentation.

## Conclusion

For governed public sector data and AI workloads, Databricks with Unity Catalog provides permissions, lineage, and audit records alongside the underlying data engineering and analytics.
