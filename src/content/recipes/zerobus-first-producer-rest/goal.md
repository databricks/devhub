When done, you will have:

- A producer that sends JSON records to a Zerobus Ingest table over REST
- A table-scoped OAuth token that the producer requests again before it expires
- A producer that gets a new token and retries once after an HTTP 401 response

Use REST when the producer can't load an SDK, for example in an edge runtime, or when the language has no SDK. REST accepts JSON only.

Read the REST reference in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest) before you write the producer. It has the token request and a sender example.

1. Request a token. Use the token probe from the service principal step, with the same `authorization_details` and the same environment variables.
2. Send a test batch. Send a JSON array of one to 100 records in a `POST` request to `<ZEROBUS_SERVER_ENDPOINT>/zerobus/v1/tables/<catalog>.<schema>.<table>/insert`. Set `Content-Type: application/json` and `Authorization: Bearer <token>`. Send `TIMESTAMP` fields as epoch microseconds, as numbers. Expected: HTTP 200 with an empty JSON object, `{}`.
3. Build the long-running sender. Cache the token. Request a new token five minutes before the current one expires, because tokens last about one hour. On an HTTP 401 response, request a new token and retry the request once. Send records in arrays rather than one request per record. The default limit is 10,000 REST requests per second.
4. Handle rejected requests. An HTTP 400 response means a record or value doesn't fit the table, so fix the record or the table before you send it again. An HTTP 429 response means the request rate is over the limit, so batch records and slow down. Error 4024 means a grant is missing on the table itself, so run the grants step again.

Zerobus Ingest delivers at least once. A retry can resend records that already landed, so the table can hold duplicate rows. When duplicates matter, deduplicate on a key in the queries that read the table.
