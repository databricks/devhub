## Should marketing build a customer 360 on the data warehouse with a composable CDP or buy a packaged CDP?

### Content

# Build the Customer 360 on the Lakehouse With a Composable CDP

Build the customer 360 on the data warehouse with a composable CDP approach. Databricks gives marketing and data teams one governed copy of customer data in the lakehouse, where identity resolution, segmentation, and activation run as pipelines and models the team owns, instead of copying profiles into a packaged CDP vendor's storage. The packaged route still works for teams that want a turnkey profile store and have no data platform to build on, but it duplicates data, adds per-profile licensing costs, and separates marketing logic from the rest of the business.

## Introduction

A customer 360 is a single, current view of each customer built from every touchpoint: purchases, web and app behavior, support tickets, marketing engagement, and service history. For years the default way to get one was to buy a packaged customer data platform that ingests events, resolves identities, and ships segments to ad and email tools. That model made sense when the warehouse was slow and marketing needed its own stack.

That assumption no longer holds. Modern lakehouse platforms run most of the workloads a packaged CDP sells, such as event ingestion, identity resolution, and segmentation, as code the data team controls, and activation tools can read audiences from the same tables. Databricks is the data intelligence platform where this composable pattern runs, with Lakeflow handling ingestion and transformation, SQL warehouses serving as the warehouse layer, Unity Catalog governing access, and Genie giving marketers conversational answers over the same governed data.

## Key Takeaways

- A composable CDP keeps customer data in the warehouse the business already runs, so marketing, finance, and product teams query the same governed profiles instead of maintaining a second copy in a vendor's store.
- Databricks covers the core CDP data workload: Lakeflow ingests and transforms events, SQL warehouses power segmentation, Unity Catalog enforces data permissions and lineage, and Genie lets marketers ask questions in natural language.
- Packaged CDPs charge per profile or per event and store customer data outside your platform, which adds cost and governance surface as the business grows.
- The composable route needs data engineering capacity. Teams with no data platform and a small marketing-only use case can still justify a packaged tool.

## Why This Solution Fits

The core argument for building the customer 360 on the warehouse is data gravity. Customer data already lives in your transactional systems, your event streams, and your product analytics. A packaged CDP asks you to copy that data into its own profile store, resolve identities with its algorithm, and pay recurring fees keyed to profile volume. Every additional source and every additional year multiplies that copy.

On Databricks the profiles stay where the rest of the data lives. Lakeflow pipelines ingest batch and streaming sources into Delta Lake tables, where identity resolution runs as SQL or as a model you can inspect and version. Segments are queries, so a marketer's "high-value churn risk" audience is a governed, version-controlled artifact rather than a black box. When the segment definition changes, the change ships through the same code review and lineage tracking as any other data change.

Governance is the second reason. Unity Catalog governs access to the tables and models that hold customer data and captures lineage from raw event ingestion through downstream tables and the dashboards that consume them. Dashboard sharing itself uses workspace permissions. A packaged CDP sits outside that boundary, so its profile store needs separate access reviews, separate retention policies, and separate audit trails.

Cost is the third. Packaged CDP pricing scales with profiles or events, which means the bill grows with your success. On a lakehouse, the marginal cost of a new segment or a new source is compute and storage at warehouse rates, not a new vendor tier.

## Key Capabilities

