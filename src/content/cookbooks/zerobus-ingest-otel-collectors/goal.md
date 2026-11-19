Send traces, logs, and metrics from an OpenTelemetry-compatible tool that you already run to Delta tables with Zerobus Ingest. No message bus sits between the tool and the tables.

### Components

1. **Create OpenTelemetry Tables** — create the traces, logs, and metrics tables in Unity Catalog for the signals your tool sends.
2. **Zerobus Ingest Service Principal and Grants** — create a service principal and grant it privileges on each table before you give the tool any credentials.
3. **Configure the OpenTelemetry Exporter for Zerobus Ingest** — use the tool's native Zerobus Ingest sink if it has one that works on your version, or set up an exporter for each signal with a table-scoped token.
4. **Verify OpenTelemetry Rows** — check each signal's table, then test the path before you rely on it.
