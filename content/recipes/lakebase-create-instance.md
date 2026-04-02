## Create a Lakebase Instance

Provision a managed Lakebase Postgres project on Databricks and collect the connection values needed by downstream recipes.

### 1. Create a Lakebase project

Create a new Lakebase Postgres project. This provisions a managed Postgres cluster with a default branch and endpoint:

```bash
databricks postgres create-project <project-name> --profile <PROFILE>
```

### 2. Verify the project resources

Confirm the branch, endpoint, and database were created:

```bash
databricks postgres list-branches \
  projects/<project-name> \
  --profile <PROFILE> -o json

databricks postgres list-endpoints \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json

databricks postgres list-databases \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json
```

### 3. Note the connection values

Record these values from the command output above. They are required by the Lakebase Data Persistence recipe and other Lakebase-dependent recipes:

| Value                    | JSON path                     | Used for                                              |
| ------------------------ | ----------------------------- | ----------------------------------------------------- |
| Endpoint host            | `...status.hosts.host`        | `PGHOST`, `lakebase.postgres.host`                    |
| Endpoint resource path   | `...name`                     | `LAKEBASE_ENDPOINT`, `lakebase.postgres.endpointPath` |
| Database resource path   | `...name`                     | `lakebase.postgres.database`                          |
| PostgreSQL database name | `...status.postgres_database` | `PGDATABASE`, `lakebase.postgres.databaseName`        |

#### References

- [What is a Lakebase?](/solutions/what-is-a-lakebase)
- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
