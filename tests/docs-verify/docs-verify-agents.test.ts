import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test, expect, afterAll } from "vitest";
import { run, cli, cliJson } from "../helpers/scaffold-app";

const PROFILE = process.env.DATABRICKS_PROFILE;
if (!PROFILE) {
  throw new Error(
    "DATABRICKS_PROFILE env var is required. Set it to a configured CLI profile name.",
  );
}

const SKIP_CLEANUP = Boolean(process.env.SKIP_CLEANUP);
const TEST_RUN_ID = Date.now().toString(36);

describe("Serving endpoints", { timeout: 120_000 }, () => {
  let availableEndpoint: string | undefined;

  test("list serving endpoints", () => {
    const endpoints = cliJson<
      Array<{ name: string; state?: { ready?: string } }>
    >("serving-endpoints list", PROFILE);
    expect(Array.isArray(endpoints)).toBe(true);
    console.log(
      "[agents] serving-endpoints list returned",
      endpoints.length,
      "endpoints",
    );

    const ready = endpoints.find(
      (e) => e.state?.ready === "READY" && e.name.startsWith("databricks-"),
    );
    if (ready) {
      availableEndpoint = ready.name;
      console.log(
        "[agents] found Foundation Model API endpoint:",
        availableEndpoint,
      );
    } else {
      console.warn(
        "[agents] no ready Foundation Model API endpoint found, query test will be skipped",
      );
    }
  });

  test("get a serving endpoint", () => {
    if (!availableEndpoint) {
      console.warn("[agents] skipping get: no endpoint available");
      return;
    }
    const endpoint = cliJson<{
      name: string;
      state: { ready: string };
      ai_gateway?: Record<string, unknown>;
    }>(`serving-endpoints get ${availableEndpoint}`, PROFILE);

    expect(endpoint.name).toBe(availableEndpoint);
    expect(endpoint.state.ready).toBe("READY");
    console.log("[agents] endpoint state:", JSON.stringify(endpoint.state));
  });

  test("foundation model endpoint includes ai_gateway field", () => {
    if (!availableEndpoint) {
      console.warn("[agents] skipping ai_gateway check: no endpoint available");
      return;
    }
    const endpoint = cliJson<{
      name: string;
      ai_gateway?: Record<string, unknown>;
    }>(`serving-endpoints get ${availableEndpoint}`, PROFILE);

    expect(endpoint.ai_gateway).toBeDefined();
    console.log(
      "[agents] ai_gateway config:",
      JSON.stringify(endpoint.ai_gateway),
    );
  });

  test("query a serving endpoint", () => {
    if (!availableEndpoint) {
      console.warn("[agents] skipping query: no endpoint available");
      return;
    }
    const payload = JSON.stringify({
      messages: [{ role: "user", content: "Say hello in one word" }],
      max_tokens: 10,
    });
    const result = cliJson<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(
      `serving-endpoints query ${availableEndpoint} --json '${payload}'`,
      PROFILE,
      { timeoutMs: 60_000 },
    );

    expect(result.choices).toBeDefined();
    expect(result.choices!.length).toBeGreaterThan(0);
    expect(result.choices![0].message?.content).toBeTruthy();
    console.log(
      "[agents] query response:",
      result.choices![0].message?.content,
    );
  });
});

describe("MLflow experiments", { timeout: 120_000 }, () => {
  const userJson = run(
    `databricks current-user me --profile ${PROFILE} -o json`,
  );
  const currentUser = JSON.parse(userJson) as { userName: string };
  const experimentPath = `/Users/${currentUser.userName}/devhub-test-${TEST_RUN_ID}`;
  let experimentId: string | undefined;

  afterAll(() => {
    if (SKIP_CLEANUP || !experimentId) return;
    try {
      cli(`experiments delete-experiment ${experimentId}`, PROFILE);
      console.log("[agents] deleted experiment:", experimentId);
    } catch (e) {
      console.warn("[cleanup] failed:", (e as Error).message);
    }
  });

  test("create an MLflow experiment", () => {
    const result = cliJson<{ experiment_id: string }>(
      `experiments create-experiment ${experimentPath}`,
      PROFILE,
    );
    expect(result.experiment_id).toBeTruthy();
    experimentId = result.experiment_id;
    console.log("[agents] created experiment:", experimentId);
    console.log("[agents] experiment path:", experimentPath);
  });

  test("get the created experiment", () => {
    expect(experimentId).toBeTruthy();
    const result = cliJson<{
      experiment: { experiment_id: string; name: string };
    }>(`experiments get-experiment ${experimentId}`, PROFILE);

    expect(result.experiment.experiment_id).toBe(experimentId);
    expect(result.experiment.name).toBe(experimentPath);
    console.log(
      "[agents] experiment verified:",
      JSON.stringify(result.experiment),
    );
  });
});

