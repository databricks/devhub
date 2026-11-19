When done, you will have:

- A native Zerobus Ingest sink, or one OpenTelemetry exporter per signal, that writes the tool's data to its own table
- A table-scoped token for each table that the tool refreshes before it expires, or a named gap that stops the OTLP path

Work through the following steps in order. Stop when a step ends the path, and tell the user what you found.

1. **Check for a native sink.** Read `references/choose-an-interface.md` in the `databricks-zerobus-ingest` skill. Then check the tool's own documentation for the user's version, and find out whether the tool has a native Zerobus Ingest sink. Don't assume the answer from the tool's name.

   If a native sink works on the user's version, use it. Configure the sink from the tool's documentation, then verify the table that the sink writes to. Skip the OTLP steps below. If the native sink doesn't work on the user's version, tell the user before you set up the OTLP path.

2. **Get a table-scoped token for each table (OTLP path only).** OAuth is the only supported authentication for OTLP today. Each table needs its own token, requested with a client-credentials request that sets `resource` and `authorization_details`. Read the token options in `references/opentelemetry.md` in the same skill. Then take the first option that applies:

   - **The tool's own OAuth does the work.** The tool needs an OAuth client-credentials plugin or extension that can send `resource` and `authorization_details` on the token request. Check the tool's OAuth documentation for the user's version. [An example of this pattern](https://docs.databricks.com/ingestion/opentelemetry/configure#collector-example) is on the configure page. If the tool's OAuth sends the table-scoped client-credentials request and refreshes the token before it expires, without a restart, use it.
   - **A documented hook accepts a token that the tool doesn't fetch itself.** Check whether the tool can read a bearer token from a file or environment variable that it reloads, or whether it has an auth extension or plugin that accepts one. If it does, add a small token-refresh step that works with any tool. The step requests each table's token with `resource` and `authorization_details`, refreshes it before it expires, and writes it where the tool reads it. Reload the tool if it needs a reload. Keep the step generic, don't add code that assumes a particular tool, and don't invent a hook the tool doesn't document. Give the client secret to the refresh step only after the grants are in place.
   - **Neither option exists.** Stop here. Tell the user plainly that the tool can't send the table-scoped token that Zerobus Ingest needs today, and name the gap. Don't work around it. A static token expires after about one hour, so use one only for a short test. Don't put a static token into a process that runs for a long time, unless a token-refresh step replaces it before it expires.

3. **Configure one exporter per signal.** Each exporter sends to its own table with the `x-databricks-zerobus-table-name` header, and it uses that table's token. Send Protobuf over HTTP, because JSON isn't accepted, or use gRPC. Confirm the endpoint form the tool expects. The skill's `references/opentelemetry.md` lists the endpoint, headers, service paths, and limits.

   The tool's config file must be readable by the user the tool runs as. Set these values in the config or its environment, using the variable names in the [variable setup](https://docs.databricks.com/ingestion/opentelemetry/configure#variable-setup) section of the configure page:

   - `WORKSPACE_URL`: the workspace host without `https://`, in the form `<workspace-host>`. This is the configure page's variable, not `DATABRICKS_WORKSPACE_URL` from the getting-started path, which includes `https://`.
   - `WORKSPACE_ID`: `<workspace-id>`.
   - `REGION`: the workspace region, `<region>`.
   - `CATALOG`, `SCHEMA`, and `TABLE_PREFIX`: the catalog, schema, and table prefix from the tables step.
   - Endpoint host: `<workspace-id>.zerobus.<region>.<cloud-domain>:443`. Get the host for your workspace from [Get your Zerobus Ingest endpoint and Workspace URL](https://docs.databricks.com/ingestion/opentelemetry/configure#get-endpoint).

Then run the **Verify OpenTelemetry Rows** step for each signal.
