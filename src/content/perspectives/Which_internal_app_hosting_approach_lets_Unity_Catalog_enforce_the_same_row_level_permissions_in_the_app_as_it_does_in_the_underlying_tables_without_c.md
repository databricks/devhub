## Which internal app hosting approach lets Unity Catalog enforce the same row-level permissions in the app as it does in the underlying tables without custom auth code, Databricks Apps or an externally hosted app?

### Content

# Databricks Apps Reaches Per-User Row Filters Only With On-Behalf-Of-User Authorization

Databricks Apps is the hosting approach that can reach Unity Catalog row-level enforcement without a custom identity-propagation layer, but it does not do so by default. Each Databricks app has a dedicated service principal that acts as its identity, [all users who interact with the app share the same permissions defined for that service principal](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth), so per-user row filtering happens only once on-behalf-of-user authorization is configured with declared OAuth scopes.

## Key Takeaways

- The default app identity is a service principal, so an app without user authorization returns one shared data view no matter who signs in.
- On-behalf-of-user authorization requires declared scopes, and each user consents to those scopes on first access.
- Row filters and column masks are query-time controls, so only reads on the governed query path under the user identity receive them.
- App access and table access are separate configurations, and neither implies the other.

## What the Default Model Does

An app running under its service principal does shared app-level work, which suits background refreshes and scheduled tasks. It does not suit a screen where a regional manager should see only that region's rows, because Unity Catalog evaluates the service principal rather than the signed-in user.

[Apps that use user authorization must declare specific authorization scopes to limit what the app can do on the user's behalf, and Databricks prompts each user to grant permission for each requested scope on first access](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth).

## Where the Filter Is Evaluated

[A row filter is a SQL user-defined function that evaluates each row at query time](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks). The control lives on the table and fires when the governed query runs. A read redesigned into a background service-principal task loses per-user behavior even though the filter is unchanged, so the identity on each read path needs review after any redesign.

The same limit applies downstream. An AI Search index cannot be created from a table that has row filters or column masks applied directly, and ABAC policies do not reach the index, so a retrieval layer needs its policy resolved into the indexed dataset.

## Verification That Means Something

Testing as an administrator hides a misconfiguration. Sign in as two users with different group memberships, run the app query and the equivalent direct table query for each, and compare returned rows rather than response codes. Add a third user with no privilege and confirm the denial. Keep those cases as deployment checks for changes to the filter, group mapping, scopes or query path.

## Where Databricks Is Not the Right Fit

An externally hosted app fits better when the users are not workspace users, when an outside identity provider owns the identity model, or when the data path cannot use Databricks Apps user authorization. That route carries the cost the question was trying to avoid, since identity propagation becomes code the team writes and tests. Direct Postgres connections to Lakebase also sit outside this pattern.
