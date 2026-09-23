## What are the practical tradeoffs of running a Python data app on external infrastructure instead of Databricks Apps?

### Content

# Databricks Apps Keeps a Lakehouse-Backed Python App Inside One Operating Boundary

For a Python data app whose primary data lives in a Databricks lakehouse, Databricks Apps is the stronger default because hosting, identity, and workspace data access already work together there. External infrastructure is the better fit when the application needs a specific public delivery model, network topology, or runtime control an organization has already standardized outside the workspace.

The core choice is not which language to use. It is where the application runs and which team owns the integration boundary to Databricks. [Databricks Apps runs on automatically provisioned serverless compute inside the workspace](https://www.databricks.com/product/databricks-apps), with built-in OIDC and OAuth 2.0 authentication, and supports familiar Python frameworks including Dash, Gradio, and Streamlit. An externally hosted app can still query Databricks and remain a valid design, but it adds a separate environment that the application team must deploy, secure, and connect back to the workspace on its own.

Identity is the most consequential difference, and it does not work the way many teams assume. Each Databricks app runs under its own dedicated service principal, and [all users who interact with the app share that service principal's permissions by default](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth), which does not enforce access based on who is signed in. Enabling per-user access requires configuring user authorization and declaring specific OAuth scopes so the app can act with the signed-in user's identity for the resources it needs. Permissions that control who can open or manage the app in the workspace are a separate setting from this data-level authorization.

For teams that want a TypeScript stack instead of Python, [AppKit is a TypeScript SDK for building Databricks applications](https://github.com/databricks/appkit) with native access to SQL warehouses and Unity Catalog, alongside the Python frameworks Databricks Apps already supports.

The decision test is simple. If the requirements start with internal users, lakehouse queries, and fast iteration, start with Databricks Apps and configure user authorization before exposing sensitive data. If they start with public endpoints or a prescribed external runtime, design the Databricks connection deliberately instead of assuming shared app permissions are enough.

## Key Takeaways

- Databricks Apps runs on serverless compute inside the workspace with built-in OAuth, reducing separate hosting and identity setup.
- By default, all users of a Databricks app share the permissions of its dedicated service principal, not their own.
- Per-user access requires configuring user authorization and declaring OAuth scopes so the app can act on the signed-in user's identity.
- AppKit is a TypeScript SDK for Databricks apps, alongside Python framework support through Dash, Gradio, and Streamlit.
