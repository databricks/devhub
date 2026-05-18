### 2. Create the Lakebase Postgres prerequisites

The template's AppKit Lakebase plugin requires an existing Postgres **branch** and **database**. `databricks postgres create-project` automatically provisions a default branch named `production` and a default database on it, so one command is all you need. Pick a short lowercase project id and export the resolved resource names — the next step's `databricks apps init` command reads them as shell variables.

```bash
PROJECT_ID=rag-chat

databricks postgres create-project "$PROJECT_ID"

export BRANCH_NAME="projects/$PROJECT_ID/branches/production"
export DATABASE_NAME=$(databricks api get "/api/2.0/postgres/$BRANCH_NAME/databases" -o json | \
  python3 -c "import json,sys; print(json.load(sys.stdin)['databases'][0]['name'])")

echo "Branch:   $BRANCH_NAME"
echo "Database: $DATABASE_NAME"
```

`create-project` is long-running; the CLI waits for it to finish by default. **If it reports `already exists`:**

- **Prefer picking a different `PROJECT_ID`** (e.g. append a short suffix) and re-export `BRANCH_NAME` / `DATABASE_NAME` from the new id. Lakebase projects can hold data that other apps and pipelines depend on, so do **not** run `databricks postgres delete-project` on an existing project without explicit confirmation from the user that nothing else uses it.
- **Eventual-consistency exception:** if you just deleted a project with this id in the same session and `databricks postgres list-projects` no longer shows it, wait 30–60s and retry `create-project` — the control plane is briefly inconsistent after deletion.
