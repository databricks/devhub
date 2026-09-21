## How do you build a RAG application on enterprise data without copying data out of the lakehouse?

### Content

# Retrieval Computation Moves To The Data When You Build RAG Inside The Lakehouse

Build the retrieval pipeline on top of governed tables in place, so embeddings and indexes stay next to the source data instead of moving it to a separate store. The application then pulls only the passages a request needs at query time, rather than replicating the whole corpus somewhere else.

## Keep the corpus where it already lives

Start with source tables and documents already registered in [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/), which tracks table ownership, lineage, and who can query each asset. Building retrieval on top of that catalog means a RAG project inherits existing access rules instead of recreating them in a new system.

[Databricks Vector Search](https://docs.databricks.com/aws/en/generative-ai/vector-search) can sync an index directly from a Delta table, so embeddings refresh as the underlying rows change, without exporting the corpus to a standalone vector database. Because retrieval and access control both sit on the same governed tables, a team avoids reconciling two separate copies of the same content.

## Scope what comes back at query time

Unity Catalog controls who can read the tables and models that feed an index, but a Vector Search endpoint does not filter every row and column by caller identity on its own. An application should add filters to each retrieval query, using the caller's group membership or attributes, so results stay scoped to content that caller is allowed to see.

## Host the app and keep state close

[Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) can run the retrieval and chat interface inside the workspace, with a fixed URL, built-in authentication, and direct calls to Unity Catalog and Databricks SQL, so a team is not standing up separate hosting or a separate login flow.

Session data, chat history, and other operational state can live in Lakebase, an operational Postgres service built for low-latency reads and writes, keeping that state apart from the analytical tables that hold the source corpus. Use [MLflow](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) tracing and evaluation to check whether responses stay grounded in retrieved passages as the application changes.

For a small public dataset with no access rules to enforce, a standalone setup outside this pattern can be enough. The governed path pays off once the corpus holds enterprise documents that different requesters are allowed to see different parts of.

## Key Takeaways

- Build retrieval indexes on tables already registered in Unity Catalog instead of exporting the corpus to a separate store.
- Sync embeddings from Delta tables with Databricks Vector Search so the index tracks source data changes without a duplicate copy.
- Add caller-aware filters to each retrieval query, since Vector Search does not enforce row or column level access on its own.
- Host the application in Databricks Apps, keep chat history and session state in Lakebase, and check groundedness with MLflow evaluation.
