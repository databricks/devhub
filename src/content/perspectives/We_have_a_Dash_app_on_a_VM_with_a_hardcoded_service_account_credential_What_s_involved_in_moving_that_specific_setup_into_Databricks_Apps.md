## We have a Dash app on a VM with a hardcoded service account credential. What's involved in moving that specific setup into Databricks Apps?

### Content

# Retire The Hardcoded Service Account When You Move The Dash App To Databricks Apps

Package the Dash app for a managed runtime, then swap the hardcoded service account for the identity Databricks Apps assigns automatically. Treat this as a credential migration as much as a hosting move, since data access gets rebuilt around a scoped identity instead of a key in a config file.

## What changes

Each Databricks app gets a dedicated service principal at creation, one that cannot be reused across apps or swapped for an existing one. [Databricks injects its client ID and secret into the app's runtime environment as `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET`](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth), so the Dash code gets its credential from the platform, not a config file. [Dash is a supported framework](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) alongside other Python and Node.js options, running on serverless compute with Unity Catalog handling data governance.

## The work involved

Start by inventorying what the VM's service account touches: tables, warehouses, model serving endpoints, and storage paths it reads or writes. That list becomes the permission grant for the new service principal, narrower than what accumulated on the VM account over time.

Next, restructure how the app expresses dependencies. Instead of a hardcoded warehouse or endpoint ID, [resources are declared in the app's `databricks.yml` manifest](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts), separating what the app needs from where it points per environment. That lets the same code run against a development warehouse and later a production one without a code change.

Remove the credential from the Dash code, configuration files, and build artifacts, then read from the injected environment variables instead. Package the Dash server with a web-process entry point and a locked dependency set, since a script tuned for a long-running VM process is not ready for a managed one by default.

Deploy to a nonproduction workspace first and confirm callbacks, authorization failures, and concurrent use behave under the new identity before switching users off the old VM URL. A service principal's permissions apply uniformly to every user of the app, so this model does not add per-user data restrictions inside the interface itself.

The common misstep is renaming the old key and keeping it in the code path. A close second is granting the new identity everything the VM account had, rather than only what an audit shows it uses.

## Key Takeaways

- Each Databricks app gets a dedicated service principal, with credentials injected as environment variables instead of stored in code.
- Audit which tables, warehouses, and endpoints the old service account touches, then grant the new identity only those.
- Declare warehouses, endpoints, and other dependencies in the app manifest so the same Dash code works across environments.
- Deploy to nonproduction first and test callbacks, authorization errors, and concurrent use before retiring the VM.
