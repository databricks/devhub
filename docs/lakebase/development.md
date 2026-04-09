---
title: Development
---

# Development

## On Databricks App Platform (AppKit)

The [Lakebase Data Persistence](/resources/app-with-lakebase#lakebase-data-persistence) recipe is the canonical guide for building Lakebase-backed apps with AppKit. It covers scaffolding, schema setup, CRUD routes, environment configuration, and deployment.

Key points from the recipe:

- **Scaffold**: `databricks apps init` with the Lakebase plugin, or add it to an existing app manually
- **Connection**: AppKit's `lakebase()` plugin provides a `pg.Pool` with automatic OAuth token refresh
- **Deploy first**: the app's Service Principal creates schemas and tables on first deploy. Grant yourself `databricks_superuser` for local development afterward:

```bash title="Common"
databricks psql --project my-project
# After connecting, grant yourself superuser for local development:
# GRANT databricks_superuser TO "<your-email>";
```

```bash title="All Options"
databricks psql \
  --project $PROJECT_ID \
  --branch production \
  --endpoint primary \
  --debug \
  -o json \
  --target $TARGET \
  --autoscaling \
  --max-retries 3 \
  --profile $DATABRICKS_PROFILE \
  -- -c "
    CREATE EXTENSION IF NOT EXISTS databricks_auth;
    SELECT databricks_create_role('$USER_EMAIL', 'USER');
    GRANT databricks_superuser TO \"$USER_EMAIL\";
  "
```

- **Environment**: deployed apps get Postgres connection values injected automatically. Only `LAKEBASE_ENDPOINT` needs explicit configuration in `app.yaml`:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

For pool configuration, ORM access (`.pool`, `.getOrmConfig()`, `.getPgConfig()`), and the full plugin API, see the [AppKit Lakebase plugin docs](/docs/appkit/v0/plugins/lakebase).

## Off-platform (AWS, Vercel, Netlify, etc.)

The [Lakebase Off-Platform](/resources/lakebase-off-platform) cookbook is a complete guide for using Lakebase from apps hosted outside Databricks. It includes:

- [Env Management](/resources/lakebase-off-platform#lakebase-env-management-for-off-platform-apps): how to obtain every connection value via CLI and validate with Zod
- [Token Management](/resources/lakebase-off-platform#lakebase-token-management): cached workspace and Lakebase credential refresh (tokens expire in ~1 hour)
- [Drizzle ORM](/resources/lakebase-off-platform#drizzle--lakebase-in-an-off-platform-app): connecting Drizzle to Lakebase with `pg` password callbacks and migration-time credentials

## Feature branches

Use Lakebase branches to isolate schema changes and test migrations without affecting production:

```bash title="Common"
databricks postgres create-branch projects/my-project feature-xyz
```

```bash title="All Options"
databricks postgres create-branch \
  projects/$PROJECT_ID \
  $BRANCH_ID \
  --json '{"spec": {"source_branch": "projects/$PROJECT_ID/branches/$SOURCE_BRANCH_ID", "no_expiry": true}}' \
  --debug \
  -o json \
  --target $TARGET \
  --no-wait \
  --timeout 10m \
  --profile $DATABRICKS_PROFILE
```

A `primary` read-write endpoint is created automatically, inheriting the project's `default_endpoint_settings`.

Delete when done:

```bash title="Common"
databricks postgres delete-branch projects/my-project/branches/feature-xyz
```

```bash title="All Options"
databricks postgres delete-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option      | Required | Description                                                        |
| ----------- | -------- | ------------------------------------------------------------------ |
| `NAME`      | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}` |
| `--no-wait` | no       | Return immediately with operation details                          |
| `--timeout` | no       | Max time to wait for completion                                    |
| `--debug`   | no       | Enable debug logging                                               |
| `-o json`   | no       | Output as JSON (default: text)                                     |
| `--target`  | no       | Bundle target to use (if applicable)                               |
| `--profile` | no       | Databricks CLI profile name                                        |

## Declarative Automation Bundles

Define Lakebase infrastructure as code in a `databricks.yml` file using [Databricks Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/). This lets you version-control projects, branches, and endpoints alongside your application code.

A bundle defines `postgres_projects`, `postgres_branches`, and `postgres_endpoints` under `resources`. Resources reference each other with `${resources.<type>.<key>.id}`, which resolves to the full resource name (e.g. `projects/my-lakebase-app`). Branches and their auto-created `primary` endpoint inherit `default_endpoint_settings` from the project.

<details>
<summary>Example <code>databricks.yml</code> with a project, dev branch, and read-only replica</summary>

```yaml
bundle:
  name: my-lakebase-app

resources:
  postgres_projects:
    my_app:
      project_id: "my-lakebase-app"
      display_name: "My Lakebase App"
      pg_version: 17
      history_retention_duration: "172800s"
      default_endpoint_settings:
        autoscaling_limit_min_cu: 0.5
        autoscaling_limit_max_cu: 1.0
        suspend_timeout_duration: "300s"
        pg_settings:
          log_min_duration_statement: "1000"

  postgres_branches:
    dev_branch:
      parent: ${resources.postgres_projects.my_app.id}
      branch_id: "dev"
      no_expiry: true
      is_protected: false

  postgres_endpoints:
    read_replica:
      parent: ${resources.postgres_branches.dev_branch.id}
      endpoint_id: "replica"
      endpoint_type: "ENDPOINT_TYPE_READ_ONLY"
      autoscaling_limit_min_cu: 0.5
      autoscaling_limit_max_cu: 0.5
```

</details>

### Validate and deploy

```bash title="Common"
databricks bundle validate
databricks bundle deploy
```

```bash title="All Options"
databricks bundle validate \
  --strict \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE

databricks bundle deploy \
  --auto-approve \
  --force-lock \
  --debug \
  -o json \
  --var "key=value" \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option           | Required | Description                                                       |
| ---------------- | -------- | ----------------------------------------------------------------- |
| `--strict`       | no       | Treat warnings as errors (validate only)                          |
| `--auto-approve` | no       | Skip confirmation prompts (deploy only)                           |
| `--force-lock`   | no       | Force acquisition of deployment lock (deploy only)                |
| `--debug`        | no       | Enable debug logging                                              |
| `-o json`        | no       | Output as JSON (default: text)                                    |
| `--var`          | no       | Set values for bundle config variables (e.g. `--var="key=value"`) |
| `--target`       | no       | Bundle target (e.g. `dev`, `prod`)                                |
| `--profile`      | no       | Databricks CLI profile name                                       |

`bundle deploy` is idempotent -- it creates new resources and updates existing ones to match the configuration. Unlike agents or apps, there is no `bundle run` step; Lakebase resources are active once deployed.

## Troubleshooting

These issues usually involve **Databricks Apps configuration** (resources in `databricks.yml` and `app.yaml`) or **Postgres connectivity** to Lakebase. For how Lakebase is wired as an app resource and which environment variables are set, see [Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase). For connection problems (including idle wake-up and endpoint format), see [Troubleshooting](https://docs.databricks.com/aws/en/oltp/projects/external-apps-connect#troubleshooting) in Connect external apps to Lakebase.

- **`relation 'store' does not exist`**: Memory tables haven't been initialized. Run `await store.setup()` locally before deploying to create the required tables. For the stateful agent memory pattern, see [Debug a deployed AI agent: Memory storage](https://docs.databricks.com/aws/en/generative-ai/agent-framework/debug-agent#memory-storage).
- **`Unable to resolve Lakebase instance`**: Verify `LAKEBASE_INSTANCE_NAME` uses `value` (not `valueFrom`) in `app.yaml` and matches the `instance_name` in `databricks.yml`.
- **`permission denied for table`**: Add a `database` resource in `databricks.yml` with `permission: 'CAN_CONNECT_AND_CREATE'` and redeploy.
- **Connection refused after period of inactivity**: Lakebase Autoscaling scales to zero when idle. The first connection after inactivity triggers a wake-up and may take a few seconds. If your connection library doesn't retry automatically, add a short retry loop.

## All Lakebase recipes

| Recipe                                                                                         | Description                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [Create a Lakebase Instance](/resources/app-with-lakebase#create-a-lakebase-instance)          | Provision a project, collect connection values |
| [Lakebase Data Persistence](/resources/app-with-lakebase#lakebase-data-persistence)            | Schema setup, CRUD routes, deploy workflow     |
| [Lakebase Chat Persistence](/resources/ai-chat-app#lakebase-chat-persistence)                  | Chat/message schema on Lakebase                |
| [Lakehouse Sync (Lakebase Change Data Feed)](/resources#lakebase-change-data-feed-autoscaling) | Sync Lakebase to Unity Catalog                 |
| [Sync Tables](/resources#sync-tables-autoscaling)                                              | Unity Catalog to Lakebase                      |
| [Lakebase Off-Platform](/resources/lakebase-off-platform)                                      | Env, tokens, and Drizzle for off-platform apps |

## Further reading

- [AppKit Lakebase plugin](/docs/appkit/v0/plugins/lakebase)
- [AppKit `@databricks/lakebase` README](https://github.com/databricks/appkit/blob/main/packages/lakebase/README.md)
- [Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
