import { execSync } from "node:child_process";
import { describe, test, expect, afterAll } from "vitest";
import { run, cli, cliJson } from "../helpers/scaffold-app";

const sleepSync = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const PROFILE = process.env.DATABRICKS_PROFILE as string;
if (!PROFILE) {
  throw new Error(
    "DATABRICKS_PROFILE env var is required. Set it to a configured CLI profile name.",
  );
}
const TEST_PREFIX = "devhub-test";
const TEST_RUN_ID = Date.now().toString(36);
const PROJECT_ID = `${TEST_PREFIX}-${TEST_RUN_ID}`;

function retry<T>(
  fn: () => T,
  {
    attempts = 3,
    delayMs = 5_000,
    retryIf = () => true,
  }: {
    attempts?: number;
    delayMs?: number;
    retryIf?: (err: Error) => boolean;
  } = {},
): T {
  for (let i = 0; i < attempts; i++) {
    try {
      return fn();
    } catch (e) {
      const err = e as Error;
      if (i === attempts - 1 || !retryIf(err)) throw err;
      console.warn(
        `[retry] attempt ${i + 1}/${attempts} failed: ${err.message}`,
      );
      sleepSync(delayMs);
    }
  }
  throw new Error("unreachable");
}

const isTransient = (err: Error) =>
  err.message.includes("not authorized") ||
  err.message.includes("TEMPORARILY_UNAVAILABLE");

function pollOperation(operationName: string, maxAttempts = 60, delayS = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const op = cliJson<{ done: boolean; name: string }>(
      `postgres get-operation ${operationName}`,
      PROFILE,
    );
    if (op.done) {
      console.log(
        `[lakebase] operation done after ~${i * delayS}s: ${operationName}`,
      );
      return op;
    }
    sleepSync(delayS * 1000);
  }
  throw new Error(
    `Operation ${operationName} did not complete in ${maxAttempts * delayS}s`,
  );
}

const SKIP_CLEANUP = Boolean(process.env.SKIP_CLEANUP);
let createOperationName: string;

afterAll(() => {
  if (SKIP_CLEANUP) {
    console.log(`[cleanup] SKIP_CLEANUP set, keeping project ${PROJECT_ID}`);
    return;
  }

  try {
    if (createOperationName) {
      pollOperation(createOperationName);
    }
    console.log(`[cleanup] Deleting project ${PROJECT_ID}`);
    const deleteOutput = cliJson<{ done: boolean; name: string }>(
      `postgres delete-project projects/${PROJECT_ID} --no-wait`,
      PROFILE,
    );
    if (!deleteOutput.done) {
      pollOperation(deleteOutput.name);
    }
    console.log(`[cleanup] Project ${PROJECT_ID} deleted`);
  } catch (e) {
    console.warn("[cleanup] failed:", (e as Error).message);
  }
}, 600_000);

