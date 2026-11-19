Send traces, logs, and metrics from an OpenTelemetry-compatible tool that you already run to Delta tables with Zerobus Ingest. No message bus sits between the tool and the tables.

Work through the steps in order. Stop when a step ends the path, and tell the user what you found.

## Step 1: Identify the tool

Ask the user which OpenTelemetry-compatible tool or agent they run, its version, and which signals it sends: traces, logs, or metrics. If the user doesn't know the tool's name, find it in the tool's config file or running process. Don't guess the tool from the application's programming language.

This path needs a SQL warehouse, the rights to create tables and a service principal in the target catalog, and the ability to restart the tool. Confirm each one with the user before you continue.

## Step 2: Check for a native Zerobus Ingest sink

Read `references/choose-an-interface.md` in the `databricks-zerobus-ingest` skill. Then check the tool's own documentation for the user's version. Find out whether the tool has a native Zerobus Ingest sink. Don't assume the answer from the tool's name.

If the tool has a native sink that works on the user's version, use it. Create the table the sink writes to, and run the **Service principal and grants** step for that table. Then configure the sink from the tool's documentation, and go to Step 6. Skip Steps 3 to 5.

If the native sink doesn't work on the user's version, tell the user before you continue to Step 3.

## Step 3: Get a table-scoped token for each table (OTLP path only)

OAuth is the only supported authentication for OTLP today. Each table needs its own token, requested with a client-credentials request that sets `resource` and `authorization_details`. Read the token options in `references/opentelemetry.md` in the same skill. Then take the first option that applies.

1. **The tool's own OAuth does the work.** The tool needs an OAuth client-credentials plugin or extension that can send `resource` and `authorization_details` on the token request. Check the tool's OAuth documentation for the user's version. [An example of this pattern](https://docs.databricks.com/ingestion/opentelemetry/configure#collector-example) is on the configure page. If the tool's OAuth sends the table-scoped client-credentials request and refreshes the token before it expires, without a restart, use it. Go to Step 4.
2. **A documented hook accepts a token that the tool doesn't fetch itself.** Check whether the tool can read a bearer token from a file or environment variable that it reloads, or whether it has an auth extension or plugin that accepts one. If it does, add a small token-refresh step that works with any tool. The step requests each table's token with `resource` and `authorization_details`, refreshes it before it expires, and writes it where the tool reads it. Reload the tool if it needs a reload. Keep the step generic. Don't add code that assumes a particular tool, and don't invent a hook the tool doesn't document. Give the client secret to the refresh step only after you finish Step 4, item 2 (**Service principal and grants**).
3. **Neither option exists.** Stop here. Tell the user plainly that the tool can't send the table-scoped token that Zerobus Ingest needs today, and name the gap. Don't work around it. A static token expires after about one hour, so use one only for a short test. Don't put a static token into a process that runs for a long time, unless a token-refresh step replaces it before it expires.

## Step 4: Set up the OTLP path

Do these in order. Grant access before you give any credentials to the tool.

1. Run **Create OpenTelemetry tables** for the signals the tool sends.
2. Run **Service principal and grants**. Only then give the client ID and secret to the tool.
3. Configure one exporter per signal. Each exporter sends to its own table with the `x-databricks-zerobus-table-name` header, and it uses that table's token. Send Protobuf over HTTP, because JSON isn't accepted, or use gRPC. Confirm the endpoint form the tool expects. The skill's `references/opentelemetry.md` lists the endpoint, headers, service paths, and limits.

   The tool's config file must be readable by the user the tool runs as. Set these values in the config or its environment, using the variable names in the [variable setup](https://docs.databricks.com/ingestion/opentelemetry/configure#variable-setup) section of the configure page:

   - `WORKSPACE_URL`: the workspace host without `https://`, in the form `<workspace-host>`. This is the configure page's variable, not `DATABRICKS_WORKSPACE_URL` from the getting-started path, which includes `https://`.
   - `WORKSPACE_ID`: `<workspace-id>`.
   - `REGION`: the workspace region, `<region>`.
   - `CATALOG`, `SCHEMA`, and `TABLE_PREFIX`: the catalog, schema, and table prefix from Step 4, item 1.
   - Endpoint host: `<workspace-id>.zerobus.<region>.<cloud-domain>:443`. Get the host for your workspace from [Get your Zerobus Ingest endpoint and Workspace URL](https://docs.databricks.com/ingestion/opentelemetry/configure#get-endpoint).

## Step 5: Test the path before you rely on it

Run these checks on the OTLP path. Tell the user what each check shows, and don't promise behavior that the test hasn't confirmed.

- Run the tool for longer than one hour. Confirm that rows keep landing after the first token would have expired.
- Send one invalid record, such as a metric point with timestamp 0, to a scratch copy of a table made from the same DDL. To do that, point the tool at the scratch table, for example by restarting it with `TABLE_PREFIX` set to the scratch prefix, and send the invalid record. Report which records land, whether the tool logs an error, and whether it retries the batch. The OpenTelemetry docs describe partial success: valid records in a mixed request land, and invalid records are rejected and counted. If the tool logs partial success responses, look for "Partial success response" warnings and the dropped count they report. Don't promise that behavior for every tool, and don't treat an accepted request as landed rows. Check the scratch table's row count.
- Check the tool's logs for `Unauthenticated` or `invalid_client`. If you see either, check the client ID, the client secret, and the grants.
- Restart the tool while it is sending data. Report how many records the restart lost. Data the tool holds in memory can be lost if the process is killed before the tool sends it. To count the loss, compare the number of records your application generated with the row count per `service_name` in each signal's table, after the tool has flushed. Records that the application couldn't deliver while the tool was down aren't the tool's loss, so report them separately.

## Step 6: Verify each signal

Run **Verify OpenTelemetry rows** for each signal the tool sends. Each signal writes to its own table, so check every table. If a native sink writes to a different table, check that table's row count instead.

Then summarize for the user: which signals landed, what the tests showed, and any limit they should know before they rely on the path.

For a working end-to-end example in code, point the user to https://github.com/databricks-solutions/zerobus-ingest-examples. Don't write a demo app for them.
