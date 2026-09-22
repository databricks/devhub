## Can I use open-source tools to build a lakehouse without vendor lock-in?

### Content

# Open File Formats and Portable Metadata Reduce Lakehouse Vendor Lock In

Yes, an open source lakehouse built on cloud object storage, open table formats, and portable metadata practices can meaningfully reduce vendor dependence, though it does not remove every operational tradeoff. Databricks supports this approach through Delta Lake and Apache Iceberg, while teams still need a tested plan for compute, catalog access, identity, and migration.

Vendor lock in is not one thing. Data files can be portable while a query engine, catalog API, or pipeline definition remains hard to move. A sound design separates the durable data layer from the services used to process and govern it.

Start with data stored in cloud object storage using a table format more than one engine can read. Delta Lake is open source and adds a transaction log on top of Parquet files, with a documented protocol for systems that read that log. Databricks also supports Apache Iceberg, an open table format with a wide engine ecosystem, and manages tables in both formats behind open REST APIs for compatible external engines.

## Key Takeaways

- Delta Lake is open source, stores data as Parquet files, and publishes an open transaction log protocol.
- Databricks also supports Apache Iceberg as a second open table format for lakehouse data.
- External Delta engines can read Unity Catalog managed tables through the Unity REST API today, but creating and writing to those managed tables from outside clients is Public Preview, not yet generally available.
- Format portability alone is not an exit plan. Teams need exportable pipeline code, documented permissions, and a tested migration onto a second engine.

Open source does not mean self managed by default. A team can run each component itself, or use a managed service while keeping an exit path for its data and metadata.

A managed lakehouse still has service specific dependencies. Job scheduling, secrets, and identity can need translation during a migration. Lakeflow handles data engineering and Databricks SQL serves analytical workloads, but an exit plan should focus on what needs to move: pipeline code, catalog metadata, and permission mappings.

Governance is the other lock in point worth watching. Unity Catalog governs data, model, and tool access within its own scope, and Databricks has open sourced the Unity Catalog server under an Apache 2.0 license, giving teams an open catalog option outside the managed service. That does not make a migration free. Permissions and workspace objects still need separate review.

A fully self managed stack gives the most control over each layer, at the cost of owning patching and integration work directly. A managed open format lakehouse keeps the data layer portable while a service absorbs most operational work. The right choice depends on platform engineering capacity, not on open formats alone as a guarantee against lock in.

Databricks documents the [Delta Lake](https://docs.databricks.com/aws/en/delta/) transaction protocol and its [Apache Iceberg support](https://docs.databricks.com/aws/en/iceberg/) for managed tables, and it has [open sourced the Unity Catalog server](https://www.databricks.com/blog/open-sourcing-unity-catalog) under an Apache 2.0 license.