describe("Lakebase workflow", { timeout: 600_000 }, () => {
  let branchName: string;
  let endpointName: string;

  test("create a Lakebase project", () => {
    const spec = JSON.stringify({
      spec: {
        display_name: `DevHub Test ${PROJECT_ID}`,
        pg_version: 17,
        history_retention_duration: "172800s",
        default_endpoint_settings: {
          autoscaling_limit_min_cu: 0.5,
          autoscaling_limit_max_cu: 1.0,
          suspend_timeout_duration: "300s",
        },
      },
    });
    const op = cliJson<{ done: boolean; name: string }>(
      `postgres create-project ${PROJECT_ID} --no-wait --json '${spec}'`,
      PROFILE,
      { timeoutMs: 60_000 },
    );
    expect(op.name).toBeTruthy();
    createOperationName = op.name;
    console.log("[lakebase] create-project operation:", op.name);
    console.log("[lakebase] done immediately:", op.done);
  });

  test("poll create operation via get-operation", () => {
    pollOperation(createOperationName);
  });

  test("verify project spec was applied", () => {
    const project = cliJson<{
      status: {
        display_name: string;
        pg_version: number;
        history_retention_duration: string;
        default_endpoint_settings: {
          autoscaling_limit_min_cu: number;
          autoscaling_limit_max_cu: number;
          suspend_timeout_duration: string;
        };
      };
    }>(`postgres get-project projects/${PROJECT_ID}`, PROFILE);

    expect(project.status.display_name).toBe(`DevHub Test ${PROJECT_ID}`);
    expect(project.status.pg_version).toBe(17);
    expect(project.status.history_retention_duration).toBe("172800s");
    expect(
      project.status.default_endpoint_settings.autoscaling_limit_min_cu,
    ).toBe(0.5);
    expect(
      project.status.default_endpoint_settings.autoscaling_limit_max_cu,
    ).toBe(1.0);
    expect(
      project.status.default_endpoint_settings.suspend_timeout_duration,
    ).toBe("300s");
    console.log(
      "[lakebase] project spec verified:",
      JSON.stringify(project.status),
    );
  });

  test("list branches for the project", () => {
    const branches = cliJson<Array<{ name: string }>>(
      `postgres list-branches projects/${PROJECT_ID}`,
      PROFILE,
    );
    expect(branches.length).toBeGreaterThan(0);

    branchName = branches[0].name;
    expect(branchName).toContain("production");
    console.log("[lakebase] branch name:", branchName);
  });

  test("list endpoints for the production branch", () => {
    const endpoints = cliJson<
      Array<{ name: string; status: { hosts: { host: string } } }>
    >(`postgres list-endpoints ${branchName}`, PROFILE);
    expect(endpoints.length).toBeGreaterThan(0);

    endpointName = endpoints[0].name;
    expect(endpoints[0].status?.hosts?.host).toBeTruthy();
    console.log("[lakebase] endpoint name:", endpointName);
    console.log("[lakebase] endpoint host:", endpoints[0].status.hosts.host);
  });

  test("list databases for the production branch", () => {
    const databases = cliJson<
      Array<{ name: string; status: { postgres_database: string } }>
    >(`postgres list-databases ${branchName}`, PROFILE);
    expect(databases.length).toBeGreaterThan(0);

    expect(databases[0].name).toContain(`projects/${PROJECT_ID}`);
    expect(databases[0].name).toContain("databases/");
    expect(databases[0].status?.postgres_database).toBeTruthy();
    console.log("[lakebase] database resource path:", databases[0].name);
    console.log(
      "[lakebase] postgres database name:",
      databases[0].status.postgres_database,
    );
  });

  test("list-branches with --page-size 1", () => {
    const output = run(
      `databricks postgres list-branches projects/${PROJECT_ID} --page-size 1 -o json --profile ${PROFILE}`,
      { timeoutMs: 30_000 },
    );
    const parsed = JSON.parse(output);
    expect(parsed.length).toBeLessThanOrEqual(1);
  });

  test("list-endpoints with --page-size 1", () => {
    const output = run(
      `databricks postgres list-endpoints ${branchName} --page-size 1 -o json --profile ${PROFILE}`,
      { timeoutMs: 30_000 },
    );
    const parsed = JSON.parse(output);
    expect(parsed.length).toBeLessThanOrEqual(1);
  });

  test("list-databases with --page-size 1", () => {
    const output = run(
      `databricks postgres list-databases ${branchName} --page-size 1 -o json --profile ${PROFILE}`,
      { timeoutMs: 30_000 },
    );
    const parsed = JSON.parse(output);
    expect(parsed.length).toBeLessThanOrEqual(1);
  });

  test("update endpoint: set pg_settings (log slow queries)", () => {
    const spec = JSON.stringify({
      spec: {
        settings: {
          pg_settings: {
            log_min_duration_statement: "1000",
          },
        },
      },
    });
    retry(
      () =>
        cli(
          `postgres update-endpoint ${endpointName} "spec.settings" --json '${spec}'`,
          PROFILE,
          { timeoutMs: 120_000 },
        ),
      { retryIf: isTransient },
    );
    console.log("[lakebase] update-endpoint pg_settings done");
  });

  test("update endpoint: set autoscaling 0.5-1.0 CU", () => {
    const spec = JSON.stringify({
      spec: {
        autoscaling_limit_min_cu: 0.5,
        autoscaling_limit_max_cu: 1.0,
      },
    });
    retry(
      () =>
        cli(
          `postgres update-endpoint ${endpointName} "spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu" --json '${spec}'`,
          PROFILE,
          { timeoutMs: 120_000 },
        ),
      { retryIf: isTransient },
    );
    console.log("[lakebase] update-endpoint autoscaling 0.5-1.0 CU done");
  });

  test("get endpoint: verify type, autoscaling, and settings", () => {
    const endpoint = cliJson<{
      name: string;
      status: {
        endpoint_type: string;
        autoscaling_limit_min_cu: number;
        autoscaling_limit_max_cu: number;
        current_state: string;
        settings: {
          pg_settings?: Record<string, string>;
        };
      };
    }>(`postgres get-endpoint ${endpointName}`, PROFILE);

    console.log("[lakebase] endpoint status:", JSON.stringify(endpoint.status));

    expect(endpoint.status.endpoint_type).toBe("ENDPOINT_TYPE_READ_WRITE");
    expect(endpoint.status.autoscaling_limit_min_cu).toBe(0.5);
    expect(endpoint.status.autoscaling_limit_max_cu).toBe(1.0);
    expect(endpoint.status.current_state).toBe("ACTIVE");
    expect(
      endpoint.status.settings.pg_settings?.log_min_duration_statement,
    ).toBe("1000");
  });

  test("generate database credential (positional arg, not flag)", () => {
    const output = cli(
      `postgres generate-database-credential ${endpointName}`,
      PROFILE,
    );
    expect(output).toBeTruthy();
    console.log(
      "[lakebase] credential generated (has password):",
      output.includes("password"),
    );
  });

  test("update project: set default_endpoint_settings with scale-to-zero", () => {
    const spec = JSON.stringify({
      spec: {
        default_endpoint_settings: {
          autoscaling_limit_min_cu: 0.5,
          autoscaling_limit_max_cu: 1.0,
          suspend_timeout_duration: "300s",
        },
      },
    });
    const project = cliJson<{
      status: {
        default_endpoint_settings: {
          autoscaling_limit_min_cu: number;
          autoscaling_limit_max_cu: number;
          suspend_timeout_duration: string;
        };
      };
    }>(
      `postgres update-project projects/${PROJECT_ID} "spec.default_endpoint_settings" --json '${spec}'`,
      PROFILE,
      { timeoutMs: 120_000 },
    );
    expect(
      project.status.default_endpoint_settings.suspend_timeout_duration,
    ).toBe("300s");
    expect(
      project.status.default_endpoint_settings.autoscaling_limit_min_cu,
    ).toBe(0.5);
    expect(
      project.status.default_endpoint_settings.autoscaling_limit_max_cu,
    ).toBe(1.0);
    console.log("[lakebase] project default_endpoint_settings updated");
  });

  test("create branch: new endpoint inherits project defaults", () => {
    const branch = cliJson<{ name: string }>(
      `postgres create-branch projects/${PROJECT_ID} test-defaults --json '${JSON.stringify(
        {
          spec: {
            source_branch: `projects/${PROJECT_ID}/branches/production`,
            no_expiry: true,
          },
        },
      )}'`,
      PROFILE,
      { timeoutMs: 60_000 },
    );
    console.log("[lakebase] created branch:", branch.name);

    const endpoints = cliJson<
      Array<{
        name: string;
        status: {
          autoscaling_limit_min_cu: number;
          autoscaling_limit_max_cu: number;
          suspend_timeout_duration?: string;
        };
      }>
    >(`postgres list-endpoints ${branch.name}`, PROFILE);

    expect(endpoints.length).toBeGreaterThan(0);
    const ep = endpoints[0];
    expect(ep.status.autoscaling_limit_min_cu).toBe(0.5);
    expect(ep.status.autoscaling_limit_max_cu).toBe(1.0);
    expect(ep.status.suspend_timeout_duration).toBe("300s");
    console.log(
      "[lakebase] new branch endpoint inherited defaults:",
      JSON.stringify(ep.status),
    );
  });

  test("connect with databricks psql (CI-style flags)", () => {
    const output = retry(
      () =>
        run(
          `databricks psql --project ${PROJECT_ID} --branch production --endpoint primary --profile ${PROFILE} -- -c "SELECT 1 AS connected"`,
          { timeoutMs: 60_000 },
        ),
      { retryIf: isTransient },
    );
    expect(output).toContain("connected");
    console.log("[lakebase] psql output:", output.trim());
  });

  test("update branch: set is_protected", () => {
    retry(
      () =>
        cli(
          `postgres update-branch ${branchName} spec.is_protected --json '{"spec":{"is_protected":true}}'`,
          PROFILE,
          { timeoutMs: 120_000 },
        ),
      { retryIf: isTransient },
    );

    const branch = cliJson<{ status: { is_protected: boolean } }>(
      `postgres get-branch ${branchName}`,
      PROFILE,
    );
    expect(branch.status.is_protected).toBe(true);
    console.log("[lakebase] branch is_protected:", branch.status.is_protected);

    retry(
      () =>
        cli(
          `postgres update-branch ${branchName} spec.is_protected --json '{"spec":{"is_protected":false}}'`,
          PROFILE,
          { timeoutMs: 120_000 },
        ),
      { retryIf: isTransient },
    );
    console.log("[lakebase] branch is_protected reset to false");
  });

  test("delete branch explicitly", () => {
    const branchId = `del-test-${TEST_RUN_ID}`;
    const branch = cliJson<{ name: string }>(
      `postgres create-branch projects/${PROJECT_ID} ${branchId} --json '${JSON.stringify(
        {
          spec: {
            source_branch: `projects/${PROJECT_ID}/branches/production`,
            no_expiry: true,
          },
        },
      )}'`,
      PROFILE,
      { timeoutMs: 60_000 },
    );
    console.log("[lakebase] created ephemeral branch:", branch.name);

    retry(
      () =>
        cli(`postgres delete-branch ${branch.name}`, PROFILE, {
          timeoutMs: 120_000,
        }),
      {
        attempts: 6,
        delayMs: 10_000,
        retryIf: (err) =>
          err.message.includes("reconciliation") || isTransient(err),
      },
    );
    console.log("[lakebase] deleted branch:", branch.name);
  });

  test("create read-only endpoint", () => {
    const ep = cliJson<{
      name: string;
      status: { endpoint_type: string; hosts: { read_only_host: string } };
    }>(
      `postgres create-endpoint ${branchName} replica --json '${JSON.stringify({
        spec: {
          endpoint_type: "ENDPOINT_TYPE_READ_ONLY",
          autoscaling_limit_min_cu: 0.5,
          autoscaling_limit_max_cu: 0.5,
        },
      })}'`,
      PROFILE,
      { timeoutMs: 120_000 },
    );
    expect(ep.status.endpoint_type).toBe("ENDPOINT_TYPE_READ_ONLY");
    expect(ep.status.hosts.read_only_host).toBeTruthy();
    console.log("[lakebase] read-only endpoint:", ep.name);
    console.log("[lakebase] read-only host:", ep.status.hosts.read_only_host);

    retry(
      () =>
        cli(`postgres delete-endpoint ${ep.name}`, PROFILE, {
          timeoutMs: 120_000,
        }),
      {
        attempts: 6,
        delayMs: 10_000,
        retryIf: (err) =>
          err.message.includes("reconciliation") || isTransient(err),
      },
    );
    console.log("[lakebase] deleted read-only endpoint");
  });

  test("update endpoint: set scale-to-zero directly (feature-gated)", () => {
    const spec = JSON.stringify({
      spec: { suspend_timeout_duration: "300s" },
    });
    try {
      cli(
        `postgres update-endpoint ${endpointName} "spec.suspend_timeout_duration" --json '${spec}'`,
        PROFILE,
        { timeoutMs: 120_000 },
      );
      console.log("[lakebase] update-endpoint suspend_timeout_duration done");
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("Unknown field path")) {
        console.warn(
          "[lakebase] suspend_timeout_duration via update-endpoint not supported on this workspace (feature-gated, skipping)",
        );
        return;
      }
      throw e;
    }

    const endpoint = cliJson<{
      status: { suspend_timeout_duration?: string };
    }>(`postgres get-endpoint ${endpointName}`, PROFILE);
    expect(endpoint.status.suspend_timeout_duration).toBe("300s");
    console.log(
      "[lakebase] suspend_timeout_duration verified:",
      endpoint.status.suspend_timeout_duration,
    );
  });
});

