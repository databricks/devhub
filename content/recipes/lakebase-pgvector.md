## Lakebase pgvector

Enable vector similarity search in Lakebase using the pgvector extension.

### 1. Enable pgvector

```bash
databricks psql --project <project-name> --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS vector;
"
```

### 2. Create embedding table

```sql
CREATE SCHEMA IF NOT EXISTS rag;

CREATE TABLE IF NOT EXISTS rag.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> **Vector dimensions**: `VECTOR(1024)` must match your embedding model output. `databricks-gte-large-en` produces 1024 dimensions.

### 3. Server-side RAG store module

Create `server/lib/rag-store.ts` with table setup, insert, and similarity search. Call `setupRagTables(appkit)` from `server.ts` before starting the server.

`server/lib/rag-store.ts`:

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

export async function setupRagTables(appkit: AppKitWithLakebase) {
  try {
    await appkit.lakebase.query("CREATE EXTENSION IF NOT EXISTS vector");
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "42501") {
      console.log(
        "[rag] Skipping extension creation — insufficient privileges (likely already exists)",
      );
    } else {
      throw err;
    }
  }
  const { rows } = await appkit.lakebase.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'rag' AND table_name = 'documents'`,
  );
  if (rows.length > 0) return;
  await appkit.lakebase.query(`CREATE SCHEMA IF NOT EXISTS rag`);
  await appkit.lakebase.query(`
    CREATE TABLE IF NOT EXISTS rag.documents (
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
    `INSERT INTO rag.documents (content, embedding, metadata)
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
     FROM rag.documents
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(queryEmbedding), limit],
  );
  return result.rows;
}
```

> **Distance operators**: `<=>` cosine (default for text), `<->` L2, `<#>` inner product.

### 6. Create index

Add after inserting initial data (IVFFlat needs representative data to build):

```sql
CREATE INDEX IF NOT EXISTS idx_documents_embedding
  ON rag.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
ANALYZE rag.documents;
```

> For higher recall without tuning, use `USING hnsw (embedding vector_cosine_ops)` instead.

#### References

- [pgvector](https://github.com/pgvector/pgvector)
- [Lakebase extensions](https://docs.databricks.com/aws/en/oltp/projects/extensions)
