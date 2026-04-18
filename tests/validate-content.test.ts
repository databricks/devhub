import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const VALIDATOR = resolve(REPO_ROOT, "scripts/validate-content.mjs");

type RunResult = { status: number; stdout: string; stderr: string };

function runValidator(cwd: string): RunResult {
  try {
    const stdout = execFileSync("node", [VALIDATOR], {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "" };
  } catch (error) {
    const err = error as {
      status?: number;
      stdout?: Buffer | string;
      stderr?: Buffer | string;
    };
    return {
      status: err.status ?? 1,
      stdout:
        typeof err.stdout === "string" ? err.stdout : String(err.stdout ?? ""),
      stderr:
        typeof err.stderr === "string" ? err.stderr : String(err.stderr ?? ""),
    };
  }
}

function seedFixture(rootDir: string, layout: Record<string, string>): void {
  for (const [relativePath, contents] of Object.entries(layout)) {
    const filePath = resolve(rootDir, relativePath);
    mkdirSync(resolve(filePath, ".."), { recursive: true });
    writeFileSync(filePath, contents, "utf-8");
  }
  mkdirSync(join(rootDir, "content", "recipes"), { recursive: true });
  mkdirSync(join(rootDir, "content", "examples"), { recursive: true });
}

describe("validate-content script", () => {
  let workDir: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "devhub-validate-"));
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  test("passes for a valid folder layout with only content.md", () => {
    seedFixture(workDir, {
      "content/recipes/my-recipe/content.md": "## My Recipe\n",
      "content/examples/my-example/content.md": "## My Example\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("validation passed");
  });

  test("passes when optional prerequisites.md and deployment.md are present", () => {
    seedFixture(workDir, {
      "content/examples/full/content.md": "## Full\n",
      "content/examples/full/prerequisites.md": "### Prereqs\n",
      "content/examples/full/deployment.md": "### Deploy\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
  });

  test("fails when content folder has a flat .md file instead of a subfolder", () => {
    seedFixture(workDir, {
      "content/recipes/flat-file.md": "## Flat\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("flat-file.md");
    expect(result.stderr).toContain("is not a directory");
  });

  test("fails when a folder is missing required content.md", () => {
    seedFixture(workDir, {
      "content/recipes/no-content/prerequisites.md": "### Prereqs\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("no-content");
    expect(result.stderr).toContain("missing the required content.md");
  });

  test("fails when a folder contains a disallowed filename", () => {
    seedFixture(workDir, {
      "content/recipes/stray/content.md": "## Stray\n",
      "content/recipes/stray/steps.md": "### Steps\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("steps.md");
    expect(result.stderr).toContain("not an allowed filename");
  });

  test("accepts content/cookbooks/<slug>/intro.md", () => {
    seedFixture(workDir, {
      "content/recipes/r/content.md": "## R\n",
      "content/examples/e/content.md": "## E\n",
      "content/cookbooks/my-cookbook/intro.md": "## Intro\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
  });

  test("fails when content/cookbooks has a flat file instead of a folder", () => {
    seedFixture(workDir, {
      "content/cookbooks/flat.md": "## Flat\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("content/cookbooks/flat.md");
    expect(result.stderr).toContain("not a directory");
  });

  test("fails when a cookbook folder has a disallowed filename", () => {
    seedFixture(workDir, {
      "content/cookbooks/my-cookbook/intro.md": "## Intro\n",
      "content/cookbooks/my-cookbook/content.md": "## Content\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("content/cookbooks/my-cookbook/content.md");
    expect(result.stderr).toContain("not an allowed filename");
  });
});
