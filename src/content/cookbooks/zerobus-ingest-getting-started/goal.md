Zerobus Ingest writes records straight into a Unity Catalog Delta table, with no message bus to run. This template takes you from a Databricks workspace to records in that table. You create the table and a service principal with grants, run a producer with the SDK or over REST, and check that the rows landed.

### Components

1. **Set Up Zerobus Ingest** — create the target table from a sample event, a service principal with grants, and a token check before you give a producer its credentials.
2. **Send Records with the Zerobus Ingest SDK** — send records from Python or TypeScript, with non-blocking ingest and acknowledgments, then check the rows.
3. **Send Records with the Zerobus Ingest REST API** — send JSON records over REST, with a token that the producer refreshes before it expires, then check the rows.
