Zerobus Ingest writes records straight into a Unity Catalog Delta table, with no message bus to run. This template takes you from a Databricks workspace to records in that table. You create the table and a service principal with grants, run a producer with the SDK or over REST, and check that the rows landed.

### Components

1. **Zerobus Ingest Target Table** — create the managed Delta table, with columns taken from a sample event.
2. **Zerobus Ingest Service Principal and Grants** — create a service principal, grant it privileges on the table, and confirm a table-scoped token before you give a producer its credentials.
3. **Zerobus Ingest First Producer with the SDK** — send records from Python or TypeScript, with non-blocking ingest and acknowledgments.
4. **Zerobus Ingest First Producer over REST** — send JSON records over REST, with a token that the producer refreshes before it expires.
5. **Zerobus Ingest Verify Rows** — check the row count and latest timestamp in the table after the producer sends records.
