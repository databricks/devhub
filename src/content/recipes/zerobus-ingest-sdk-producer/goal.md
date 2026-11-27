When done, you will have:

- A producer that sends JSON records into a Zerobus Ingest table with the SDK, without blocking on each record
- Acknowledgments that log the offsets Zerobus Ingest stored, and any errors
- A producer that flushes and closes its stream when it finishes
- A row count that rose by the number of records the producer sent

Use the SDK for a service or app that can load it. Start with Python, and use the TypeScript SDK when the user needs Node.js. Rust, Go, Java, C++, and .NET aren't covered by this template yet. For those languages, use the SDK references in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest).

Read the Python or TypeScript reference in that skill before you write the producer. It covers the install steps, the producer APIs, and the record formats. The SDK fetches and refreshes tokens for you.

1. Install the SDK. For Python, run `pip install databricks-zerobus-ingest-sdk`. For TypeScript, run `npm install @databricks/zerobus-ingest-sdk`.

2. Write the producer. Read the endpoint, workspace URL, table name, client ID, and client secret from the environment variables that the [setup recipe](/templates/zerobus-ingest-setup) set. Never hard-code the secret. Send records shaped like the table you created in that recipe.
   - Python: create a `ZerobusSdk` client with the server endpoint and the workspace URL. Subclass `AckCallback`, imported from `zerobus.sdk.shared`, to log each durable offset and each error. Open the stream with `create_stream`, passing the client ID, the client secret, a `TableProperties` object with the table name, and `StreamConfigurationOptions` with `ack_callback` set to your callback:

     ```python
     sdk = ZerobusSdk(server_endpoint, workspace_url)
     stream = sdk.create_stream(
         client_id,
         client_secret,
         TableProperties(table_name),
         StreamConfigurationOptions(ack_callback=LogAck()),
     )
     ```

     Send each record with `ingest_record_offset`, which queues the record and returns. Without a descriptor, the SDK sends JSON. Call `flush()` once after the last record, and call `close()` in a `finally` block.

   - TypeScript: create a `ZerobusSdk` client with the server endpoint and the workspace URL, then open the stream with `createStream(tableProperties, clientId, clientSecret, options)`. Pass `{ tableName }` as the table properties, and set `recordType` to `RecordType.Json` in the options, because the default is Protobuf. Send each record with `await ingestRecordOffset(...)`. For TypeScript, call `flush()` on an interval to log progress. Call `flush()` and then `close()` in a `finally` block.
   - Both languages: send `TIMESTAMP` fields as epoch microseconds.

3. Send a test batch of 10 to 100 records. Expected: the producer exits without an error, and the log shows the acknowledged offsets.

4. Handle errors. The SDK retries transient errors and recovers the stream itself. Handle the errors it raises, such as invalid credentials, missing grants, or a missing table. Don't write your own retry loop around the ingest calls. To capture fields the table doesn't have instead of rejecting the record, add a rescue column ([rescue column](https://docs.databricks.com/ingestion/zerobus-rescue-column)).

5. Check the rows. Wait about 5 seconds after the producer's last send. Then run this query, with the table and timestamp column from the setup recipe:

   ```sql
   SELECT count(*) AS row_count, max(<timestamp-column>) AS latest
   FROM <catalog>.<schema>.<table>;
   ```

   Expected: `row_count` rose by the number of records the producer sent, and `latest` is close to the send time. Records are durable within about 150 milliseconds and queryable within about 5 seconds, according to the [latency figures](https://docs.databricks.com/ingestion/zerobus-quotas#latency). An acknowledgment confirms durability, not that the rows are queryable.

   If the count doesn't change, use the troubleshooting reference in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest).

Zerobus Ingest delivers at least once when the client retries records that aren't acknowledged. A retry can resend records that already landed, so the table can hold duplicate rows. When duplicates matter, deduplicate on a key in the queries that read the table.

For a complete project, see [zerobus-ingest-examples](https://github.com/databricks-solutions/zerobus-ingest-examples).
