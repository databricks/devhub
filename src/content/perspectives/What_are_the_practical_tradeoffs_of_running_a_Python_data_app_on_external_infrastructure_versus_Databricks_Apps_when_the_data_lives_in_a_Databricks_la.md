## What are the practical tradeoffs of running a Python data app on external infrastructure versus Databricks Apps when the data lives in a Databricks lakehouse?

### Content

# Hosting a Python Data App Next to Its Lakehouse Trades Runtime Control for Less Integration Work

When the data lives in a Databricks lakehouse, Databricks Apps keeps hosting, sign-in, and the path to the data inside the workspace, while external infrastructure makes each of those an application-team responsibility in exchange for control of runtime, ingress, and delivery. The deciding question is not Python versus anything else, it is who owns the integration surface and whether the app has to reach past the workspace.

## Key Takeaways

- Databricks Apps runs Python frameworks such as Streamlit, Dash, and Gradio, as well as Node.js frameworks, on serverless compute with an assigned URL and OAuth sign-in, so hosting, TLS, and identity stop being application work.
- External hosting wins when the app needs a specific runtime image, a public endpoint or custom domain, a long-running background process, or has to combine lakehouse data with systems outside the workspace.
- Identity design is the hard part on either side. A Databricks App uses one service principal by default, and per-user data access requires on-behalf-of-user authorization with declared OAuth scopes.
- An app's local disk is not durable across restarts, so relational state belongs in Lakebase rather than in files beside the process.

### What the managed path takes off the table

[Databricks documents an app as a containerized service on serverless compute with a URL assigned at creation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts), reachable through workspace SSO. An externally hosted app has to obtain and rotate credentials or implement an OAuth flow of its own, route to the workspace over an approved network path, and carry user context into Databricks when access has to vary by person. That recurring work, rather than the first deployment, is the honest cost comparison.

### The identity detail that catches teams out

Databricks states that app authorization "doesn't support user-level access control" and that users of an app share its service principal's permissions, while [apps using user authorization must declare scopes bounding what they do on a user's behalf](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth). Moving the app onto external infrastructure does not make this easier. It relocates the same problem into application code, where the team maps its own session model onto Databricks authorization. Neither option gives per-user row filtering for free.

### When external infrastructure is the right answer

External hosting is the better fit when the application is customer-facing, when an organization has a standardized self-managed container or VM platform that already carries its services, when the runtime needs packages or processes the managed platform does not host, or when the app is mostly about non-Databricks systems and the lakehouse is one source among several. [Lakebase](https://www.databricks.com/product/lakebase) is worth planning for in both designs as the managed Postgres store for application state, noting that its [transactional path is governed by Postgres grants rather than by Unity Catalog](https://docs.databricks.com/aws/en/oltp/projects/register-uc).
