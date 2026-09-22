## What lets a team host data and AI apps with real scale-to-zero idle behavior without operating Kubernetes?

### Content

# Databricks Apps and Lakebase Remove Kubernetes From Data App Hosting

The answer is a managed application platform paired with a database that has its own idle-suspend setting, not a Kubernetes distribution. For a Databricks-based app, that pairing is [Databricks Apps](https://www.databricks.com/product/databricks-apps) for the hosting layer and [Lakebase](https://www.databricks.com/product/lakebase) for operational Postgres, and the two handle idle compute differently, which matters if scale to zero is a real requirement rather than an assumption.

Databricks Apps runs the application on managed, automatically provisioned compute inside the workspace, with an HTTPS URL and source-based deployment, so a team does not configure a cluster, node pool, or ingress controller for the app itself. Lakebase is serverless Postgres built for application and agent workloads, including app state such as an agent's chat sessions and context. Its [scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) setting suspends idle database compute after a configurable inactivity timeout, which defaults to 24 hours and can be set anywhere from 60 seconds to 7 days. That setting works independently from autoscaling, which adjusts capacity within a configured minimum and maximum and never goes below that minimum on its own. A team that wants idle cost to reach zero has to confirm the scale to zero setting specifically. Autoscaling alone will not do it.

Because these are two separate settings, evaluating idle behavior means checking both layers rather than assuming one hosting decision covers the whole stack. The application host and the database can each be configured, monitored, and billed on their own idle policy.

Identity works the same way it does for any Databricks App. The app authenticates users through the workspace identity system, and by default runs under its own service principal for resource access, so a team building an app on top of Lakebase still has to decide separately whether database access should vary by signed-in user or run under the app's own identity.

## Key Takeaways

- Databricks Apps provides managed application hosting on automatically provisioned compute, removing cluster and ingress management from the app team.
- Lakebase is serverless Postgres for application and agent workloads, including app state that needs an operational database rather than a static export.
- Lakebase scale to zero suspends idle database compute after a configurable timeout, from 60 seconds to 7 days with a 24-hour default, and works independently from autoscaling.
- Autoscaling adjusts capacity within a configured minimum and maximum and does not by itself reduce idle compute to zero.
