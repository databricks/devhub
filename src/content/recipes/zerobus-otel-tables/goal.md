When done, you will have:

- The three predefined OpenTelemetry tables in Unity Catalog that Zerobus Ingest writes to: `<prefix>_otel_spans`, `<prefix>_otel_logs`, and `<prefix>_otel_metrics`. Create the table for each signal the tool sends.

Create each table from the DDL in the [Create target tables](https://docs.databricks.com/ingestion/opentelemetry/configure#create-tables) section of the OpenTelemetry configuration docs. Use the schema as written. Zerobus Ingest doesn't create or change tables, and the schema is fixed for each signal, so don't design your own columns.

- Replace `<catalog>`, `<schema>`, and `<prefix>` with the names the user chooses.
- Create the tables before the tool starts sending data.
- Reading the VARIANT columns needs DBR 15.3 or later. The DDL on the configure page sets `delta.enableVariantShredding` to `true`, so a table created from it unchanged needs DBR 17.3 or later to query. To read it on DBR 15.3 to 17.2, you can try removing the three optional shredding properties from each `CREATE TABLE` statement before you run it (not tested): `delta.enableVariantShredding`, `delta.feature.variantShredding`, and `delta.feature.variantType`. See [Variant shredding](https://docs.databricks.com/tables/features/variant-shredding) for the DBR requirements.
