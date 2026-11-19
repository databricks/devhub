When done, you will have:

- A row count and latest timestamp for the target table, read after the producer sent records
- A count that rose by the number of records the producer sent, or a next step from the troubleshooting reference

Wait about 5 seconds after the producer's last send. Then run this query, with the table and timestamp column from the [target table step](/templates/zerobus-target-table):

```sql
SELECT count(*) AS row_count, max(<timestamp-column>) AS latest
FROM <catalog>.<schema>.<table>;
```

Expected: `row_count` rose by the number of records the producer sent, and `latest` is close to the send time. Records are durable within about 150 milliseconds and queryable within about 5 seconds, according to the [latency figures](https://docs.databricks.com/ingestion/zerobus-quotas#latency). An acknowledgment confirms durability, not that the rows are queryable.

If the count doesn't change, use the troubleshooting reference in the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest).
