When done, you will have:

- A Zerobus Ingest target table: either your own Delta table, built from a sample event, or the three predefined OpenTelemetry tables
- A service principal with grants on the catalog, the schema, and each table, set before any producer or tool gets credentials
- A client ID and client secret stored as environment variables, and a token probe that confirms a table-scoped OAuth token works

Zerobus Ingest writes into a table that you create and own. It never changes the table schema on its own, and it rejects records with fields that don't match the table. The table is the contract for every producer, so design it before you write a producer.

Zerobus Ingest accepts OAuth tokens. This template uses a service principal with a client ID and a client secret. Zerobus Ingest doesn't document personal access tokens. Zerobus Ingest doesn't run grants for you, so set them before you give a producer the credentials. Set the grants on the table even when you created the table yourself.

1. Confirm the catalog and schema. Check that both exist and that you can create tables in the schema. If either one is missing, ask the user before you create it.

2. Create the target table. Use one of the two paths.

   **Your own table.** Design the columns from a sample event, then create the table. Use this sample event, or replace its fields with your own:

   ```json
   { "device_name": "sensor-01", "temp": 21, "event_time": 1795000000000000 }
   ```

   Give each field a Delta type that Zerobus Ingest supports. The [supported data types](https://docs.databricks.com/ingestion/zerobus-concepts#type-support) list shows the mapping. For this sample event, `device_name` is `STRING`, `temp` is `INT`, and `event_time` is `TIMESTAMP`. Producers send `TIMESTAMP` values as epoch microseconds, as numbers, not as strings.

   Ask the user before you create the table. Zerobus Ingest can write to both managed Delta tables and [streaming tables](https://docs.databricks.com/ingestion/zerobus-ingest#create-or-identify-the-target-table), which work the same way, with the same limits and quotas. Keep each field name exactly as the sample event spells it:

   ```sql
   CREATE TABLE <catalog>.<schema>.<table> (
     device_name STRING,
     temp INT,
     event_time TIMESTAMP
   );
   ```

   Run `DESCRIBE TABLE <catalog>.<schema>.<table>`. Expected: every field in the sample event appears with the type from this step.

   To send a new field later, add its column to the table first, then update the producer. The [table requirements](https://docs.databricks.com/ingestion/zerobus-concepts#table-requirements) list what the table must satisfy.

   **OpenTelemetry tables.** Create the table for each signal the tool sends, from the DDL in the [Create target tables](https://docs.databricks.com/ingestion/opentelemetry/configure#create-tables) section of the OpenTelemetry configuration docs. The tables are `<prefix>_otel_spans`, `<prefix>_otel_logs`, and `<prefix>_otel_metrics`. Use the schema as written. Zerobus Ingest doesn't create or change tables, and the schema is fixed for each signal, so don't design your own columns.

   - Replace `<catalog>`, `<schema>`, and `<prefix>` with the names the user chooses.
   - Create the tables before the tool starts sending data.
   - Reading the VARIANT columns needs DBR 15.3 or later. The DDL on the configure page sets `delta.enableVariantShredding` to `true`, so a table created from it unchanged needs DBR 17.3 or later to query. To read it on DBR 15.3 to 17.2, you can try removing the three optional shredding properties from each `CREATE TABLE` statement before you run it (not tested): `delta.enableVariantShredding`, `delta.feature.variantShredding`, and `delta.feature.variantType`. See [Variant shredding](https://docs.databricks.com/tables/features/variant-shredding) for the DBR requirements.

3. Create the service principal. Ask the user before you create it. Create it without a secret for now, with `databricks service-principals create --display-name "zerobus-producer"`. Note the numeric `id` and the `applicationId` in the output. The `applicationId` is the application ID that the grants use.

4. Enable the entitlement. In the workspace, go to **Settings** > **Identity and Access** > **Service principals**, open the service principal, and on the **Configurations** tab, make sure **Workspace access** is selected.

5. Grant privileges on the table. Run these statements, with the application ID from step 3 and your catalog, schema, and table names:

   ```sql
   GRANT USE CATALOG ON CATALOG <catalog> TO `<application-id>`;
   GRANT USE SCHEMA ON SCHEMA <catalog>.<schema> TO `<application-id>`;
   GRANT MODIFY, SELECT ON TABLE <catalog>.<schema>.<table> TO `<application-id>`;
   ```

   Grant these four privileges explicitly. The explicit grants work for every interface. `ALL PRIVILEGES` on the table also covers token requests that set `operations` on the table entry, as the REST example does, but it doesn't cover requests that leave `operations` out. For the OpenTelemetry path, repeat the table grant for each OpenTelemetry table the tool sends to.

6. Check the grants. Run `SHOW GRANTS ON TABLE <catalog>.<schema>.<table>`. Expected: the application ID appears with `MODIFY` and `SELECT` on the table. For the OpenTelemetry path, check each table.

7. Create the client secret. Only after the grants pass, run `databricks service-principal-secrets-proxy create <id>` with the numeric `id` from step 3. Store the secret when the command returns it. The secret isn't shown again.

8. Set the environment variables. Keep the secret out of code and source control. Set these values for a producer:
   - `ZEROBUS_SERVER_ENDPOINT` is `https://<workspace-id>.zerobus.<region>.<cloud-domain>`. Get the endpoint from [Get your workspace URL and Zerobus Ingest endpoint](https://docs.databricks.com/ingestion/zerobus-ingest#get-your-workspace-url-and-zerobus-ingest-endpoint).
   - `DATABRICKS_WORKSPACE_URL` is `https://<workspace-url>`, the workspace URL without the `/?o=` part.
   - `DATABRICKS_WORKSPACE_ID` is `<workspace-id>`.
   - `ZEROBUS_TABLE_NAME` is `<catalog>.<schema>.<table>`.
   - `DATABRICKS_CLIENT_ID` is the application ID.
   - `DATABRICKS_CLIENT_SECRET` is the client secret.

   The OpenTelemetry export recipe sets the tool's own variables, so this list covers producers only.

9. Run the token probe. Request a table-scoped OAuth token from `<workspace-url>/oidc/v1/token` with the client credentials grant. Pass an `authorization_details` parameter that requests `USE CATALOG` on the catalog, `USE SCHEMA` on the schema, and `SELECT` and `MODIFY` on the table, with `"operations": ["zerobuswrite"]` on the table entry, as the REST token request does. The OTLP token request on the [configure page](https://docs.databricks.com/ingestion/opentelemetry/configure#quick-start-static-token) doesn't send `operations`, so a passing probe doesn't show that the OTLP request will pass. For OTLP, the explicit `MODIFY` and `SELECT` grants from step 5 are required. The request format is in the token section of the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest). Expected: the response contains an `access_token`. If it doesn't, check the client ID, the client secret, the workspace ID, and the grants. Error 4024 means a grant is missing on the table itself.
