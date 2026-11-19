When done, you will have:

- A managed Delta table in Unity Catalog, with columns that match a sample Zerobus Ingest record
- A `DESCRIBE TABLE` check that confirms each field and its type
- A table name, `<catalog>.<schema>.<table>`, for the service principal and producer steps

Zerobus Ingest writes into a table that you create and own. It never changes the table schema on its own, and it rejects records with fields that don't match the table. The table is the contract for every producer, so design it before you write a producer.

1. Confirm the catalog and schema. Check that both exist and that you can create tables in the schema. If either one is missing, ask the user before you create it.
2. Design the columns from a sample event. Use this sample event, or replace its fields with your own:

   ```json
   { "device_name": "sensor-01", "temp": 21, "event_time": 1795000000000000 }
   ```

   Give each field a Delta type that Zerobus Ingest supports. The [supported data types](https://docs.databricks.com/ingestion/zerobus-concepts#type-support) list shows the mapping. For this sample event, `device_name` is `STRING`, `temp` is `INT`, and `event_time` is `TIMESTAMP`. Producers send `TIMESTAMP` values as epoch microseconds, as numbers, not as strings.

3. Create the table with the columns from step 2. Ask the user before you create it. Zerobus Ingest can write to both managed Delta tables and [streaming tables](https://docs.databricks.com/ingestion/zerobus-ingest#create-or-identify-the-target-table), which work the same way, with the same limits and quotas. Keep each field name exactly as the sample event spells it:

   ```sql
   CREATE TABLE <catalog>.<schema>.<table> (
     device_name STRING,
     temp INT,
     event_time TIMESTAMP
   );
   ```

4. Check the table. Run `DESCRIBE TABLE <catalog>.<schema>.<table>`. Expected: every field in the sample event appears with the type from step 2.

To send a new field later, add its column to the table first, then update the producer. The [table requirements](https://docs.databricks.com/ingestion/zerobus-concepts#table-requirements) list what the table must satisfy.
