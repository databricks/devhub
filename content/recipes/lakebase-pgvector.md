## Lakebase pgvector

Enable vector similarity search in Lakebase using the pgvector extension.

This recipe assumes you have already completed the [Create a Lakebase Instance](/resources/lakebase-create-instance) recipe and have a Lakebase project provisioned.

### 1. Enable pgvector

```bash
databricks psql --project <project-name> --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS vector;
"
```

### 2. Create embedding table

```sql
CREATE SCHEMA IF NOT EXISTS vectors;

CREATE TABLE IF NOT EXISTS vectors.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> **Vector dimensions**: `VECTOR(1024)` must match your embedding model's output dimension. `databricks-gte-large-en` and `databricks-bge-large-en` both produce 1024 dimensions. If you use a different model (for example, a 768- or 1536-dimension model), change `VECTOR(1024)` to match.

### 3. Server-side vector store module

Create `server/lib/vector-store.ts` with table setup, insert, and similarity search. Call `setupVectorTables(appkit)` from `server.ts` before starting the server.

`server/lib/vector-store.ts`:

```typescript
import type { Application } from "express";

interface AppKitWithLakebase {
  lakebase: {
    query(
      text: string,
      params?: unknown[],
    ): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

export async function setupVectorTables(appkit: AppKitWithLakebase) {
  try {
    await appkit.lakebase.query("CREATE EXTENSION IF NOT EXISTS vector");
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "42501") {
      console.log(
        "[vectors] Skipping extension creation — insufficient privileges (likely already exists)",
      );
    } else {
      throw err;
    }
  }
  const { rows } = await appkit.lakebase.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'vectors' AND table_name = 'documents'`,
  );
  if (rows.length > 0) return;
  await appkit.lakebase.query(`CREATE SCHEMA IF NOT EXISTS vectors`);
  await appkit.lakebase.query(`
    CREATE TABLE IF NOT EXISTS vectors.documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      embedding VECTOR(1024),
      metadata JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function insertDocument(
  appkit: AppKitWithLakebase,
  input: {
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
  },
) {
  const result = await appkit.lakebase.query(
    `INSERT INTO vectors.documents (content, embedding, metadata)
     VALUES ($1, $2::vector, $3)
     RETURNING id, content, metadata, created_at`,
    [
      input.content,
      JSON.stringify(input.embedding),
      JSON.stringify(input.metadata ?? {}),
    ],
  );
  return result.rows[0];
}

export async function retrieveSimilar(
  appkit: AppKitWithLakebase,
  queryEmbedding: number[],
  limit = 5,
) {
  const result = await appkit.lakebase.query(
    `SELECT id, content, metadata, 1 - (embedding <=> $1::vector) AS similarity
     FROM vectors.documents
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(queryEmbedding), limit],
  );
  return result.rows;
}
```

> **Distance operators**: `<=>` cosine (default for text), `<->` L2, `<#>` inner product.

### 4. Create an index

Add after inserting initial data (IVFFlat needs representative data to build):

```sql
CREATE INDEX IF NOT EXISTS idx_documents_embedding
  ON vectors.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
ANALYZE vectors.documents;
```

> For higher recall without tuning, use `USING hnsw (embedding vector_cosine_ops)` instead.

#### References

- [pgvector](https://github.com/pgvector/pgvector)
- [Lakebase extensions](https://docs.databricks.com/aws/en/oltp/projects/extensions)
