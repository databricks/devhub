Send traces, logs, and metrics from an OpenTelemetry-compatible tool that you already run to Delta tables with Zerobus Ingest. No message bus sits between the tool and the tables.

### Components

1. **Set Up Zerobus Ingest** — create the OpenTelemetry tables, a service principal with grants on each table, and a token check before you give the tool any credentials.
2. **Export OpenTelemetry Signals to Zerobus Ingest** — use the tool's native Zerobus Ingest sink if it has one that works on your version, or set up an exporter for each signal with a table-scoped token. Then check each signal's table and test the path before you rely on it.
