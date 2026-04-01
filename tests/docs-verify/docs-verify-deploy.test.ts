import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, test, expect, afterAll } from "vitest";
import {
  cli,
  cliJson,
  scaffoldApp,
  installAndBuild,
} from "../helpers/scaffold-app";

const PROFILE = process.env.DATABRICKS_PROFILE;
if (!PROFILE) {
  throw new Error(
    "DATABRICKS_PROFILE env var is required. Set it to a configured CLI profile name.",
  );
}
const TEST_DIR = mkdtempSync(resolve(tmpdir(), "devhub-test-deploy-"));
const APP_NAME = `devhub-dply-${Date.now().toString(36)}`;
const appDir = resolve(TEST_DIR, APP_NAME);

const SKIP_CLEANUP = Boolean(process.env.SKIP_CLEANUP);
console.log(`[setup] temp dir: ${TEST_DIR}`);

afterAll(
  () => {
    if (SKIP_CLEANUP) {
      console.log(
        `[cleanup] SKIP_CLEANUP set, keeping app ${APP_NAME} and ${TEST_DIR}`,
      );
      return;
    }

    try {
      console.log(`[cleanup] Deleting app ${APP_NAME} from workspace`);
      cli("apps delete --auto-approve", PROFILE, {
        cwd: appDir,
        timeoutMs: 300_000,
      });
      console.log(`[cleanup] App ${APP_NAME} deleted from workspace`);
    } catch (e) {
      console.warn(
        "[cleanup] workspace delete failed:",
        (e as Error).message,
      );
      try {
        cli(`apps delete ${APP_NAME}`, PROFILE, { timeoutMs: 60_000 });
        console.log(`[cleanup] App ${APP_NAME} deleted via direct API`);
      } catch (e2) {
        console.warn(
          "[cleanup] direct API delete also failed:",
          (e2 as Error).message,
        );
      }
    }

    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
      console.log(`[cleanup] Removed ${TEST_DIR}`);
    }
  },
  600_000,
);

describe("Scaffold and build", { timeout: 180_000 }, () => {
  test("scaffold, install, and build", () => {
    scaffoldApp({
      name: APP_NAME,
      outputDir: TEST_DIR,
      profile: PROFILE,
    });
    installAndBuild(appDir);
    expect(existsSync(resolve(appDir, "dist"))).toBe(true);
    expect(existsSync(resolve(appDir, "client/dist"))).toBe(true);
  });
});

describe("Deploy to workspace", { timeout: 1_200_000 }, () => {
  test("databricks apps deploy succeeds", () => {
    cli("apps deploy --skip-validation", PROFILE, {
      cwd: appDir,
      timeoutMs: 1_200_000,
    });
  });

  test("databricks apps get shows app status", () => {
    const app = cliJson<{
      name: string;
      url: string;
      compute_status: { state: string };
      active_deployment: { status: { state: string } };
    }>(`apps get ${APP_NAME}`, PROFILE);

    console.log("[deploy] app name:", app.name);
    console.log("[deploy] app url:", app.url);
    console.log("[deploy] compute state:", app.compute_status?.state);
    console.log(
      "[deploy] deployment state:",
      app.active_deployment?.status?.state,
    );

    expect(app.name).toBe(APP_NAME);
    expect(app.url).toBeTruthy();
  });

  test("databricks apps logs returns output", () => {
    const output = cli(`apps logs ${APP_NAME} --tail-lines 20`, PROFILE, {
      timeoutMs: 30_000,
    });
    console.log("[deploy] logs (last 300 chars):", output.slice(-300));
    expect(output).toBeTruthy();
  });
});
