## Scaffold the RAG Chat App

Scaffold a complete RAG chat app with pgvector retrieval, AI Gateway embeddings, and streaming chat using AppKit CLI.

### 1. Scaffold with Lakebase feature

```bash
databricks apps init \
  --name <app-name> \
  --description "RAG Chat AppKit app with pgvector retrieval" \
  --version latest \
  --features=lakebase \
  --run none \
  --profile <PROFILE>
```

The `--features=lakebase` flag adds the Lakebase plugin with Postgres connection fields. The CLI will prompt for resource paths — use full Lakebase resource names from `databricks postgres list-branches` and `databricks postgres list-databases`.

### 2. Enter the project and install dependencies

```bash
cd <app-name>
npm install
```

### 3. Install AI SDK packages

```bash
npm install ai@6 @ai-sdk/react@3 @ai-sdk/openai
```

### 4. Configure environment

Add to `.env`:

```bash
DATABRICKS_CONFIG_PROFILE=<PROFILE>
DATABRICKS_ENDPOINT=<chat-endpoint>
DATABRICKS_EMBEDDING_ENDPOINT=<embedding-endpoint>
DATABRICKS_WORKSPACE_ID=<workspace-id>
RAG_RESEED=false
```

The Lakebase connection variables (`PGHOST`, `PGDATABASE`, `LAKEBASE_ENDPOINT`, `PGPORT`, `PGSSLMODE`) are populated by `appkit plugin sync` during scaffold.

### 5. Verify databricks.yml resource paths

Open `databricks.yml` and confirm the `postgres_branch` and `postgres_database` variables use full resource paths:

```yaml
variables:
  postgres_branch: projects/<project>/branches/<branch>
  postgres_database: projects/<project>/branches/<branch>/databases/<db>
```

Short defaults like `main` will fail on deploy — always use full resource names from `databricks postgres list-branches` and `databricks postgres list-databases`.

### 6. Verify local dev server

```bash
npm run dev
```

The dev server starts on `http://localhost:8000`. After first run, check `.env` for duplicate blank entries added by `appkit plugin sync` and remove them.

#### References

- [Databricks Apps init](https://docs.databricks.com/aws/en/dev-tools/cli/app-commands#init)
- [AppKit Lakebase plugin](https://databricks.github.io/appkit/docs/plugins/lakebase)