describe("Lakebase CLI reference", () => {
  test("postgres subcommands match what we document", () => {
    const output = execSync("databricks postgres --help", {
      encoding: "utf-8",
    });
    const expectedCommands = [
      "create-project",
      "create-branch",
      "create-endpoint",
      "delete-project",
      "delete-branch",
      "delete-endpoint",
      "get-project",
      "get-branch",
      "get-endpoint",
      "get-operation",
      "list-projects",
      "list-branches",
      "list-endpoints",
      "generate-database-credential",
      "update-project",
      "update-branch",
      "update-endpoint",
    ];
    for (const cmd of expectedCommands) {
      expect(output).toContain(cmd);
    }
  });

  test("create-project takes PROJECT_ID as positional arg", () => {
    const output = execSync("databricks postgres create-project --help", {
      encoding: "utf-8",
    });
    expect(output).toContain("PROJECT_ID");
    expect(output).toContain("--no-wait");
  });

  test("generate-database-credential takes ENDPOINT as positional arg", () => {
    const output = execSync(
      "databricks postgres generate-database-credential --help",
      { encoding: "utf-8" },
    );
    expect(output).toContain("ENDPOINT");
  });

  test("get-operation takes NAME as positional arg", () => {
    const output = execSync("databricks postgres get-operation --help", {
      encoding: "utf-8",
    });
    expect(output).toContain("NAME");
  });

  test("psql command exists and supports --project flag", () => {
    const output = execSync("databricks psql --help", {
      encoding: "utf-8",
    });
    expect(output).toContain("--project");
    expect(output).toContain("--branch");
    expect(output).toContain("--endpoint");
    expect(output).toContain("PSQL_ARGS");
  });
});
