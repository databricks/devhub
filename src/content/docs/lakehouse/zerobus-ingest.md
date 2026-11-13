---
title: What is Zerobus Ingest?
sidebar_label: Zerobus Ingest
description: Push records from apps, services, and devices straight into Unity Catalog Delta tables with Zerobus Ingest. Serverless, with no message bus to run. SDKs, REST, OTLP, MQTT, and Kafka-compatible APIs.
sourceOfTruth:
  skills:
    - databricks-zerobus-ingest
  docs:
    - https://docs.databricks.com/aws/en/ingestion/zerobus-overview
    - https://docs.databricks.com/aws/en/ingestion/zerobus-api-protocols
    - https://docs.databricks.com/aws/en/ingestion/zerobus-concepts
    - https://docs.databricks.com/aws/en/ingestion/zerobus-quotas
    - https://docs.databricks.com/aws/en/admin/system-tables/zerobus-ingest
---

# What is Zerobus Ingest?

**Zerobus Ingest** is a push-based, serverless ingestion service in Lakeflow Connect. A producer (an app, a service, a device, or a script) sends records to one endpoint, and they land directly in a Unity Catalog managed Delta table. You no longer need to run a message bus, brokers, or an ingestion job between your producers and the lakehouse: create a table, then push data to it.

Zerobus is the write path into the Data Lakehouse. The tables it fills are ordinary Unity Catalog tables, so the rest of this section reads them the usual way: [analytical reads](/docs/lakehouse/analytical-reads) from your AppKit app, [Genie](/docs/lakehouse/genie) for natural-language questions, and [Lakeflow pipelines](/docs/lakehouse/pipelines) for downstream processing.

## When to use Zerobus Ingest

- **Your app, service, or device pushes the data**: application and clickstream events, logs, IoT and device telemetry, or change data capture from an operational database.
- **The destination is a Delta table** and the lakehouse is the one main consumer.
- **A message bus would only be a pipe to the lakehouse.** Producers write straight to the table, so there are fewer hops and fewer moving parts to operate.
- **Your sources already speak a standard protocol.** OpenTelemetry collectors, Kafka producers, and MQTT v5 clients can point at Zerobus without custom SDK code.

## When not to use it

When your destination is the lakehouse, Zerobus is the most direct path. Other Databricks tools fit adjacent needs and work well alongside it:

