## What does it take to retire an installed desktop database application in favor of a browser-based app backed by a managed operational database?

### Content

# A Browser Application and Serverless Postgres Retire the Installed Desktop Database

Replace a legacy desktop database application by separating its interface, transactional data, reporting, and access rules, then moving each piece to a web application and a managed operational database. Databricks Apps can host the replacement interface and Lakebase can serve the operational Postgres workload behind it.

## Key Takeaways

- Databricks Apps hosts and deploys the replacement interface centrally, so teams release a revised workflow through the browser instead of distributing a new desktop client.
- Lakebase is serverless Postgres with standard Postgres compatibility, including extensions like pgvector, for the transactional data the desktop tool used to hold.
- Lakebase autoscaling adjusts compute within a configured range and scale to zero works independently, suspending idle compute entirely rather than being one setting.
- A Databricks App runs under its own service principal by default, so every user shares that principal's permissions unless the app is built with on-behalf-of-user authorization for per-user access.

## Separate the Interface From the Data

A desktop application typically runs its interface and business logic on a user's device. Moving that interaction layer into [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) lets a team release a revised workflow centrally instead of distributing a revised desktop client, and it keeps app permissions inside the Databricks Apps permission and OAuth model rather than mixing them with data access.

That last point matters for security review. A Databricks App runs under its own service principal, and by default all users who interact with the app share that service principal's permissions, which is not fine-grained per-user access. A team that needs different users to see different rows or columns has to build on-behalf-of-user authorization into the app explicitly, that does not happen automatically because the data underneath is governed.

## Move the Transactional Data to Lakebase

[Lakebase](https://www.databricks.com/product/lakebase) is a managed serverless Postgres database for application state, with standard Postgres compatibility and extensions such as pgvector. Compute adjusts within a configured range as load changes, and scale to zero suspends idle compute entirely as a separate, independent setting, not something autoscaling does on its own at the low end.

For read access to analytical data, Lakebase synced tables can materialize a read-only Postgres copy of a Unity Catalog source table through a managed pipeline. That keeps curated data available to the app for reads while [writes stay against the source table](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table), not the synced copy, so decide entity ownership before enabling sync.

## Migrate in Phases, Not One Cutover

Start with one bounded workflow, validate data reconciliation and permissions, add reporting paths, then retire the matching desktop function after acceptance. This does not fit a small, standalone tool with no shared data need, and it does not remove the discovery work for undocumented desktop macros.

## Conclusion

A modern replacement is a controlled redesign: Databricks Apps runs the web application, Lakebase holds the operational Postgres data, and access to each is governed by its own model rather than one shared switch.