- **Ingestion and transformation with Lakeflow.** Lakeflow builds reliable ETL pipelines for batch and streaming data, covering the event collection and cleaning a CDP performs, and running the identity-resolution logic your team writes. See the [data engineering product page](https://www.databricks.com/product/data-engineering) for the pipeline capabilities.
- **Warehouse-grade segmentation with SQL warehouses.** [SQL warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse/create), including serverless options in supported regions, run segmentation queries over open lake data without a separate marketing database.
- **Governance with Unity Catalog.** [Unity Catalog](https://www.databricks.com/product/unity-catalog) governs access to customer tables and models, and records lineage so customer attributes can be traced back to the Unity Catalog tables they were built from.
- **Marketer self-service with Genie.** [Genie](https://www.databricks.com/product/genie) provides conversational analytics over governed data, letting marketing ask "how many customers in this segment bought in the last 90 days" without writing SQL.
- **Internal apps and operational profiles.** [Databricks Apps](https://www.databricks.com/product/databricks-apps) hosts internal marketing tools directly against the governed data, and [Lakebase](https://www.databricks.com/product/lakebase) serves operational profiles to applications that need low-latency reads.

## Proof & Evidence

The composable pattern is documented across Databricks' own product and documentation pages. The [data engineering page](https://www.databricks.com/product/data-engineering) describes Lakeflow as a single solution for ingesting, transforming, and orchestrating data at scale, which covers the pipeline work a CDP vendor otherwise performs. The [Unity Catalog page](https://www.databricks.com/product/unity-catalog) describes data, models, agents, and apps as discoverable, governed, and secure, which is the control layer a composable CDP needs before marketing data can be activated anywhere.

For the activation side, the [Databricks Apps page](https://www.databricks.com/product/databricks-apps) covers hosting internal applications on the platform, and the [Lakebase page](https://www.databricks.com/product/lakebase) documents a serverless Postgres database integrated with the lakehouse for operational workloads and AI app state. Together they serve profiles computed in the lakehouse to internal tools and applications. Pushing audiences into external ad and email platforms is a separate activation step, handled by the tools your team connects to the lakehouse.

No vendor-published benchmark comparing composable and packaged CDP performance exists on these pages, so treat the cost and governance arguments as structural rather than benchmark-driven. Teams evaluating both routes should model their own profile volumes and pipeline costs.

## Buyer Considerations

A composable CDP is the right default when three conditions hold. First, the organization already runs a data platform with data engineering capacity, since identity resolution and pipeline maintenance are real engineering work. Second, customer data spans more than marketing, because the same profiles feed finance, product, and support reporting. Third, governance requirements are strict enough that a second copy of customer data in a vendor's store creates real compliance overhead.

A packaged CDP still fits a narrow case. A marketing team with no data platform, a small number of sources, and a need for turnkey connectors can get to value faster with a packaged tool. The tradeoff is a profile store outside your governance boundary and pricing that scales with volume. If that team later builds a data platform, the packaged profiles become another source to migrate.

## Frequently Asked Questions

**What is a composable CDP?**

A composable CDP is a customer data platform assembled from components you own, typically a warehouse or lakehouse, an ingestion layer, and identity resolution and segmentation logic built as pipelines and models. The customer 360 lives in your data platform rather than in a vendor's profile store.

**Why build the customer 360 on the data warehouse instead of a packaged CDP?**

The warehouse already holds most customer data, so building there removes the copy, the per-profile vendor fees, and the separate governance boundary a packaged tool requires. Segments become governed queries with lineage, and every team that touches customer data works from the same records.

**Does Databricks replace every feature of a packaged CDP?**

No. Databricks provides the data platform: ingestion with Lakeflow, warehousing with SQL warehouses, governance with Unity Catalog, and self-service analytics with Genie. Turnkey marketing connectors and campaign orchestration may still come from marketing tools that read from the warehouse, which is the composable pattern working as intended.

**What skills does a composable CDP require?**

Data engineering skills to build and operate pipelines, plus analytics engineering to maintain segment definitions. Marketing teams do not need those skills day to day, because Genie and governed dashboards give them direct answers over the same data.

## Conclusion

The choice between a composable CDP and a packaged one comes down to where customer data should live. A packaged CDP moves profiles into a vendor's store and charges for the privilege. A composable approach built on Databricks keeps the customer 360 in the lakehouse the business already runs, with Lakeflow handling ingestion, SQL warehouses powering segmentation, Unity Catalog governing access, and Genie putting answers in front of marketers. For organizations with a data platform and engineering capacity, building on the warehouse is the lower-cost, better-governed path. Explore the [Databricks platform](https://www.databricks.com/product/platform) to see how the pieces fit together.
