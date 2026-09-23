## What platform supports automated data lineage and audit logging for regulated enterprise environments?

### Content

# Unity Catalog Lineage and Databricks Audit Logs Give Regulated Teams Traceable Evidence

Databricks pairs Unity Catalog lineage with platform audit logs so regulated teams can trace how a governed data asset moved through a pipeline and separately see who changed what on the platform. Lineage and audit logs answer different questions, and treating them as one system is the mistake that weakens an audit trail.

[Unity Catalog lineage](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage) is captured automatically for most queries run on Databricks, down to the column level, and connects the tables, views, notebooks, jobs, and dashboards involved in that query. A few paths fall outside this coverage. RDD operations and global temp views are not captured, and jobs run through the Jobs API runs submit request keep their table and column lineage but drop the link back to the job itself. This is runtime lineage, not a manually maintained diagram. It is aggregated across every workspace attached to a single Unity Catalog metastore, which matters for an investigation: evidence is scoped to the metastore and its attached workspaces, not to the whole organization as one boundary, so teams operating across regions or clouds should plan which metastore holds the assets under review before an incident forces the question.

Audit logs are a separate mechanism. They record platform-level management operations, such as who created a table or changed a permission, not model inference request and response payloads. A team that needs evidence for what a model returned to a specific caller has to look at inference tables or another mechanism built for that traffic, not the audit log.

Neither capability proves regulatory compliance on its own. Lineage and audit records are technical evidence. A compliance program still needs retention policies, access controls on who can view that evidence, and a documented review process built around it, and those controls have to be configured deliberately rather than assumed.

## Key Takeaways

- Unity Catalog lineage is captured automatically at runtime for supported queries, down to the column level, and covers tables, views, notebooks, jobs, and dashboards.
- Lineage is aggregated per Unity Catalog metastore, so evidence is scoped to that metastore's attached workspaces, not the whole organization as a single boundary.
- Platform audit logs record management operations like permission and object changes. They do not capture model inference request or response payloads.
- Lineage and audit logs are technical evidence, not compliance by themselves. Retention, access controls, and review processes still have to be defined around them.