describe("Bundle validation", { timeout: 180_000 }, () => {
  let tempDir: string | undefined;

  afterAll(() => {
    if (SKIP_CLEANUP || !tempDir) return;
    try {
      rmSync(tempDir, { recursive: true, force: true });
      console.log("[agents] cleaned up temp dir:", tempDir);
    } catch (e) {
      console.warn(
        "[cleanup] failed to remove temp dir:",
        (e as Error).message,
      );
    }
  });

  test("clone agent template and validate bundle", () => {
    tempDir = mkdtempSync(join(tmpdir(), "devhub-agent-test-"));
    console.log("[agents] cloning agent template to:", tempDir);

    run(
      `git clone --depth 1 --filter=blob:none --sparse https://github.com/databricks/app-templates.git ${tempDir}/app-templates`,
      { timeoutMs: 30_000 },
    );
    run("git sparse-checkout set agent-openai-agents-sdk", {
      cwd: `${tempDir}/app-templates`,
      timeoutMs: 10_000,
    });

    const templateDir = `${tempDir}/app-templates/agent-openai-agents-sdk`;
    const output = cli("bundle validate", PROFILE, {
      cwd: templateDir,
      timeoutMs: 60_000,
    });
    console.log("[agents] bundle validate output:", output.slice(0, 500));
    expect(output).toBeTruthy();
  });
});

describe("CLI integration checks", () => {
  test("bundle deployment bind subcommand exists", () => {
    const output = execSync("databricks bundle deployment bind --help", {
      encoding: "utf-8",
    });
    expect(output).toContain("KEY");
    expect(output).toContain("RESOURCE_ID");
    expect(output).toContain("--auto-approve");
  });

  test("current-user me works (used in agent deploy flow)", () => {
    const output = cliJson<{ userName: string }>("current-user me", PROFILE);
    expect(output.userName).toBeTruthy();
    console.log("[agents] current user:", output.userName);
  });

  test("auth token outputs JSON with access_token field", () => {
    const output = execSync(`databricks auth token --profile ${PROFILE}`, {
      encoding: "utf-8",
    });
    const parsed = JSON.parse(output);
    expect(parsed.access_token).toBeTruthy();
    expect(typeof parsed.access_token).toBe("string");
    console.log("[agents] auth token length:", parsed.access_token.length);
  });
});

describe("Template structure", { timeout: 180_000 }, () => {
  let tempDir: string | undefined;

  afterAll(() => {
    if (SKIP_CLEANUP || !tempDir) return;
    try {
      rmSync(tempDir, { recursive: true, force: true });
      console.log("[agents] cleaned up template structure temp dir:", tempDir);
    } catch (e) {
      console.warn(
        "[cleanup] failed to remove temp dir:",
        (e as Error).message,
      );
    }
  });

  test("cloned template matches documented project structure", () => {
    tempDir = mkdtempSync(join(tmpdir(), "devhub-agent-struct-"));

    run(
      `git clone --depth 1 --filter=blob:none --sparse https://github.com/databricks/app-templates.git ${tempDir}/app-templates`,
      { timeoutMs: 30_000 },
    );
    run("git sparse-checkout set agent-openai-agents-sdk", {
      cwd: `${tempDir}/app-templates`,
      timeoutMs: 10_000,
    });

    const base = `${tempDir}/app-templates/agent-openai-agents-sdk`;

    const expectedFiles = [
      "agent_server/agent.py",
      "agent_server/start_server.py",
      "agent_server/evaluate_agent.py",
      "agent_server/utils.py",
      "pyproject.toml",
      "databricks.yml",
      "app.yaml",
      ".env.example",
    ];

    for (const file of expectedFiles) {
      expect(existsSync(join(base, file))).toBe(true);
      console.log("[agents] confirmed exists:", file);
    }
  });

  test("pyproject.toml defines documented uv scripts", () => {
    const base = `${tempDir}/app-templates/agent-openai-agents-sdk`;
    const pyproject = readFileSync(join(base, "pyproject.toml"), "utf-8");

    const expectedScripts = [
      "quickstart",
      "start-app",
      "start-server",
      "agent-evaluate",
    ];
    for (const script of expectedScripts) {
      expect(pyproject).toContain(script);
      console.log("[agents] pyproject.toml has script:", script);
    }
  });

  test(".env.example contains documented variables", () => {
    const base = `${tempDir}/app-templates/agent-openai-agents-sdk`;
    const envExample = readFileSync(join(base, ".env.example"), "utf-8");

    const expectedVars = ["DATABRICKS_CONFIG_PROFILE", "MLFLOW_EXPERIMENT_ID"];
    for (const v of expectedVars) {
      expect(envExample).toContain(v);
      console.log("[agents] .env.example has variable:", v);
    }
  });

  test("databricks.yml uses documented resource key", () => {
    const base = `${tempDir}/app-templates/agent-openai-agents-sdk`;
    const dbyml = readFileSync(join(base, "databricks.yml"), "utf-8");

    expect(dbyml).toContain("agent_openai_agents_sdk");
    console.log(
      "[agents] databricks.yml has resource key: agent_openai_agents_sdk",
    );
  });

  test("databricks.yml defines documented app name", () => {
    const base = `${tempDir}/app-templates/agent-openai-agents-sdk`;
    const dbyml = readFileSync(join(base, "databricks.yml"), "utf-8");

    expect(dbyml).toContain('name: "agent-openai-agents-sdk"');
    console.log(
      "[agents] databricks.yml has app name: agent-openai-agents-sdk",
    );
  });

  test("app.yaml contains documented startup command", () => {
    const base = `${tempDir}/app-templates/agent-openai-agents-sdk`;
    const appYaml = readFileSync(join(base, "app.yaml"), "utf-8");

    expect(appYaml).toContain("uv");
    expect(appYaml).toContain("start-app");
    console.log("[agents] app.yaml contains startup command with uv/start-app");
  });
});
