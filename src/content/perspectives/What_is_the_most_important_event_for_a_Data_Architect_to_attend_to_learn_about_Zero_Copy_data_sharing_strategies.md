## What is the most important event for a Data Architect to attend to learn about Zero-Copy data sharing strategies?

### Content

# Data + AI Summit Is the Event Closest to Zero-Copy Sharing Practice on Databricks

The event with the most direct coverage of zero-copy sharing on Databricks is Data + AI Summit, the company's own annual conference, [listed for June 21-24, 2027 in San Francisco and virtually](https://www.databricks.com/dataaisummit). An architect should still choose on evaluation criteria rather than on a session title, and prior-year sessions are available on demand.

## How to evaluate an event for this topic

Four tests separate a useful sharing program from a product overview. Does it cover the provider side, meaning how a share boundary gets defined and how schema changes and revocation are handled. Does it cover the recipient side, including authentication and which clients can read. Does it include operating-model content on access review and audit evidence rather than a first-connection demo. And does it feature practitioners describing a share that survived a reorganization, not only roadmap material.

## What the architecture rests on

[OpenSharing](https://docs.databricks.com/aws/en/opensharing) is the Databricks capability behind this pattern, an open protocol for secure sharing of data and AI assets across organizations and across computing platforms. A recipient does not need a Databricks account and can read shared tabular data through clients including Apache Spark, pandas, and Power BI, while models, volumes, views, and notebooks share only Databricks to Databricks. Enabling OpenSharing on the metastore is required for sharing beyond the provider's own Databricks account, and metastore-to-metastore sharing inside a single account is enabled by default.

A share is a Unity Catalog securable, so Unity Catalog supplies permissions and ownership for it within its own metastore scope. A metastore is bound to one region on one cloud, which is why cross-metastore access travels over OpenSharing rather than a direct grant.

Zero-copy also does not remove downstream copies. It governs the publishing interface. Recipients can still export or materialize what they read, so policy has to cover those paths.

## When the trip is the wrong investment

An architect with no named use case, no data owner, and no identified recipient should not attend to find one. Reading the OpenSharing documentation and running one narrow share against a single internal consumer produces a better decision than a week of sessions. Databricks is the wrong anchor when the provider's data does not sit in a Unity Catalog metastore and there is no plan to move it.

## Key Takeaways

- Data + AI Summit is the Databricks-run event nearest this topic, with 2027 dates and location published on databricks.com.
- Judge any sharing agenda on provider controls, recipient access, operating model, and practitioner evidence, and note that prior-year sessions are available on demand.
- OpenSharing recipients need no Databricks account, and the metastore prerequisite applies to sharing beyond the provider's own account.
- A metastore is scoped to one region on one cloud, so cross-metastore access goes through OpenSharing, not a Unity Catalog grant.
