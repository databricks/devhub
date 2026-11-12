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
---

# What is Zerobus Ingest?

**Zerobus Ingest** is a push-based, serverless ingestion service in Lakeflow Connect. A producer (an app, a service, a device, or a script) sends records to one endpoint, and they land directly in a Unity Catalog managed Delta table. You no longer need to run a message bus, brokers, or an ingestion job between your producers and the lakehouse: create a table, then push data to it.

Zerobus is the write path into the Data Lakehouse. The tables it fills are ordinary Unity Catalog tables, so the rest of this section reads them the usual way: [analytical reads](/docs/lakehouse/analytical-reads) from your AppKit app, [Genie](/docs/lakehouse/genie) for natural-language questions, and [Lakeflow pipelines](/docs/lakehouse/pipelines) for downstream processing.

## When to use Zerobus Ingest

- **Your app, service, or device pushes the data**: application and clickstream events, logs, IoT and device telemetry, or change data capture from an operational database.
- **The destination is a Delta table** and the lakehouse is the one main consumer. Records are durable in about 150 ms and queryable in about 5 seconds, and Zerobus still fits when minutes are acceptable.
- **A message bus would only be a pipe to the lakehouse.** Producers write straight to the table, so there are fewer hops and fewer moving parts to operate.
- **Your sources already speak a standard protocol.** OpenTelemetry collectors, Kafka producers, and MQTT v5 clients can point at Zerobus without custom SDK code.

## When not to use it

- **Many independent consumers outside the lakehouse** read the same stream, with replay or consumer groups. Keep your message bus (Apache Kafka, Amazon Kinesis, Azure Event Hubs, or Google Cloud Pub/Sub) and copy the data in with [managed streaming connectors](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/streaming-overview). The same applies when the data is already in a bus and must be pulled into the lakehouse.
- **The data already lands as files in cloud storage.** Use [Auto Loader](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/).
- **You need sub-second latency in the processing path.** Use [real-time mode](https://docs.databricks.com/aws/en/structured-streaming/real-time/concepts).
- **Your app needs transactional reads and writes** (sessions, orders, user state). Use [Lakebase Postgres](/docs/lakebase/overview).

## How it works

Zerobus exposes one endpoint with several interfaces. Each one validates records against the target table's schema and writes them into the table:

- **SDKs over gRPC** in Python, Java, Rust, Go, and TypeScript, plus C++ and C# / .NET in Beta. Persistent streams for high-volume, ordered ingestion; the SDKs handle authentication, acknowledgments, and recovery. See [Use Zerobus Ingest](https://docs.databricks.com/aws/en/ingestion/zerobus-ingest).
- **REST** for large fleets of lightweight or intermittent clients, such as edge devices that report infrequently.
- **OpenTelemetry (OTLP)** for traces, logs, and metrics from existing collectors. See [Ingest OpenTelemetry data](https://docs.databricks.com/aws/en/ingestion/opentelemetry/).
- **MQTT v5** (Beta) for IoT and edge applications that publish JSON records over TLS. See [Use MQTT](https://docs.databricks.com/aws/en/ingestion/zerobus-mqtt).
- **Kafka-compatible APIs** (Public Preview) for existing Kafka producers, with no Databricks SDK. See [Use Kafka-compatible APIs](https://docs.databricks.com/aws/en/ingestion/zerobus-kafka).

A few facts shape every design:

- **The table comes first.** Zerobus never creates or alters tables. The table schema is the contract each record must match.
- **Durable is not queryable.** An acknowledgment means the record is stored safely. It shows up in the table a few seconds later.
- **Delivery is at least once,** and ordering holds per stream only. Retries can produce a few duplicates.
- **You scale by opening more streams.** Default quotas are adjustable. See [Zerobus Ingest quotas](https://docs.databricks.com/aws/en/ingestion/zerobus-quotas).

Zerobus is available in [some regions](https://docs.databricks.com/aws/en/resources/feature-region-support#ingestion) and bills against the Jobs Serverless SKU. See [Lakeflow Connect pricing](https://www.databricks.com/product/pricing/lakeflow-connect).

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

The skill asks where the producer runs, what the data looks like, and which language you use. It checks for a workspace in a supported region, a managed Delta table, and a service principal with `MODIFY` and `SELECT` granted directly on that table, and it explains Databricks terms along the way if you're new to the platform.

## Where to next

- [Zerobus Ingest concepts](https://docs.databricks.com/aws/en/ingestion/zerobus-concepts) for streams, ordering, durability, and scaling.
- [API protocols](https://docs.databricks.com/aws/en/ingestion/zerobus-api-protocols) to compare gRPC, REST, OTLP, MQTT, and Kafka-compatible APIs.
- [Use Zerobus Ingest](https://docs.databricks.com/aws/en/ingestion/zerobus-ingest) for endpoints, authentication, and per-language client examples.
- [Agent skills](/docs/tools/ai-tools/agent-skills) for the full skill catalog and install options.
- [Analytical reads](/docs/lakehouse/analytical-reads) to query the ingested tables from your AppKit app.
