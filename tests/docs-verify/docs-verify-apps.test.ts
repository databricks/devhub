import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { afterAll, describe, expect, test } from "vitest";

import {
  cli,
  installAndBuild,
  packageManagerOf,
  run,
  scaffoldApp,
} from "../helpers/scaffold-app";

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
const NPM_APP_NAME = `devhub-test-npm-${TEST_RUN_ID}`;

const SKIP_CLEANUP = Boolean(process.env.SKIP_CLEANUP);
console.log(`[setup] temp dir: ${TEST_DIR}`);

afterAll(() => {
  if (SKIP_CLEANUP) {
    console.log(`[cleanup] SKIP_CLEANUP set, keeping ${TEST_DIR}`);
    return;
  }
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
    console.log(`[cleanup] Removed ${TEST_DIR}`);
  }
}, 30_000);

describe("CLI prerequisites", { timeout: 30_000 }, () => {
  test("databricks CLI is installed and meets minimum version", () => {
    const version = execSync("databricks -v", { encoding: "utf-8" }).trim();
    expect(version).toMatch(/Databricks CLI v\d+\.\d+\.\d+/);
    const match = version.match(/v(\d+)\.(\d+)\.\d+/);
    expect(match).not.toBeNull();
    const major = Number(match![1]);
    const minor = Number(match![2]);
    // Minimum: v1.0.0, or the pre-1.0 floor of v0.295.0
    expect(major >= 1 || minor >= 295).toBe(true);
  });

  test("pnpm is on PATH (the default AppKit template uses it)", () => {
    expect(run("pnpm --version")).toMatch(/^\d+\.\d+\.\d+/);
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
    expect(output).toContain("--auth-mode");
    expect(output).toContain("--package-manager");
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

describe("Scaffold base app (no features)", { timeout: 300_000 }, () => {
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
    const manager = packageManagerOf(appDir);
    expect(appYaml).toContain(`['${manager}', 'run', 'start']`);
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
    const serverTs = readFileSync(resolve(appDir, "server/server.ts"), "utf-8");
    expect(serverTs).toContain("createApp");
    expect(serverTs).toContain("server");
    console.log("[apps] server.ts:", serverTs.trim());
  });

  test("install and build succeed", () => {
    installAndBuild(appDir);
    expect(existsSync(resolve(appDir, "node_modules"))).toBe(true);
    expect(existsSync(resolve(appDir, "dist"))).toBe(true);
    expect(existsSync(resolve(appDir, "client/dist"))).toBe(true);
  });

  test("default scaffold uses pnpm", () => {
    expect(packageManagerOf(appDir)).toBe("pnpm");
  });

  test("pnpm run sync writes appkit.plugins.json", () => {
    const manifestPath = resolve(appDir, "appkit.plugins.json");
    rmSync(manifestPath, { force: true });
    run("pnpm run sync", { cwd: appDir, timeoutMs: 60_000 });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
      plugins: Record<string, unknown>;
    };
    expect(Object.keys(manifest.plugins)).toContain("server");
  });

  test("pnpm exec appkit docs prints the docs index", () => {
    const output = run("pnpm exec appkit docs", {
      cwd: appDir,
      timeoutMs: 60_000,
    });
    expect(output).toContain("./docs/plugins/lakebase.md");
  });

  test("pnpm exec appkit docs opens a doc by path", () => {
    const output = run("pnpm exec appkit docs ./docs/plugins/lakebase.md", {
      cwd: appDir,
      timeoutMs: 60_000,
    });
    expect(output).toContain("Lakebase plugin");
  });
});

describe("Scaffold app with Lakebase feature", { timeout: 300_000 }, () => {
  let appDir: string;

  test("databricks apps init --features=lakebase creates a project", () => {
    appDir = scaffoldApp({
      name: LAKEBASE_APP_NAME,
      outputDir: TEST_DIR,
      profile: PROFILE,
      features: "lakebase",
      setFlags: [
        "lakebase.postgres.project=projects/fake",
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

  test("server.ts wires lakebase setup through onPluginsReady", () => {
    const serverTs = readFileSync(resolve(appDir, "server/server.ts"), "utf-8");
    expect(serverTs).toContain("onPluginsReady");
    expect(serverTs).not.toContain("autoStart");
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
    const bundleYaml = readFileSync(resolve(appDir, "databricks.yml"), "utf-8");
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

  test("install and build succeed", () => {
    installAndBuild(appDir);
    expect(existsSync(resolve(appDir, "node_modules"))).toBe(true);
    expect(existsSync(resolve(appDir, "dist"))).toBe(true);
    expect(existsSync(resolve(appDir, "client/dist"))).toBe(true);
  });
});

describe(
  "Scaffold app with --package-manager npm",
  { timeout: 120_000 },
  () => {
    let appDir: string;

    test("databricks apps init --package-manager npm creates an npm project", () => {
      appDir = scaffoldApp({
        name: NPM_APP_NAME,
        outputDir: TEST_DIR,
        profile: PROFILE,
        packageManager: "npm",
        skipInstall: true,
      });
      expect(existsSync(resolve(appDir, "package-lock.json"))).toBe(true);
      expect(existsSync(resolve(appDir, "pnpm-lock.yaml"))).toBe(false);
    });

    test("scripts and app.yaml use npm", () => {
      const { scripts } = JSON.parse(
        readFileSync(resolve(appDir, "package.json"), "utf-8"),
      ) as { scripts: Record<string, string> };
      expect(Object.values(scripts).join("\n")).not.toContain("pnpm");
      const appYaml = readFileSync(resolve(appDir, "app.yaml"), "utf-8");
      expect(appYaml).toContain("['npm', 'run', 'start']");
    });
  },
);
