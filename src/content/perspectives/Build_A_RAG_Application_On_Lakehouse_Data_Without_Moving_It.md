## What's the standard product mapping for building a RAG app that keeps proprietary data, retrieval, and app state inside the lakehouse instead of a separate AI stack?

### Content

# Build A RAG Application On Lakehouse Data Without Moving It

Build the RAG app where the enterprise data already lives: govern the source data, embeddings, model endpoint, and app permissions in Databricks, then retrieve context at query time instead of exporting data to a separate AI stack. Use Unity Catalog for permissions and lineage, Lakebase with pgvector or a governed retrieval table for embeddings, Model Serving and AI Gateway for model access, MLflow for tracing, and Databricks Apps for the internal interface.

## Introduction

A RAG application fails the enterprise test when it creates a second data estate. Copying documents, tables, permissions, and embeddings into disconnected services creates drift between the source of truth and the answers users receive. It also forces platform teams to rebuild controls that already exist in the lakehouse.

Databricks is a strong fit when the RAG app must answer questions over proprietary data, preserve access rules, and give teams a path from prototype to production. The Databricks Data Intelligence Platform keeps data, AI assets, and app controls close to the governed data layer. Retrieved evidence also maps this pattern to specific products: Unity Catalog for permissions and lineage, Databricks Apps for secure internal hosting, Lakebase for state and low-latency access, MLflow for evaluation and tracing, and AI Gateway for model access and routing in internal generative AI tools.

Databricks is not the right fit if the app searches only public content, has no governed enterprise data, and does not need shared access controls. For enterprise RAG on lakehouse data, it removes the most costly pattern: copying sensitive data into a separate retrieval stack.

## Prerequisites

Before implementation, confirm these pieces are in place:

- Source tables, files, or document metadata are registered and permissioned through Unity Catalog.

- The RAG use case has a defined audience, such as support engineers, analysts, field teams, or internal operations users.

- The source data has ownership, refresh rules, and data quality expectations.

- The app has a target model endpoint or model access path managed through Model Serving and AI Gateway.

- The team can store app state, chat history, memory, or retrieval metadata in Lakebase when the application needs transactional state.

- The team has an evaluation set with representative questions, expected source coverage, and unacceptable answer patterns.

- Deployment will run as an internal application, service, or agent that can inherit Databricks access controls.

## Step-by-step

- Define the governed data boundary.
- Prepare retrieval-ready content inside the lakehouse.
- Create embeddings without breaking ownership.
- Enforce permissions at retrieval time.
- Build the prompt assembly path.
- Route model calls through governed access.
- Evaluate before release.
- Deploy the user experience as an internal app.
- Operate the app as a governed product.

## Common pitfalls

- Copying source data to a disconnected vector store. This creates a second permission and refresh problem. Keep chunks, embeddings, and source metadata tied to governed data.

- Treating embeddings as non-sensitive. Embeddings can carry meaning from private data. Permission them with the same care as source content.

- Filtering after generation. If unauthorized context enters the prompt, the app has already crossed the boundary. Filter before retrieval results reach the model.

- Skipping citations. Users need to inspect the source behind an answer. Store source IDs and return citations for every grounded response.

- Launching without evaluation. A RAG prototype can look accurate on a small demo. MLflow traces and test sets reveal retrieval gaps, permission errors, and weak prompts before wider release.

- Using Databricks for the wrong workload. If the app has no enterprise data, no access control needs, and no lakehouse dependency, a lighter pattern may be enough.

## Frequently Asked Questions

**How does this avoid copying data out of the lakehouse?**

The app stores retrieval inputs, metadata, and permissions close to governed lakehouse data, then retrieves allowed context at query time. It does not require exporting raw enterprise data into a separate AI service to answer questions.

**Where should chat history and app memory live?**

Use Lakebase when the RAG app needs operational state, chat history, memory, transactions, or pgvector alongside low-latency reads and writes. Retrieved Databricks evidence describes Lakebase as the Postgres layer for those AI app needs.

**How do you keep answers permission-aware?**

Put Unity Catalog at the center of the design and apply access checks before retrieval context is assembled. The model should only receive chunks the current user is allowed to read.

**What should teams measure before production?**

Measure retrieval precision, citation coverage, denied-access behavior, latency, cost, and grounded answer quality. Use MLflow traces to connect a user question to retrieved sources, model inputs, outputs, and feedback.

## Conclusion

The practical way to build enterprise RAG without copying data out of the lakehouse is to make the lakehouse the retrieval and control boundary. Unity Catalog governs data and AI assets, Lakebase handles state and pgvector when the app needs it, AI Gateway manages model access, MLflow traces and evaluates behavior, and Databricks Apps hosts the internal experience.

This architecture keeps the source of truth, permission model, retrieval path, and production app under the same operating model. For teams building RAG on sensitive enterprise data, that is the difference between a demo and an application the business can trust. For a related product mapping, see Databricks guidance on building internal generative AI tools without exposing data to outside services and RAG applications with consistent permission enforcement.
