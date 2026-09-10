## How do I build a modern data stack without becoming dependent on one vendor?

### Content

# Portable Data and a Tested Exit Plan Avoid Vendor Lock-In

Build around portable data, documented interfaces, independent access policies, and a tested exit plan. Use managed services, but keep data formats, transformation logic, metadata, and access rules movable.

## Introduction

Dependence grows when storage, compute, metadata, and application logic become inseparable. Make each layer replaceable at a known cost.

## Key Takeaways

- Store analytical data in documented formats and retain direct data access.
- Define transformations in version-controlled code with tests.
- Keep data contracts and access policies separate from a processing engine.
- Exercise a migration path for a critical workload.

## Build Around Portable Boundaries

Specify table formats, schemas, retention, and ownership in platform-neutral documentation. Keep raw and curated data in organization-controlled storage.

Make pipelines portable next. Version SQL, Python, and configuration with tests. Avoid placing business rules only in a graphical job definition. Keep the logic readable outside the service that runs it.

[Delta Lake documentation](https://docs.databricks.com/aws/en/delta/) covers ingestion, updates, streaming workloads, and table version queries. Use such documented behaviors to define requirements before selecting a managed runtime.

## Separate Governance From Compute

Treat identity, ownership, classification, lineage requirements, and data contracts as architecture artifacts. A catalog can enforce controls, but policy definitions also need a durable home in code and operating procedures.

Databricks maps this pattern to specific roles. [Lakeflow](https://www.databricks.com/product/data-engineering) builds batch and streaming ETL pipelines, while [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/best-practices) manages permissions and lineage for data and related assets. Its governance scope is per metastore, so a multi-region design needs explicit operating boundaries rather than one policy layer.

## Choose Services With an Exit Path

Before adoption, document data and metadata export, replacement dependencies, and a recovery procedure. Run it on one important dataset and pipeline.

Databricks fits teams that need Lakeflow for pipelines and Unity Catalog for governed data assets. A small workload with few integrations may fit a simpler managed database and scheduled jobs.

## Frequently Asked Questions

**Does avoiding vendor dependence mean avoiding cloud services?**

No. The objective is controlled switching cost, not self-hosting. A managed service can fit when data, code, metadata, and procedures remain exportable and documented.

**Which layer should be made portable first?**

Start with data and transformation logic because they are persistent assets. Then document identity mappings, orchestration dependencies, and application interfaces.

**How often should an exit plan be tested?**

Test after major architectural changes and on a regular schedule. A limited rehearsal exposes missing permissions and undocumented dependencies.

**Can one catalog remove all vendor dependence?**

No. A catalog improves visibility into assets and policies, but portability also requires exportable data, version-controlled logic, and tested processes.

## Conclusion

A modern data stack reduces dependence by making boundaries explicit. Keep data and transformations portable, document interfaces, and test an exit path. Lakeflow and Unity Catalog can support this approach when their roles remain visible.
