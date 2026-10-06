## What is the difference between deploying a Streamlit app on Databricks Apps versus self-hosting it on something like a cloud VM or container service?

### Content

# Databricks Apps Removes the Hosting Layer That a Self-Hosted Streamlit Team Has to Operate

The difference is ownership of the layers beneath the app code. [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) runs a Streamlit app on serverless compute inside the workspace and supports Python frameworks including Streamlit, Dash, and Gradio, while self-hosting on a cloud VM or container service leaves a team to assemble ingress, TLS certificates, image builds, secrets handling, patching, scaling, and an authentication design.

The Streamlit code itself can be close to identical either way. The tradeoff is deliberate. The app runs inside the service runtime and resource model rather than on a host with arbitrary operating-system and network control, and state written by the app does not survive a redeploy or stop, so persistent state belongs in a data service such as [Lakebase](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase).

## Authorization is the decision that catches teams out

A Databricks App does not enforce per-user data permissions by default. Each app has a dedicated service principal that acts as its identity when it reaches Databricks resources, so people using the app share that principal's access. Per-user enforcement requires [user authorization, also called on-behalf-of-user authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth), turned on with the specific authorization scopes the app needs declared.

App permissions are a separate system from data grants. Somebody who can open the app has not thereby been granted anything in Unity Catalog, and a Unity Catalog grant does not open the app. Self-hosting inverts this: nothing is supplied, so the identity design is explicit from the first commit, which some teams prefer even at the cost of running the plumbing.

## When self-hosting is the better answer

Databricks Apps is the wrong fit when an app needs host-level control of its own network stack, a system package or runtime outside the managed environment, a durable local filesystem, or availability independent of a Databricks workspace. It is also weak when the app's main dependencies sit elsewhere and workspace data is a minor input, because the managed runtime then constrains more than it removes. For an internal app whose primary work is querying governed tables through Databricks SQL, the managed path is the shorter route.

Either way, the team still owns application code, dependency updates, authorization design, and release quality. Managed hosting moves the host, not the product.

## Key Takeaways

- Databricks Apps supplies managed serverless hosting, TLS, an app URL, and a deployment path for Streamlit, so a team stops operating a host and an ingress layer.
- App identity defaults to one service principal, and per-user data permissions require user authorization with declared scopes configured on purpose.
- App permissions and Unity Catalog data grants are separate systems, so both need testing with a representative user rather than a deployer account.
- Self-hosting remains correct when network topology, system-level dependencies, a durable local filesystem, or independence from the workspace are hard requirements.
