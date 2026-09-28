import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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
  mkdirSync(join(rootDir, "src", "content", "recipes"), { recursive: true });
  mkdirSync(join(rootDir, "src", "content", "examples"), { recursive: true });
}

describe("validate-content script", () => {
  let workDir: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "devhub-validate-"));
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  test("passes for a valid folder layout with goal.md", () => {
    seedFixture(workDir, {
      "src/content/recipes/my-recipe/goal.md": "Build something.\n",
      "src/content/examples/my-example/goal.md": "Build an example.\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("validation passed");
  });

  test("passes when optional prerequisites.md is present", () => {
    seedFixture(workDir, {
      "src/content/examples/full/goal.md": "Build it.\n",
      "src/content/examples/full/prerequisites.md": "### Prereqs\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
  });

  test("fails when content folder has a flat .md file instead of a subfolder", () => {
    seedFixture(workDir, {
      "src/content/recipes/flat-file.md": "## Flat\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("flat-file.md");
    expect(result.stderr).toContain("is not a directory");
  });

  test("fails when a folder is missing required goal.md", () => {
    seedFixture(workDir, {
      "src/content/recipes/no-goal/prerequisites.md": "### Prereqs\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("no-goal");
    expect(result.stderr).toContain("missing a required file");
  });

  test("fails when goal.md is whitespace-only", () => {
    seedFixture(workDir, {
      "src/content/recipes/blank/goal.md": "   \n  \n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("empty or whitespace-only");
  });

  test("fails when a folder contains a disallowed filename", () => {
    seedFixture(workDir, {
      "src/content/recipes/stray/goal.md": "Build it.\n",
      "src/content/recipes/stray/content.md": "## Steps\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("content.md");
    expect(result.stderr).toContain("not an allowed filename");
  });

  test("accepts replit-prompt.md alongside goal.md in a resource folder", () => {
    seedFixture(workDir, {
      "src/content/recipes/with-replit/goal.md": "Build it.\n",
      "src/content/recipes/with-replit/replit-prompt.md":
        "You are Replit Agent. Build...\n",
      "src/content/examples/also-replit/goal.md": "Build it.\n",
      "src/content/examples/also-replit/replit-prompt.md":
        "You are Replit Agent. Build...\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("validation passed");
  });

  test("requires src/content/cookbooks/<slug>/goal.md", () => {
    seedFixture(workDir, {
      "src/content/recipes/r/goal.md": "Build it.\n",
      "src/content/examples/e/goal.md": "Build it.\n",
      "src/content/cookbooks/my-cookbook/replit-prompt.md":
        "You are Replit Agent. Build...\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("src/content/cookbooks/my-cookbook/");
    expect(result.stderr).toContain("missing a required file");
  });

  test("fails when src/content/cookbooks has a flat file instead of a folder", () => {
    seedFixture(workDir, {
      "src/content/cookbooks/flat.md": "## Flat\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("src/content/cookbooks/flat.md");
    expect(result.stderr).toContain("not a directory");
  });

  test("accepts replit-prompt.md alongside goal.md in a cookbook folder", () => {
    seedFixture(workDir, {
      "src/content/recipes/r/goal.md": "Build it.\n",
      "src/content/examples/e/goal.md": "Build it.\n",
      "src/content/cookbooks/with-replit/goal.md": "## Goal\n",
      "src/content/cookbooks/with-replit/replit-prompt.md":
        "You are Replit Agent. Build...\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("validation passed");
  });

  test("fails when a cookbook folder has a disallowed filename", () => {
    seedFixture(workDir, {
      "src/content/cookbooks/my-cookbook/goal.md": "## Goal\n",
      "src/content/cookbooks/my-cookbook/content.md": "## Content\n",
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "src/content/cookbooks/my-cookbook/content.md",
    );
    expect(result.stderr).toContain("not an allowed filename");
  });

  test("fails on absolute DevHub markdown links inside templates and docs", () => {
    seedFixture(workDir, {
      "src/content/recipes/bad/goal.md": [
        "Build it.",
        "",
        "See [docs](https://developers.databricks.com/docs/start-here) for setup.",
        "",
      ].join("\n"),
      "src/content/docs/bad-doc.md": [
        "# Bad doc",
        "",
        "<https://developers.databricks.com/templates/foo>",
        "",
        "[ref]: https://developers.databricks.com/docs/baz",
        "",
      ].join("\n"),
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "src/content/recipes/bad/goal.md: absolute DevHub markdown link",
    );
    expect(result.stderr).toContain(
      '"https://developers.databricks.com/docs/start-here"',
    );
    expect(result.stderr).toContain(
      "src/content/docs/bad-doc.md: absolute DevHub autolink",
    );
    expect(result.stderr).toContain(
      "src/content/docs/bad-doc.md: absolute DevHub reference definition",
    );
  });

  test("allows bare prose URLs and code-block URLs that mention developers.databricks.com", () => {
    seedFixture(workDir, {
      "src/content/recipes/ok/goal.md": [
        "Build it.",
        "",
        "Website: https://developers.databricks.com.",
        "",
        "Fetch the index from https://developers.databricks.com/llms.txt before guessing.",
        "",
        "```bash",
        "npx add-mcp https://developers.databricks.com/api/mcp --name devhub-docs",
        "```",
        "",
        "External link: [GitHub](https://github.com/databricks/devhub).",
        "",
      ].join("\n"),
    });

    const result = runValidator(workDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("validation passed");
  });
});