- For use cases where you run Kafka to support consumers outside the lakehouse, you may also want a copy of the data in the lakehouse. Use [managed streaming connectors](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/streaming-overview) to replicate it.
- For data already landed as files in cloud storage, use [Auto Loader](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/).
- When you need sub-second operational latency in the processing path, use [real-time mode](https://docs.databricks.com/aws/en/structured-streaming/real-time/concepts).

## Why Zerobus Ingest

- **Simple by design.** Create a table, then push data to it. There are no brokers, partitions, or pipelines to manage.
- **Serverless and elastic.** Zerobus is on by default and adds or removes capacity as load changes. You scale by running more producers, not by rewriting your application.
- **High throughput and concurrency.** It sustains high write rates into a single table, with concurrent writes from thousands of clients.
- **Near real-time freshness.** Records are durable in about 150 ms and land in the Delta table within seconds.

## Create a table, then push data

The table's schema defines what each record must contain, and Zerobus never creates or alters tables. Create the target table first:

```sql
CREATE TABLE main.default.air_quality (
  device_name STRING,
  temp INT,
  humidity INT
);
```

Then push records with an SDK. In Python (`pip install databricks-zerobus-ingest-sdk`):

```python title="producer.py"
from zerobus.sdk.sync import ZerobusSdk
from zerobus.sdk.shared import TableProperties

sdk = ZerobusSdk(SERVER_ENDPOINT, DATABRICKS_WORKSPACE_URL)
table_properties = TableProperties("main.default.air_quality")
stream = sdk.create_stream(CLIENT_ID, CLIENT_SECRET, table_properties)

stream.ingest_record_offset({"device_name": "sensor-1", "temp": 22, "humidity": 55})
# ingest more records...
stream.close()
```

The same code scales from a test client to production. For the endpoint format, service principal credentials and grants, and examples in other languages, see [Use Zerobus Ingest](https://docs.databricks.com/aws/en/ingestion/zerobus-ingest).

## How it works

Zerobus exposes one endpoint with several interfaces. Each one validates records against the target table's schema and writes them into the table:

- **SDKs over gRPC** in Python, Java, Rust, Go, and TypeScript, plus C++ and C# / .NET in Beta. Persistent streams for high-volume, ordered ingestion; the SDKs handle authentication, acknowledgments, and recovery.
- **REST** for large fleets of lightweight or intermittent clients, such as edge devices that report infrequently.
- **OpenTelemetry (OTLP)** for traces, logs, and metrics from existing collectors. See [Ingest OpenTelemetry data](https://docs.databricks.com/aws/en/ingestion/opentelemetry/).
- **MQTT v5** (Beta) for IoT and edge applications that publish JSON records over TLS. See [Use MQTT](https://docs.databricks.com/aws/en/ingestion/zerobus-mqtt).
- **Kafka-compatible APIs** (Public Preview) for existing Kafka producers, with no Databricks SDK. See [Use Kafka-compatible APIs](https://docs.databricks.com/aws/en/ingestion/zerobus-kafka).

Zerobus is available in [some regions](https://docs.databricks.com/aws/en/resources/feature-region-support#ingestion). Default throughput quotas are adjustable; see [Zerobus Ingest quotas](https://docs.databricks.com/aws/en/ingestion/zerobus-quotas).

## Monitor usage and ingestion

Zerobus bills against the Jobs Serverless SKU (see [Lakeflow Connect pricing](https://www.databricks.com/product/pricing/lakeflow-connect)). To track spend, query the [billable usage system table](https://docs.databricks.com/aws/en/admin/system-tables/billing) and filter on `billing_origin_product = 'LAKEFLOW_CONNECT'`. The `product_features.lakeflow_connect.zerobus_request_type` field shows which interface sent the data: `GRPC`, `HTTP`, `OTEL_GRPC`, `OTEL_HTTP`, `KAFKA`, or `MQTT`.

For ingestion activity, Zerobus writes to two [system tables](https://docs.databricks.com/aws/en/admin/system-tables/zerobus-ingest) in `system.lakeflow` (Beta):

- **`zerobus_stream`** tracks each stream: when it opened and closed, its protocol and data format, and any errors.
- **`zerobus_ingest`** tracks each batch committed to a Delta table, with record and byte counts and any errors.

```sql
SELECT commit_time, committed_records, committed_bytes, errors
FROM system.lakeflow.zerobus_ingest
WHERE table_name = 'main.default.air_quality'
ORDER BY commit_time DESC
LIMIT 20;
```

To read them, you need `USE` and `SELECT` on the system schemas, or both metastore admin and workspace admin rights.

## Start building with the agent skill

The [`databricks-zerobus-ingest`](/docs/tools/ai-tools/agent-skills) agent skill teaches your coding agent how to pick an interface, confirm the prerequisites, write a producer, and verify that rows landed. It ships with the Databricks agent skills:

```bash
databricks aitools install
```

In Claude Code, you can install the same skills from the plugin marketplace instead:

```text
/plugin marketplace add databricks/databricks-agent-skills
/plugin install databricks@databricks-agent-skills
```

Then start with a prompt like this one:

```text title="Prompt"
Use the databricks-zerobus-ingest skill to stream JSON events from my Python service into a new Unity Catalog table, main.default.app_events. Show me your plan first, check the prerequisites, and offer to create the table and service principal if they're missing. Then write a non-blocking producer, send a test batch of 100 records, and verify that the rows landed.
```

The skill asks where the producer runs, what the data looks like, and which language you use. It checks for a workspace in a supported region, a managed Delta table, and a service principal with `MODIFY` and `SELECT` on that table, and it explains Databricks terms along the way if you're new to the platform.

## Where to next

- [Zerobus Ingest concepts](https://docs.databricks.com/aws/en/ingestion/zerobus-concepts) for streams, ordering, durability, and scaling.
- [API protocols](https://docs.databricks.com/aws/en/ingestion/zerobus-api-protocols) to compare gRPC, REST, OTLP, MQTT, and Kafka-compatible APIs.
- [Use Zerobus Ingest](https://docs.databricks.com/aws/en/ingestion/zerobus-ingest) for endpoints, authentication, and per-language client examples.
- [Agent skills](/docs/tools/ai-tools/agent-skills) for the full skill catalog and install options.
- [Analytical reads](/docs/lakehouse/analytical-reads) to query the ingested tables from your AppKit app.
