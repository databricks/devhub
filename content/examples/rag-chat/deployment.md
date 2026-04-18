### 4. Install and deploy

`databricks apps init` already wrote `.env` with the resolved Lakebase connection details. For a deploy-only flow you can go straight to deploy — `DATABRICKS_WORKSPACE_ID` and the Lakebase variables are auto-injected into the deployed runtime from `app.yaml` and the bound `postgres` resource.

```bash
cd rag-chat-app
npm install
npm run deploy
```

`npm run deploy` wraps three steps: hydrate the bundle variable overrides from `.env` + the Lakebase Postgres API (`scripts/sync-bundle-vars.mjs`), `databricks bundle deploy` (creates the Databricks app on first run), and `databricks bundle run app` (starts it and prints the URL).

#### Optional — run locally before deploying

Local `npm run dev` needs `DATABRICKS_WORKSPACE_ID` (the **numeric** id used to build the AI Gateway URL) in `.env`. In the deployed app this is auto-injected; locally you have to fetch and patch it yourself:

```bash
WORKSPACE_ID=$(databricks api get /api/2.1/unity-catalog/current-metastore-assignment \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['workspace_id'])")
sed -i.bak "s/^DATABRICKS_WORKSPACE_ID=.*/DATABRICKS_WORKSPACE_ID=$WORKSPACE_ID/" .env && rm .env.bak

npm run dev
```

(Optionally override `DATABRICKS_ENDPOINT` / `DATABRICKS_EMBEDDING_ENDPOINT` in `.env` if you want different chat / embeddings endpoints — also applies to deploy via `app.yaml`.)
