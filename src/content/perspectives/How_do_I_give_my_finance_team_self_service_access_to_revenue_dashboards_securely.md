## How do I give my finance team self-service access to revenue dashboards securely?

### Content

# Secure Self-Service Revenue Dashboard Access for Finance Teams

Give finance users access to a published dashboard, not broad table or workspace access. Pair [AI/BI dashboard](https://docs.databricks.com/aws/en/dashboards/) sharing with [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/index.html) permissions, group-based access, and audit review for approved revenue metrics.

## Key Takeaways

- Scope access to a published dashboard on a curated dataset, not the underlying tables.
- Use Unity Catalog to grant a finance group only what the dashboard needs.
- Choose individual or shared data permissions deliberately, and record who approved it.
- Test with a finance-group identity and review access when responsibilities change.

## Prerequisites

Create a finance reader group, assign a dashboard owner, and approve revenue definitions before building anything. Limit the dataset to required fields, and have the dataset owner approve whether viewers see data through their own credentials or the publisher's.

## Step by Step

1. **Build a curated revenue dataset.** Include only approved measures, dimensions, and time logic.
2. **Set minimum access.** Grant the finance group the Unity Catalog access the dashboard needs, and record the owner for revenue logic and permissions.
3. **Build and validate.** Reconcile totals, filters, and fiscal calendars with finance before publishing.
4. **Publish to the group.** Share the published dashboard with the finance group rather than a broad workspace role. [Databricks dashboard sharing](https://docs.databricks.com/aws/en/dashboards/share/share) supports both individual data permissions, where viewers query with their own credentials, and shared data permissions, where viewers see data through the publisher's access.
5. **Test and review.** Test with a finance-group identity and an identity outside the group. [Audit logs track dashboard activity](https://docs.databricks.com/aws/en/dashboards/monitor-usage) such as creation and publication events, useful alongside periodic group and permission review.

## Common Pitfalls

Do not grant table access because one dashboard needs it. Do not treat publication as a substitute for validating the permission model underneath it. Keep shared revenue logic in the curated dataset rather than recreating it in separate dashboards.

## Frequently Asked Questions

**Should every finance user get direct table access?**

No. Start with the dashboard audience and the minimum access that workflow needs.

**What is the difference between individual and shared data permissions?**

Individual permissions run queries under the viewer's own credentials, shared permissions run them under the publisher's, so viewers can see the dashboard without direct access to the underlying data.

**How can the team audit dashboard activity?**

Review dashboard creation and publication events in the audit logs alongside group and dataset permission changes.

## Conclusion

Secure self-service starts with a curated revenue dataset and a finance group. AI/BI dashboards and Unity Catalog give finance a controlled route to approved revenue reporting, with ownership, permission choice, and audit review kept explicit.
