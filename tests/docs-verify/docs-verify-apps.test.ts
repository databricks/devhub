import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, test, expect, afterAll } from "vitest";
import { cli, scaffoldApp, installAndBuild } from "../helpers/scaffold-app";

const PROFILE = process.env.DATABRICKS_PROFILE;
if (!PROFILE) {
  throw new Error(
    "DATABRICKS_PROFILE env var is required. Set it to a configured CLI profile name.",
  );
}
const TEST_RUN_ID = Date.now().toString(36);
const TEST_DIR = mkdtempSync(resolve(tmpdir(), "devhub-test-apps-"));
const BASE_APP_NAME = `devhub-test-base-${TEST_RUN_ID}`;
const LAKEBASE_APP_NAME = `devhub-test-lkb-${TEST_RUN_ID}`;

const SKIP_CLEANUP = Boolean(process.env.SKIP_CLEANUP);
console.log(`[setup] temp dir: ${TEST_DIR}`);

afterAll(
  () => {
    if (SKIP_CLEANUP) {
      console.log(`[cleanup] SKIP_CLEANUP set, keeping ${TEST_DIR}`);
      return;
    }
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
      console.log(`[cleanup] Removed ${TEST_DIR}`);
    }
  },
  30_000,
);

describe("CLI prerequisites", { timeout: 30_000 }, () => {
  test("databricks CLI is installed and meets minimum version", () => {
    const version = execSync("databricks -v", { encoding: "utf-8" }).trim();
    expect(version).toMatch(/Databricks CLI v0\.\d+\.\d+/);
    const match = version.match(/v0\.(\d+)\.\d+/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(295);
  });

  test("profile is authenticated and valid", () => {
    const output = cli("auth profiles", PROFILE);
    expect(output).toContain(PROFILE);
    expect(output).toContain("YES");
  });

  test("workspace is reachable", () => {
    const output = cli("workspace list /", PROFILE, { timeoutMs: 30_000 });
    expect(output).toBeTruthy();
  });
});

describe("Apps CLI reference", { timeout: 60_000 }, () => {
  test("apps list is accessible", () => {
    const output = cli("apps list", PROFILE, { timeoutMs: 30_000 });
    expect(output).toBeTruthy();
  });

  test("apps init --help shows expected flags", () => {
    const output = execSync("databricks apps init --help", {
      encoding: "utf-8",
    });
    expect(output).toContain("--name");
    expect(output).toContain("--version");
    expect(output).toContain("--features");
    expect(output).toContain("--set");
    expect(output).toContain("--deploy");
    expect(output).toContain("--run");
    expect(output).toContain("--output-dir");
    expect(output).toContain("--template");
  });

  test("apps manifest shows available plugins", () => {
    const output = cli("apps manifest", PROFILE);
    const manifest = JSON.parse(output);
    expect(manifest.plugins).toBeTruthy();

    const pluginNames = Object.keys(manifest.plugins);
    expect(pluginNames).toContain("analytics");
    expect(pluginNames).toContain("lakebase");
    expect(pluginNames).toContain("genie");
    expect(pluginNames).toContain("files");
    expect(pluginNames).toContain("server");
    console.log("[apps] available plugins:", pluginNames.join(", "));
  });
});

describe("Scaffold base app (no features)", { timeout: 120_000 }, () => {
  let appDir: string;

  test("databricks apps init creates a project", () => {
    appDir = scaffoldApp({
      name: BASE_APP_NAME,
      outputDir: TEST_DIR,
      profile: PROFILE,
    });
    expect(existsSync(appDir)).toBe(true);
  });

  test("generated project has expected structure", () => {
    const expectedFiles = [
      "package.json",
      "app.yaml",
      "databricks.yml",
      "server/server.ts",
      "client/src/App.tsx",
      "client/src/main.tsx",
      "client/index.html",
      "tsconfig.json",
    ];
    for (const file of expectedFiles) {
      expect(
        existsSync(resolve(appDir, file)),
        `expected ${file} to exist`,
      ).toBe(true);
    }
    console.log("[apps] all expected files present");
  });

  test("app.yaml has correct command", () => {
    const appYaml = readFileSync(resolve(appDir, "app.yaml"), "utf-8");
    expect(appYaml).toContain("npm");
    expect(appYaml).toContain("start");
    console.log("[apps] app.yaml:", appYaml.trim());
  });

  test("databricks.yml has app name and workspace host", () => {
    const bundleYaml = readFileSync(resolve(appDir, "databricks.yml"), "utf-8");
    expect(bundleYaml).toContain(BASE_APP_NAME);
    expect(bundleYaml).toContain("host:");
    console.log(
      "[apps] databricks.yml (first 500 chars):",
      bundleYaml.slice(0, 500),
    );
  });

  test("server/server.ts imports createApp and server", () => {
    const serverTs = readFileSync(
      resolve(appDir, "server/server.ts"),
      "utf-8",
    );
    expect(serverTs).toContain("createApp");
    expect(serverTs).toContain("server");
    console.log("[apps] server.ts:", serverTs.trim());
  });

  test("npm install and build succeed", () => {
    installAndBuild(appDir);
    expect(existsSync(resolve(appDir, "node_modules"))).toBe(true);
    expect(existsSync(resolve(appDir, "dist"))).toBe(true);
    expect(existsSync(resolve(appDir, "client/dist"))).toBe(true);
  });
});

describe("Scaffold app with Lakebase feature", { timeout: 120_000 }, () => {
  let appDir: string;

  test("databricks apps init --features=lakebase creates a project", () => {
    appDir = scaffoldApp({
      name: LAKEBASE_APP_NAME,
      outputDir: TEST_DIR,
      profile: PROFILE,
      features: "lakebase",
      setFlags: [
        "lakebase.postgres.branch=projects/fake/branches/production",
        "lakebase.postgres.database=projects/fake/branches/production/databases/databricks_postgres",
        "lakebase.postgres.databaseName=databricks_postgres",
        "lakebase.postgres.endpointPath=projects/fake/branches/production/endpoints/primary",
        "lakebase.postgres.host=localhost",
        "lakebase.postgres.port=5432",
        "lakebase.postgres.sslmode=require",
      ],
    });
    expect(existsSync(appDir)).toBe(true);
  });

  test("generated project has Lakebase routes", () => {
    const todoRoutes = readFileSync(
      resolve(appDir, "server/routes/lakebase/todo-routes.ts"),
      "utf-8",
    );
    expect(todoRoutes).toContain("appkit.lakebase.query");
    expect(todoRoutes).toContain("/api/lakebase/todos");
    console.log(
      "[apps+lakebase] todo-routes.ts exists with lakebase query calls",
    );
  });

  test("server.ts uses autoStart: false with lakebase", () => {
    const serverTs = readFileSync(
      resolve(appDir, "server/server.ts"),
      "utf-8",
    );
    expect(serverTs).toContain("autoStart: false");
    expect(serverTs).toContain("lakebase");
    expect(serverTs).toContain("setupSampleLakebaseRoutes");
    console.log("[apps+lakebase] server.ts:", serverTs.trim());
  });

  test("app.yaml includes LAKEBASE_ENDPOINT env var", () => {
    const appYaml = readFileSync(resolve(appDir, "app.yaml"), "utf-8");
    expect(appYaml).toContain("LAKEBASE_ENDPOINT");
    console.log("[apps+lakebase] app.yaml:", appYaml.trim());
  });

  test("databricks.yml includes postgres resource", () => {
    const bundleYaml = readFileSync(
      resolve(appDir, "databricks.yml"),
      "utf-8",
    );
    expect(bundleYaml).toContain("postgres");
    console.log(
      "[apps+lakebase] databricks.yml (first 800 chars):",
      bundleYaml.slice(0, 800),
    );
  });

  test("client has Lakebase page", () => {
    const content = readFileSync(
      resolve(appDir, "client/src/pages/lakebase/LakebasePage.tsx"),
      "utf-8",
    );
    expect(content).toContain("/api/lakebase/todos");
    console.log("[apps+lakebase] LakebasePage.tsx exists with API calls");
  });

  test("npm install and build succeed", () => {
    installAndBuild(appDir);
    expect(existsSync(resolve(appDir, "node_modules"))).toBe(true);
    expect(existsSync(resolve(appDir, "dist"))).toBe(true);
    expect(existsSync(resolve(appDir, "client/dist"))).toBe(true);
  });
});
