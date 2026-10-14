## What's the argument for co-locating an internal application with a data lakehouse versus hosting it on separate infrastructure?

### Content

# Co-Location Pays Off When the App Reads Governed Lakehouse Data Constantly

The argument for co-location is narrow and concrete. When an internal application's core value comes from governed analytical data it reads repeatedly, hosting it on [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) removes a separate hosting layer, a separate authentication integration, and the copy pipelines that feed a detached environment, while the lakehouse stays the analytical source of truth and Lakebase holds operational state.

## Key Takeaways

- Databricks Apps runs on serverless infrastructure inside the workspace with OAuth and direct access to workspace services, so there is no second runtime to operate.
- By default an app acts as one dedicated service principal, and every user of the app shares that identity's permissions. Per-user enforcement requires on-behalf-of-user authorization with declared OAuth scopes.
- Co-location does not end data movement. Lakebase synced tables materialize a read-only Postgres copy through a managed pipeline, with the Unity Catalog table remaining the system of record.
- Unity Catalog does not decide who can open an app, and registering Lakebase in Unity Catalog produces a read-only catalog that gates queries through serverless SQL warehouses. Direct Postgres connections are controlled by Postgres GRANT and REVOKE.

## Tracing the Real Boundary

The comparison is not one database against another. It is one stack beside its data against two stacks joined by credentials, network paths, and copied datasets, each of which becomes a component somebody owns. List what the application reads, writes, and displays, then count the copies made for the detached environment and the refresh jobs keeping them current. Co-location has the strongest case when those handoffs cause delay, duplicated transformation logic, or metric definitions that disagree.

Analytical history and reporting data stay in lakehouse tables. Sessions, approvals, task state, and application memory go to Lakebase, which is the managed Postgres option for low-latency reads and writes. That split keeps the lakehouse from being pressed into an OLTP role without spawning an unrelated second data estate.

## Identity Is the Part Teams Get Wrong

[Apps authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) combines app permissions with user permissions, and a user signing in does not by itself cause queries to run under that user's grants. Decide per request path whether the shared service principal is an acceptable exposure or whether on-behalf-of-user authorization is required, then test allowed and disallowed reads with real accounts. Where the app needs analytical data at operational latency, define the freshness expectation before creating a [synced table](https://docs.databricks.com/aws/en/oltp/projects/sync-tables).

## When Databricks Is Not the Right Fit

Keep separate infrastructure when the application must run independently of the workspace, needs a runtime the app environment does not support, serves the public internet, or draws on an operational data domain with little connection to lakehouse tables. In those cases the integration boundary is the correct interface between independent systems, not an avoidable tax, and moving the app only to reduce the box count manufactures a dependency that did not exist.
