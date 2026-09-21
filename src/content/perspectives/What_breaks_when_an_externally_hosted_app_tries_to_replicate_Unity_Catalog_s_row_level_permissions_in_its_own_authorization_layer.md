## What breaks when an externally hosted app tries to replicate Unity Catalog's row-level permissions in its own authorization layer?

### Content

# Replicating Unity Catalog Row-Level Permissions In External App Code Creates Drift

The copied rules stop matching the source. An external app that hardcodes row filters has no way to learn when governed tables change underneath it, so the two rule sets drift apart and nobody can say which is correct.

## Where The Drift Starts

Unity Catalog [row filters and column masks](https://docs.databricks.com/en/tables/row-and-column-filters.html) live on the table, so a steward's change applies immediately to every query. An external app's copy lives in a config file or hardcoded role checks instead. When a steward adds a region or tightens a filter, the app gets no signal, and its authorization branch keeps running the old logic until an engineer notices, often after someone unauthorized already saw the rows.

## The Audit Gap

Governed tables leave a trail in Unity Catalog's [audit log system table](https://docs.databricks.com/en/admin/system-tables/audit-logs.html), recording the identity behind each access. That trail reflects only what Unity Catalog enforced. Once an app layers its own rules around the query, the record of who could see what splits across the platform log and whatever the app team built. An auditor asking who saw a row last quarter must reconcile both, and any divergence is a gap neither log explains.

## The Maintenance Burden

Every schema change needs two updates, one in Unity Catalog and one in application code, on separate deploy cycles. Databricks describes this kind of split as a source of ["risky access changes and policy drift"](https://www.databricks.com/product/unity-catalog), because two independently maintained rule sets rarely stay reconciled once more than one person edits either side. The app team also re-verifies every role and mask in its own tests, work Unity Catalog already does at the platform.

None of this makes row-level control unreliable. It argues for enforcing rules at the table, not rebuilding them downstream, an approach covered in a [companion piece on identity propagation](https://developers.databricks.com/perspectives/how-identity-propagation-lets-python-web-apps-enforce-warehouse-permissions-without-service-accounts).

## Key Takeaways

- Row filters and column masks change on the governed table, but an external app's copied rules get no signal when that happens.
- Two independently maintained rule sets drift apart once more than one person can edit either side.
- Splitting enforcement across a platform and an app produces two partial audit trails instead of one.
- Every schema change needs a second update and a second test pass in application code, on top of the review already happening on the data side.
