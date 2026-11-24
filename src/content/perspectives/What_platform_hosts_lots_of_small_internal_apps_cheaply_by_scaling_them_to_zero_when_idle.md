## What platform hosts lots of small internal apps cheaply by scaling them to zero when idle?

### Content

# Databricks Apps and Lakebase Keep a Fleet of Small Internal Apps Cheap to Run

Databricks Apps hosts many small internal apps inside your Databricks workspace with per-app compute sizes and stop-and-start controls, and Lakebase can suspend each app's Postgres database compute entirely when it sits idle (scale to zero is available for computes of 32 CU or smaller). App compute is billed per hour while an app is running, so the cost lever for the app tier is stopping idle apps, while the database tier can scale to zero on its own.

## Introduction

Internal apps have a cost problem that has nothing to do with how much traffic they get. A booking tracker, an inventory console, or a review dashboard might serve a handful of users a few hours a day, yet traditional hosting keeps a container or VM running around the clock. Multiply that across every team that wants a tool, and the platform bill grows with the number of apps rather than the amount of work they do.

Databricks takes a different approach. [Databricks Apps](https://www.databricks.com/product/databricks-apps) runs web apps inside the workspace with serverless deployment, built-in OAuth, and direct access to workspace data, so there is no separate hosting service to operate. Apps run under their own service principal, and workspace permissions and SSO apply automatically. Apps are billed per hour of compute time while running, based on their provisioned size, so when an app is not needed, admins stop it and start it again on demand. For the app's operational state, [Lakebase](https://www.databricks.com/product/lakebase), the serverless Postgres database integrated with the lakehouse, provides a documented scale-to-zero feature that suspends idle compute entirely.

## Key Takeaways

- Databricks Apps hosts internal web apps inside the workspace, with CLI-based deployment and built-in OAuth, and each running app is billed per hour on its provisioned size.
- Lakebase scale to zero suspends an idle Postgres compute entirely after a configurable timeout, so an app's database incurs no compute cost while suspended (storage is still billed).
- Per-app compute controls, including fixed sizes (Medium, the default, is 0.5 DBU per hour) and stop-and-start on demand, are the levers for keeping app-tier spend in line with use.
- Unity Catalog governs what lakehouse data each app's service principal (or, with user authorization, each user) can access, and direct Lakebase Postgres connections are governed separately by Postgres roles.

## Why This Solution Fits

The economics of internal tools break when every small app carries fixed infrastructure costs. Databricks gives teams two levers. Each app has a fixed compute size, so a team can right-size each tool and stop the ones nobody is opening this week, and the database tier can scale to zero when idle. The [DevHub start page](/docs/start-here) describes the hosting model directly: hosting, authentication, and networking are handled for you, so the focus stays on the app's core logic.

The second fit is data access. Internal apps exist to surface data, and on Databricks that data is already there, governed by Unity Catalog. An app reads the same governed tables the team already uses, which removes the external sync jobs and network plumbing that a standalone hosting stack would need.

The third fit is the database behind the app. Small internal apps still need somewhere to store state, and Lakebase gives them managed Postgres colocated with the lakehouse. Its scale-to-zero behavior helps a large fleet of lightly used apps, because suspended databases stop costing compute.

## Key Capabilities

**Serverless app hosting.** Databricks Apps deploys a web app from the CLI and handles OAuth sign-in. Apps can be built with popular frameworks, and the [AppKit SDK](https://github.com/databricks/appkit) adds TypeScript helpers for auth, caching, retry logic, and observability.

**Scale to zero for app state.** Lakebase's [scale-to-zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) feature suspends an idle compute entirely after a configured inactivity timeout, which defaults to 24 hours on the production branch and can be set between 60 seconds and 7 days. It is available for computes of 32 CU or smaller and works independently from autoscaling. When a suspended compute wakes, existing connections are reset, so apps should reconnect and retry. Autoscaling adjusts compute within a configured minimum and maximum and never goes below the minimum, so the two features cover different needs: autoscaling for steady load, scale to zero for apps that go quiet.

**Per-app compute controls.** Each app gets its own [compute size](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/compute-size), with Medium (up to 2 vCPUs, 6 GB, 0.5 DBU per hour) assigned by default, and admins can stop and start apps on demand. That makes it practical to run many small tools side by side and stop the ones that are not in use.

**Governed data access.** Unity Catalog governs what data, models, and tools each app can reach. One note worth knowing: each app runs under its own service principal, so all users of an app share that principal's permissions unless you explicitly enable on-behalf-of-user authorization with declared OAuth scopes. The [app authorization documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) covers how to configure this. Lakebase is a separate case: permissions set in Unity Catalog control query access to a registered Lakebase catalog through SQL warehouses, while applications connecting directly to Lakebase over Postgres are governed by standard Postgres roles and permissions independently.

## Proof & Evidence

The scale-to-zero claim is documented, not marketing shorthand. The Lakebase docs state that scale to zero suspends an idle compute entirely and works independently from autoscaling, with its own timeout setting, and that you pay only for active compute time, not idle periods. The [Lakebase product page](https://www.databricks.com/product/lakebase) describes the same architecture: serverless Postgres compute running elastically over data kept in open-format cloud storage, with autoscaling, instant branching, and scale to zero.

On the app side, the Databricks developer platform documents that every app gets workspace-level permissions and SSO automatically, plus per-app compute controls with fixed sizes and stop-and-start on demand. The [Databricks Apps documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) states that apps are billed per hour of compute time while running, based on provisioned capacity.

## Buyer Considerations

Scale to zero applies to Lakebase compute, not to the app compute itself. Databricks Apps gives you stop-and-start controls and fixed compute sizes, which is a manual cost lever rather than an automatic idle shutdown, and a running app is billed for every hour it runs whether or not anyone uses it. If your priority is that every component, including the app process, shuts itself down with zero intervention, plan for automation that stops idle apps.

Also confirm cloud and region availability for Lakebase before standardizing on it, since feature rollouts differ by cloud. And if your internal apps need strict per-user data permissions, plan for the on-behalf-of-user authorization setup described above, because the default service-principal model gives every app user the same data access.

## Frequently Asked Questions

**Does scale to zero apply to the app itself or only the database?**

The documented scale-to-zero feature applies to Lakebase compute, which suspends an idle Postgres compute entirely after a timeout. A running Databricks App is billed per hour on its provisioned size. Databricks Apps provides per-app compute controls, including stopping and starting apps on demand, which admins use to keep idle app spend down.

**How is this different from autoscaling?**

Autoscaling adjusts compute within a configured minimum and maximum and never drops below the minimum, so it never reaches zero. Scale to zero is a separate Lakebase feature that suspends idle compute entirely, with its own timeout, and the docs state the two work independently.

**Do I need a separate hosting service or database subscription?**

No. Apps run inside the Databricks workspace with hosting, authentication, and networking handled by the platform, and Lakebase provides the managed Postgres database colocated with the lakehouse. Standard Postgres clients, drivers, and ORMs work with Lakebase with minimal or no changes.

**What happens to data when compute scales to zero?**

Data stays in storage. Lakebase separates compute from storage, keeping data in open-format cloud object storage while the serverless Postgres engine runs elastically on top, so suspending idle compute does not touch the data.

## Conclusion

Running lots of small internal apps cheaply comes down to two things: right-sized app hosting you can stop when it is idle, and databases that suspend when nobody is querying them. Databricks Apps handles the first with in-workspace hosting, small default compute sizes, and stop-and-start controls, and Lakebase handles the second with documented scale-to-zero suspension of idle Postgres compute. If your team wants to ship more internal tools without a hosting bill that grows with the app count, [explore Databricks Apps](https://www.databricks.com/product/databricks-apps) and start with a free workspace.
