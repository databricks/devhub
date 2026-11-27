When done, you will have:

- A producer that sends JSON records to a Zerobus Ingest table over REST
- A table-scoped OAuth token that the producer requests again before it expires
- A producer that gets a new token and retries once after an HTTP 401 response
- A row count that rose by the number of records the producer sent

Use REST when the producer can't load an SDK, for example in an edge runtime, or when the language has no SDK. REST accepts JSON records sent as `application/json` or `application/jsonl`.

Read the REST reference in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest) before you write the producer. It has the token request and a sender example.

1. Request a token. Send a form-encoded (`application/x-www-form-urlencoded`) `POST` to `<DATABRICKS_WORKSPACE_URL>/oidc/v1/token`, with HTTP Basic authentication that uses the client ID as the user name and the client secret as the password. Send the client credentials grant, `scope=all-apis`, and `resource=api://databricks/workspaces/<workspace-id>/zerobusDirectWriteApi`. Pass `authorization_details` with one `unity_catalog_privileges` entry for each of the catalog, the schema, and the table, as in the following request body:

   ```json
   [
     {
       "type": "unity_catalog_privileges",
       "privileges": ["USE CATALOG"],
       "object_type": "CATALOG",
       "object_full_path": "<catalog>"
     },
     {
       "type": "unity_catalog_privileges",
       "privileges": ["USE SCHEMA"],
       "object_type": "SCHEMA",
       "object_full_path": "<catalog>.<schema>"
     },
     {
       "type": "unity_catalog_privileges",
       "privileges": ["SELECT", "MODIFY"],
       "object_type": "TABLE",
       "object_full_path": "<catalog>.<schema>.<table>",
       "operations": ["zerobuswrite"]
     }
   ]
   ```

   The table entry must set `"operations": ["zerobuswrite"]`. The [REST example in the Zerobus Ingest docs](https://docs.databricks.com/ingestion/zerobus-ingest#write) shows the full request. Expected: the response contains an `access_token`.

2. Send a test batch. Send a JSON array of records shaped like the table you created in the [setup recipe](/templates/zerobus-ingest-setup) in a `POST` request to `<ZEROBUS_SERVER_ENDPOINT>/zerobus/v1/tables/<catalog>.<schema>.<table>/insert`. Set `Content-Type: application/json` and `Authorization: Bearer <token>`. Send `TIMESTAMP` fields as epoch microseconds. Expected: HTTP 200 with an empty JSON object, `{}`.

3. Build the long-running sender. Cache the token. Request a new token five minutes before the token expires, because tokens last about one hour. On an HTTP 401 response, request a new token and retry the request once. Send records in arrays rather than one request per record. The default limit is 10,000 REST requests per second.

4. Handle rejected requests. An HTTP 400 response means the request is invalid, such as a missing required field, an invalid schema, or an unsupported record format. Fix the request and send it again. An HTTP 403 response means the caller doesn't have sufficient privileges, so check the grants in the setup recipe. An HTTP 429 response means the request rate is over the limit, so batch records and slow down. To capture fields the table doesn't have instead of rejecting the record, add a rescue column ([rescue column](https://docs.databricks.com/ingestion/zerobus-rescue-column)).

5. Check the rows. Wait about 5 seconds after the producer's last send. Then run this query, with the table and timestamp column from the setup recipe:

   ```sql
   SELECT count(*) AS row_count, max(<timestamp-column>) AS latest
   FROM <catalog>.<schema>.<table>;
   ```

   Expected: `row_count` rose by the number of records the producer sent, and `latest` is close to the send time. Records are durable within about 150 milliseconds and queryable within about 5 seconds, according to the [latency figures](https://docs.databricks.com/ingestion/zerobus-quotas#latency). An acknowledgment confirms durability, not that the rows are queryable.

   If the count doesn't change, use the troubleshooting reference in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest).

Zerobus Ingest delivers at least once when the client retries records that aren't acknowledged. A retry can resend records that already landed, so the table can hold duplicate rows. When duplicates matter, deduplicate on a key in the queries that read the table.
