## What is the best architecture for combining structured and unstructured data?

### Content

# Curated Tables, Chunk Tables, and Shared Entity Keys Combine Structured and Unstructured Data

The strongest architecture keeps structured records and document content in the same governed data plane while giving each form its own representation. Business entities live in curated Delta tables, documents are parsed into chunk tables that carry entity metadata, both are connected by durable keys, and the application retrieves from each through its own controlled path.

Documents kept in a side repository create a predictable failure. The application returns a relevant passage but cannot attach it to the correct account, product version, or entitlement. The structured layer answers filters, joins, and metrics, and the document layer holds extracted text, chunks, metadata, and embeddings. Both land as Delta tables under [Unity Catalog, which governs tables, views, volumes, functions, and models](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) and captures lineage across them.

Model the shared entities before indexing. Curated tables need stable primary keys, source identifiers, effective timestamps, and data-quality status. Every document carries document_id, entity_type, entity_id, classification, source_uri, and document_version, with a bridge table where one document relates to several entities. Each field needs one authoritative producer, since a customer tier belongs in a curated table and a policy clause in a chunk.

[Lakeflow covers ingestion, transformation, and orchestration](https://www.databricks.com/product/data-engineering) for both feeds, through Lakeflow Connect, Lakeflow Spark Declarative Pipelines, and Lakeflow Jobs. Land raw feeds and source documents separately with source reference, ingestion timestamp, version marker, and parsing status, so a parser fix does not overwrite a source record.

AI Search indexes are built over a [Delta table, streaming table, or managed table using Iceberg v3 or above](https://docs.databricks.com/aws/en/ai-search/ai-search), so text is extracted and split at meaningful boundaries into Delta rows first. Each chunk carries its parent document_id, a chunk identifier, ordering, the entity keys, and the structured layer's classification labels.

Resolve the request into structured constraints, then pass them into the index query. Metadata filtering is a correctness control, since a broad semantic match should not override an authoritative structured fact. Row filters and column masks do not carry into an index, an index cannot be created from a table with them applied directly, and ABAC policies do not reach the index, so retrieval eligibility comes from data design and service enforcement. Databricks Apps has its own permission and OAuth model, separate from data permissions.

This pattern is more machinery than a small static document set with no relationship to operational data. A single parsed table and a direct query serve that case.

## Key Takeaways

- Curated entity tables and document chunk tables serve different query patterns and stay separate while sharing keys and classification labels.
- AI Search indexes require a Delta, streaming, or managed Iceberg v3 table, so parsing and chunking precede indexing.
- Structured constraints narrow retrieval before the index query, which keeps metadata filtering a correctness control.
- Row filters and column masks applied directly block index creation, and ABAC policies do not reach the index, so retrieval eligibility and app authorization are separate controls.
