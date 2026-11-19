When done, you will have:

- A row count and latest timestamp for each signal the tool sends, read from that signal's table.
- Rows that grow between two checks, or a named next step for each signal that has no rows.

Wait a few seconds after the tool's first export. Then run this query for each signal, replacing `<signal>` with `spans`, `logs`, or `metrics`:

```sql
SELECT count(*) AS row_count, max(time) AS latest
FROM <catalog>.<schema>.<prefix>_otel_<signal>
```

Each signal writes to its own table, so check every table. If a native sink writes to a different table, check that table's row count instead.

Run it again after another export. `row_count` should grow, and `latest` should show a recent time. If the count doesn't grow, check the tool's logs for export errors, then the grants, then the token. The skill's `references/troubleshooting.md` lists the common causes, including error 4024 for missing table-level grants.

### Test the path before you rely on it

Tell the user what each check shows, and don't promise behavior that the test hasn't confirmed.

- Run the tool for longer than one hour. Confirm that rows keep landing after the first token would have expired.
- Send one invalid record, such as a metric point with timestamp 0, to a scratch copy of a table made from the same DDL. To do that, point the tool at the scratch table, for example by restarting it with `TABLE_PREFIX` set to the scratch prefix, and send the invalid record. Report which records land, whether the tool logs an error, and whether it retries the batch. The OpenTelemetry docs describe partial success: valid records in a mixed request land, and invalid records are rejected and counted. If the tool logs partial success responses, look for "Partial success response" warnings and the dropped count they report. Don't promise that behavior for every tool, and don't treat an accepted request as landed rows. Check the scratch table's row count.
- Check the tool's logs for `Unauthenticated` or `invalid_client`. If you see either, check the client ID, the client secret, and the grants.
- Restart the tool while it is sending data. Report how many records the restart lost. Data the tool holds in memory can be lost if the process is killed before the tool sends it. To count the loss, compare the number of records your application generated with the row count per `service_name` in each signal's table, after the tool has flushed. Records that the application couldn't deliver while the tool was down aren't the tool's loss, so report them separately.

Then summarize for the user: which signals landed, what the tests showed, and any limit they should know before they rely on the path.

For a working end-to-end example in code, point the user to [zerobus-ingest-examples](https://github.com/databricks-solutions/zerobus-ingest-examples). Don't write a demo app for them.
