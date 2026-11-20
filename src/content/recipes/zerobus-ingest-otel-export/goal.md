When done, you will have:

- A native Zerobus Ingest sink, or one OpenTelemetry exporter per signal, that writes the tool's data to its own table
- A table-scoped token for each table that the tool refreshes before it expires, or a named gap that stops the OTLP path
- A row count and latest timestamp for each signal, with rows that grow between two checks, or a named next step for each signal that has no rows
- The results of the path tests, and a summary of which signals landed and what limits to know before you rely on the path

Work through the following steps in order. Stop when a step ends the path, and tell the user what you found.

1. **Check for a native sink.** Read `references/choose-an-interface.md` in the `databricks-zerobus-ingest` skill. Then check the tool's own documentation for the user's version, and find out whether the tool has a native Zerobus Ingest sink. Don't assume the answer from the tool's name.

   If a native sink works on the user's version, use it. Configure the sink from the tool's documentation, then verify the table that the sink writes to. Skip the OTLP steps in this recipe. If the native sink doesn't work on the user's version, tell the user before you set up the OTLP path.

2. **Get a table-scoped token for each table (OTLP path only).** OAuth is the only supported authentication for OTLP today. Each table needs its own token, requested with a client-credentials request that sets `resource` and `authorization_details`. Read the token options in `references/opentelemetry.md` in the same skill. Then take the first option that applies:

   - **The tool's own OAuth does the work.** The tool needs an OAuth client-credentials plugin or extension that can send `resource` and `authorization_details` on the token request. Check the tool's OAuth documentation for the user's version. [An example of this pattern](https://docs.databricks.com/ingestion/opentelemetry/configure#collector-example) is on the configure page. If the tool's OAuth sends the table-scoped client-credentials request and refreshes the token before it expires, without a restart, use it.
   - **A documented hook accepts a token that the tool doesn't fetch itself.** Check whether the tool can read a bearer token from a file or environment variable that it reloads, or whether it has an auth extension or plugin that accepts one. If it does, add a small token-refresh step that works with any tool. The step requests each table's token with `resource` and `authorization_details`, refreshes it before it expires, and writes it where the tool reads it. Reload the tool if it needs a reload. Keep the step generic, don't add code that assumes a particular tool, and don't invent a hook the tool doesn't document. Give the client secret to the refresh step only after the grants are in place.
   - **Neither option exists.** Stop here. Tell the user plainly that the tool can't send the table-scoped token that Zerobus Ingest needs today, and name the gap. Don't work around it. A static token expires after about one hour, so use one only for a short test. Don't put a static token into a process that runs for a long time, unless a token-refresh step replaces it before it expires.

3. **Configure one exporter per signal.** Each exporter sends to its own table with the `x-databricks-zerobus-table-name` header, and it uses that table's token. Send Protobuf over HTTP, because JSON isn't accepted, or use gRPC. Confirm the endpoint form the tool expects. The skill's `references/opentelemetry.md` lists the endpoint, headers, service paths, and limits.

   The tool's config file must be readable by the user the tool runs as. Set these values in the config or its environment, using the variable names in the [variable setup](https://docs.databricks.com/ingestion/opentelemetry/configure#variable-setup) section of the configure page:

   - `WORKSPACE_URL`: the workspace host without `https://`, in the form `<workspace-host>`. This is the configure page's variable, not `DATABRICKS_WORKSPACE_URL` from the setup recipe, which includes `https://`.
   - `WORKSPACE_ID`: `<workspace-id>`.
   - `REGION`: the workspace region, `<region>`.
   - `CATALOG`, `SCHEMA`, and `TABLE_PREFIX`: the catalog, schema, and table prefix from the tables you created in the setup recipe.
   - Endpoint host: `<workspace-id>.zerobus.<region>.<cloud-domain>:443`. Get the host for your workspace from [Get your Zerobus Ingest endpoint and Workspace URL](https://docs.databricks.com/ingestion/opentelemetry/configure#get-endpoint).

4. **Check each signal's table.** Wait a few seconds after the tool's first export. Then run this query for each signal, replacing `<signal>` with `spans`, `logs`, or `metrics`:

   ```sql
   SELECT count(*) AS row_count, max(time) AS latest
   FROM <catalog>.<schema>.<prefix>_otel_<signal>
   ```

   Each signal writes to its own table, so check every table. If a native sink writes to a different table, check that table's row count instead.

   Run it again after another export. `row_count` should grow, and `latest` should show a recent time. If the count doesn't grow, check the tool's logs for export errors, then the grants, then the token. The skill's `references/troubleshooting.md` lists the common causes, including error 4024 for missing table-level grants.

5. **Test the path before you rely on it.** Tell the user what each check shows, and don't promise behavior that the test hasn't confirmed.

   - Run the tool for longer than one hour. Confirm that rows keep landing after the first token would have expired.
   - Send one invalid record, such as a metric point with timestamp 0, to a scratch copy of a table made from the same DDL. To do that, point the tool at the scratch table, for example by restarting it with `TABLE_PREFIX` set to the scratch prefix, and send the invalid record. Report which records land, whether the tool logs an error, and whether it retries the batch. The OpenTelemetry docs describe partial success: valid records in a mixed request land, and invalid records are rejected and counted. If the tool logs partial success responses, look for "Partial success response" warnings and the dropped count they report. Don't promise that behavior for every tool, and don't treat an accepted request as landed rows. Check the scratch table's row count.
   - Check the tool's logs for `Unauthenticated` or `invalid_client`. If you see either, check the client ID, the client secret, and the grants.
   - Restart the tool while it is sending data. Report how many records the restart lost. Data the tool holds in memory can be lost if the process is killed before the tool sends it. To count the loss, compare the number of records your application generated with the row count per `service_name` in each signal's table, after the tool has flushed. Records that the application couldn't deliver while the tool was down aren't the tool's loss, so report them separately.

Then summarize for the user: which signals landed, what the tests showed, and any limit they should know before they rely on the path.

For a working end-to-end example in code, point the user to [zerobus-ingest-examples](https://github.com/databricks-solutions/zerobus-ingest-examples). Don't write a demo app for them.
