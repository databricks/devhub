import { createLakebasePool } from "@databricks/lakebase";
import { WorkspaceClient } from "@databricks/sdk-experimental";
import { z } from "zod";

import { type FeedbackInsert } from "./feedback";

const feedbackEnvironmentSchema = z.object({
  DATABRICKS_HOST: z.url(),
  DATABRICKS_CLIENT_ID: z.string().min(1),
  DATABRICKS_CLIENT_SECRET: z.string().min(1),
  LAKEBASE_ENDPOINT: z
    .string()
    .regex(
      /^projects\/[a-z0-9-]+\/branches\/[a-z0-9-]+\/endpoints\/[a-z0-9-]+$/,
    ),
  LAKEBASE_HOST: z.string().min(1),
});

let pool: ReturnType<typeof createLakebasePool> | undefined;

function getFeedbackEnvironment() {
  const result = feedbackEnvironmentSchema.safeParse(process.env);
  if (result.success) return result.data;

  const invalidVariables = result.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");
  throw new Error(`Invalid feedback endpoint environment: ${invalidVariables}`);
}

function getPool() {
  if (pool) return pool;

  const environment = getFeedbackEnvironment();
  pool = createLakebasePool({
    host: environment.LAKEBASE_HOST,
    database: "databricks_postgres",
    endpoint: environment.LAKEBASE_ENDPOINT,
    user: environment.DATABRICKS_CLIENT_ID,
    workspaceClient: new WorkspaceClient({
      host: environment.DATABRICKS_HOST,
      clientId: environment.DATABRICKS_CLIENT_ID,
      clientSecret: environment.DATABRICKS_CLIENT_SECRET,
      authType: "oauth-m2m",
      env: { NODE_ENV: process.env.NODE_ENV },
    }),
    max: 2,
    idleTimeoutMillis: 30_000,
    sslMode: "require",
    telemetry: false,
    logger: { error: false },
  });
  return pool;
}

export async function insertFeedback(input: FeedbackInsert): Promise<void> {
  const environment = getFeedbackEnvironment();
  await getPool().query(
    `INSERT INTO devhub.feedback
      (feedback, path, user_agent, raw)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [
      input.feedback,
      input.path ?? null,
      input.userAgent ?? null,
      JSON.stringify(input.raw),
    ],
  );
}
