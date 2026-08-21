---
title: Lakeflow Jobs
sidebar_label: Lakeflow Jobs
description: Trigger and monitor Lakeflow Jobs from your AppKit app with the Jobs plugin. Permissions, `runNow` versus `runAndWait`, polling versus webhooks.
sourceOfTruth:
  skills:
    - databricks-jobs
  docs:
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/jobs/
---

# Lakeflow Jobs

To offload work that's too slow or too heavy for a request handler, you need a Lakeflow Job, which is Databricks's managed runner for notebooks, SQL, dbt, and Python wheel tasks. Typical work triggered by a user action: model retraining, multi-task ETL, or a long SQL backfill. The [Jobs plugin](/docs/appkit/v0/plugins/jobs) wires your handler to a job: declare it in `databricks.yml`, then call `AppKit.jobs("default").runNow(params)` to trigger a run or iterate `runAndWait` for streaming progress.

Authoring jobs is a workspace task done in Databricks or with [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/). From an AppKit app, you only trigger them. The plugin handles run polling, SSE (Server-Sent Events) streaming, and parameter validation with Zod.

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A Lakeflow Job defined in your workspace. See [Create your first job](https://docs.databricks.com/aws/en/jobs/) for setup.

## Wire the Jobs plugin

Register the plugin in `createApp`. It exposes `AppKit.jobs(...)` to your handlers and reads job IDs from env vars you bind in `app.yaml`.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), jobs()],
});
```

With no explicit `jobs` config, the plugin reads `DATABRICKS_JOB_ID` from the environment and registers it under the `default` key. Multiple named jobs aren't currently supported at deploy time, so bind a single job to `DATABRICKS_JOB_ID`.

## Bind the job

Declare the job as a resource in `databricks.yml`. The Apps platform grants your service principal `CAN_MANAGE_RUN` automatically when you deploy:

```yaml title="databricks.yml"
resources:
  apps:
    my-app:
      resources:
        - name: etl-job
          job:
            id: ${var.etl_job_id}
            permission: CAN_MANAGE_RUN
```

Inject the job ID into `app.yaml` as `DATABRICKS_JOB_ID`, the env the plugin's default job reads:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_JOB_ID
    valueFrom: etl-job
```

See [App configuration](/docs/apps/configuration#resources) for the full resource list and the [Jobs plugin reference](/docs/appkit/v0/plugins/jobs) for the env-var naming rules.

## Trigger from a route handler

Use `runNow` for a one-shot trigger. Wrap the parameters in a Zod schema and the plugin rejects invalid input with a `400` before the SDK call.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";
import { z } from "zod";

const AppKit = await createApp({
  plugins: [
    server(),
    jobs({
      jobs: {
        default: {
          taskType: "notebook",
          params: z.object({
            startDate: z.string(),
            endDate: z.string(),
          }),
        },
      },
    }),
  ],
});

AppKit.server.extend((app) => {
  app.post("/api/etl/run", async (req, res) => {
    const result = await AppKit.jobs("default").runNow({
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    if (!result.ok) return res.status(500).json({ error: result.error });
    res.json({ runId: result.data.run_id });
  });
});
```

All Jobs plugin methods return [`ExecutionResult<T>`](/docs/appkit/v0/api/appkit/TypeAlias.ExecutionResult). Check `result.ok` before reading `result.data`.

Jobs run as the app's **service principal**. The resource binding grants it `CAN_MANAGE_RUN`, so users trigger runs without individual grants, and the Jobs UI attributes each run to the service principal rather than the human user. AppKit does not run jobs on behalf of the signed-in user, so there is no per-user job execution to configure.

## Stream live progress

The plugin exposes a built-in SSE endpoint at `POST /api/jobs/:jobKey/run?stream=true`. Each event delivers `{ status, timestamp, run }` until the run terminates.

For server logic, iterate `runAndWait` directly. It is an async iterator, not a promise:

```typescript
for await (const status of AppKit.jobs("default").runAndWait({
  startDate,
  endDate,
})) {
  // status.status cycles through PENDING, RUNNING, TERMINATED, etc.
}
```

The full hook API and pagination helpers live in the [Jobs plugin reference](/docs/appkit/v0/plugins/jobs).

## Permissions

| Permission       | What it lets your principal do                      |
| ---------------- | --------------------------------------------------- |
| `CAN_VIEW`       | Read the job definition and run history.            |
| `CAN_MANAGE_RUN` | Trigger runs, cancel runs, view run output.         |
| `CAN_MANAGE`     | Modify the job definition. Not used by AppKit apps. |

Set `permission: CAN_MANAGE_RUN` on the job resource binding. That is the least-privilege grant for an app that only triggers existing jobs and reads their state.

## Polling versus webhooks versus system tables

Pick the pattern that fits the run length and your UI:

- **The plugin's built-in run-and-wait endpoint** works well when the user is willing to wait at the page. The browser holds an SSE connection while the plugin polls the SDK every few seconds (default 5s, up to a 10-minute timeout).
- **Webhook notifications** are a good fit when the user closes the tab and you need the result later. Configure `webhook_notifications.on_success` / `on_failure` destinations, write the run state somewhere durable (Lakebase is convenient if your app already uses it), and stream updates to the client when they reload.
- **`system.lakeflow.job_run_timeline`** is queryable through the [Analytics plugin](/docs/appkit/v0/plugins/analytics) once your service principal has `SELECT` on it. Useful for run-history dashboards or cross-job analytics.

## Where to next

See [Pipelines and freshness](/docs/lakehouse/pipelines) for the read side: showing "last updated" timestamps next to data a job populated, or browse the [templates catalog](/templates) for related starting points.
