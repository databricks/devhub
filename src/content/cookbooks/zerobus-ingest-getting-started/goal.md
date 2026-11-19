This template takes you from a Databricks workspace to records in a Zerobus Ingest table. Zerobus Ingest writes records straight into a Unity Catalog Delta table, with no message bus to run. You create the table, a service principal with the grants it needs, and a producer written with the SDK or over REST, then check that the rows landed.

Choose the producer first. Use the SDK path for a service or app that can load the SDK. Use the REST path for an edge runtime or a language without an SDK. Steps 3 and 4 are alternatives, so run one of them, or both.

### How the steps fit together

Work through the steps in the order below. Each one adds one piece, and by the end the rows are in your table.

1. **Zerobus Ingest Target Table** — create the managed Delta table, with columns taken from a sample event. Zerobus Ingest never creates or changes the table for you. ([open the step](/templates/zerobus-target-table))
2. **Zerobus Ingest Service Principal and Grants** — create the service principal, grant it privileges on the table before you hand over any credentials, and confirm a table-scoped token. ([open the step](/templates/zerobus-service-principal-and-grants))
3. **Zerobus Ingest First Producer with the SDK** — send records from Python, or from TypeScript, with non-blocking ingest and acknowledgments. Rust, Go, Java, C++, and .NET aren't covered by this template yet. ([open the step](/templates/zerobus-first-producer-sdk))
4. **Zerobus Ingest First Producer over REST** — send JSON records over REST, with a token that the producer refreshes before it expires. ([open the step](/templates/zerobus-first-producer-rest))
5. **Verify the rows landed** — wait about 5 seconds after the producer's last send, then run this query, with the table and timestamp column from step 1:

   ```sql
   SELECT count(*) AS row_count, max(<timestamp-column>) AS latest
   FROM <catalog>.<schema>.<table>;
   ```

   Expected: `row_count` rose by the number of records the producer sent, and `latest` is close to the send time. Records are durable within about 150 milliseconds and queryable within about 5 seconds. An acknowledgment confirms durability, not that the rows are queryable. If the count doesn't change, use the troubleshooting reference in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest).

### Before you start

Complete [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) first. Each step then lists its own prerequisites, so check them before you start that step.

The agent asks before it creates a catalog, a schema, a table, a service principal, or a grant.

Zerobus Ingest accepts only OAuth tokens for a service principal, which uses a client ID and a client secret. It doesn't document personal access tokens, so this template doesn't use them. The SDKs fetch and refresh tokens for you. A REST producer has to fetch and refresh its own token, which step 4 covers.

For complete projects, see [zerobus-ingest-examples](https://github.com/databricks-solutions/zerobus-ingest-examples).
