import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { run, cliJson } from "../helpers/scaffold-app";

const sleepSync = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const PROFILE = process.env.DATABRICKS_PROFILE;
if (!PROFILE) {
  throw new Error(
    "DATABRICKS_PROFILE env var is required. Set it to a configured CLI profile name.",
  );
}

const TEST_PREFIX = "devhub-bundle";
const TEST_RUN_ID = Date.now().toString(36);
const PROJECT_ID = `${TEST_PREFIX}-${TEST_RUN_ID}`;
const FIXTURE_DIR = resolve(__dirname, "../fixtures/lakebase-bundle");
const SKIP_CLEANUP = Boolean(process.env.SKIP_CLEANUP);

function pollOperation(operationName: string, maxAttempts = 60, delayS = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const op = cliJson<{ done: boolean; name: string }>(
      `postgres get-operation ${operationName}`,
      PROFILE!,
    );
    if (op.done) {
      console.log(
        `[bundle] operation done after ~${i * delayS}s: ${operationName}`,
      );
      return op;
    }
    sleepSync(delayS * 1000);
  }
  throw new Error(
    `Operation ${operationName} did not complete in ${maxAttempts * delayS}s`,
  );
}

describe("Lakebase bundle workflow", { timeout: 600_000 }, () => {
  let bundleDir: string;

  beforeAll(() => {
    bundleDir = mkdtempSync(join(tmpdir(), "devhub-lakebase-bundle-"));
    cpSync(FIXTURE_DIR, bundleDir, { recursive: true });

    const ymlPath = join(bundleDir, "databricks.yml");
    const content = readFileSync(ymlPath, "utf-8");
    writeFileSync(
      ymlPath,
      content
        .replace("BUNDLE_NAME_PLACEHOLDER", PROJECT_ID)
        .replace("PLACEHOLDER", PROJECT_ID),
    );

    console.log("[bundle] fixture copied to:", bundleDir);
    console.log("[bundle] project ID:", PROJECT_ID);
  });

  afterAll(() => {
    if (SKIP_CLEANUP) {
      console.log(`[cleanup] SKIP_CLEANUP set, keeping project ${PROJECT_ID}`);
      return;
    }

    const maxRetries = 6;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(
          `[cleanup] Deleting project ${PROJECT_ID} (attempt ${attempt + 1})`,
        );
        const deleteOutput = cliJson<{ done: boolean; name: string }>(
          `postgres delete-project projects/${PROJECT_ID} --no-wait`,
          PROFILE!,
        );
        if (!deleteOutput.done) {
          pollOperation(deleteOutput.name);
        }
        console.log(`[cleanup] Project ${PROJECT_ID} deleted`);
        break;
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes("reconciliation") && attempt < maxRetries - 1) {
          console.warn(
            `[cleanup] reconciliation in progress, retrying in 10s...`,
          );
          sleepSync(10_000);
          continue;
        }
        console.warn("[cleanup] failed:", msg);
        break;
      }
    }

    try {
      rmSync(bundleDir, { recursive: true, force: true });
    } catch {
      // best-effort temp dir cleanup
    }
  }, 600_000);

  test("bundle validate succeeds", () => {
    const output = run(`databricks bundle validate --profile ${PROFILE}`, {
      cwd: bundleDir,
      timeoutMs: 60_000,
    });
    expect(output).toBeTruthy();
    console.log("[bundle] validate passed");
  });

  // Retry guard: we've occasionally seen Lakebase ACL propagation lag after
  // project creation, causing the branch create to fail with:
  //   "… not authorized … assign the user … 'Can Manage' for Database project …"
  // A retry is safe — Terraform picks up where it left off. This doesn't
  // always reproduce; the retry is here as a precaution.
  test("bundle deploy creates resources", () => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const output = run(`databricks bundle deploy --profile ${PROFILE}`, {
          cwd: bundleDir,
          timeoutMs: 480_000,
        });
        expect(output).toBeDefined();
        console.log("[bundle] deploy completed");
        return;
      } catch (e) {
        const msg = (e as Error).message;
        if (attempt < maxRetries && msg.includes("not authorized")) {
          console.warn(
            `[bundle] deploy attempt ${attempt} hit permissions race, retrying in 15s...`,
          );
          sleepSync(15_000);
          continue;
        }
        throw e;
      }
    }
  });

  test("verify project settings", () => {
    const project = cliJson<{
      status: {
        display_name: string;
        pg_version: number;
        history_retention_duration: string;
        default_endpoint_settings: {
          autoscaling_limit_min_cu: number;
          autoscaling_limit_max_cu: number;
          suspend_timeout_duration: string;
          pg_settings?: Record<string, string>;
        };
      };
    }>(`postgres get-project projects/${PROJECT_ID}`, PROFILE!);

    expect(project.status.display_name).toBe("DevHub Bundle Test");
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
    expect(
      project.status.default_endpoint_settings.pg_settings
        ?.log_min_duration_statement,
    ).toBe("1000");
    console.log("[bundle] project settings verified");
  });

  test("verify dev branch exists", () => {
    const branches = cliJson<
      Array<{ name: string; status: { is_protected: boolean } }>
    >(`postgres list-branches projects/${PROJECT_ID}`, PROFILE!);

    const devBranch = branches.find((b) => b.name.includes("/branches/dev"));
    expect(devBranch, "dev branch should exist").toBeTruthy();
    expect(devBranch!.status.is_protected).toBe(false);
    console.log("[bundle] dev branch verified:", devBranch!.name);
  });

  test("verify dev endpoint inherits project defaults", () => {
    const endpoints = cliJson<
      Array<{
        name: string;
        status: {
          endpoint_type: string;
          autoscaling_limit_min_cu: number;
          autoscaling_limit_max_cu: number;
          suspend_timeout_duration?: string;
        };
      }>
    >(`postgres list-endpoints projects/${PROJECT_ID}/branches/dev`, PROFILE!);

    expect(endpoints.length).toBeGreaterThan(0);
    const rw = endpoints.find((e) => e.name.includes("/endpoints/primary"));
    expect(rw, "auto-created read-write endpoint should exist").toBeTruthy();
    expect(rw!.status.endpoint_type).toBe("ENDPOINT_TYPE_READ_WRITE");
    expect(rw!.status.autoscaling_limit_min_cu).toBe(0.5);
    expect(rw!.status.autoscaling_limit_max_cu).toBe(1.0);
    expect(rw!.status.suspend_timeout_duration).toBe("300s");
    console.log("[bundle] read-write endpoint inherited defaults:", rw!.name);
  });

  test("verify read-only endpoint was created by bundle", () => {
    const endpoints = cliJson<
      Array<{
        name: string;
        status: {
          endpoint_type: string;
          autoscaling_limit_min_cu: number;
          autoscaling_limit_max_cu: number;
        };
      }>
    >(`postgres list-endpoints projects/${PROJECT_ID}/branches/dev`, PROFILE!);

    const replica = endpoints.find((e) =>
      e.name.includes("/endpoints/replica"),
    );
    expect(replica, "read-only replica endpoint should exist").toBeTruthy();
    expect(replica!.status.endpoint_type).toBe("ENDPOINT_TYPE_READ_ONLY");
    expect(replica!.status.autoscaling_limit_min_cu).toBe(0.5);
    expect(replica!.status.autoscaling_limit_max_cu).toBe(0.5);
    console.log("[bundle] read-only endpoint verified:", replica!.name);
  });
});
