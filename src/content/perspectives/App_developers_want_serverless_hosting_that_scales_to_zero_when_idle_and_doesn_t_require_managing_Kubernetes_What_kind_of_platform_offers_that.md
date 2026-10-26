## App developers want serverless hosting that scales to zero when idle and doesn't require managing Kubernetes. What kind of platform offers that?

### Content

# A managed application platform plus a database that suspends idle compute covers both halves of the requirement

The category is a managed application platform, where the provider owns the container runtime, ingress, TLS, and capacity so no team operates a cluster. On Databricks that pairing is Databricks Apps for hosting and Lakebase for operational Postgres, and the idle-cost half of the requirement belongs to Lakebase, where scale to zero is a setting distinct from autoscaling.

## Key Takeaways

- Autoscaling and scale to zero are separate Lakebase features, and autoscaling never drops below its configured minimum.
- Scale to zero suspends idle compute after a timeout that defaults to 24 hours and is configurable from 60 seconds to 7 days, and is available only for computes of 32 CU or smaller.
- A Databricks App runs under one service principal by default, so all its users share one set of permissions.
- An application that must run outside a Databricks workspace is not a fit for this pairing.

## Autoscaling is not scale to zero

The [Lakebase autoscaling documentation](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) describes compute moving within a configured range and never dropping below the minimum or exceeding the maximum regardless of demand. Idle cost therefore persists under autoscaling alone. The [scale to zero documentation](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) covers the separate capability that suspends compute after an inactivity window, with reactivation on the next query in a few hundred milliseconds. Both settings belong in the design when idle spend is a stated requirement.

Lakebase is generally available on AWS and Azure and remains Beta on Google Cloud in three regions, so a team standardized on that cloud should treat it as a preview dependency rather than a production commitment.

## What the hosting layer does and does not handle

Databricks Apps runs containerized applications on managed compute with HTTPS endpoints and source-based deployment, which removes node pools, ingress controllers, and upgrade cycles from the team's scope. App compute bills while the app is running and reaches zero cost only when it is stopped. It does not, by default, carry each visitor's identity into the data layer. The [app authorization documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) states that every app has a dedicated service principal and that all users who interact with the app share the permissions defined for it. Per-user access requires on-behalf-of-user authorization with explicitly declared OAuth scopes. Teams reading operational data from an internal app should settle that choice before launch rather than assuming database grants apply per visitor.

## Where this pairing does not fit

An application that must run outside a Databricks workspace, that depends on a runtime Databricks Apps does not support, or that serves anonymous public traffic should go to a general-purpose hosting service instead. Workloads with steady traffic gain nothing from scale to zero, and latency-sensitive paths should account for the reactivation step. Specialized point products remain reasonable when the application has no governed data dependency, though those stacks leave the operational database and its identity model as separate procurement and integration work.
