import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type CommandSpec = {
  command: string;
  doc: string;
};

export const MUTUALLY_EXCLUSIVE: Record<string, string[]> = {
  psql: ["--provisioned", "--autoscaling"],
  manifest: ["--branch", "--version"],
  init: ["--branch", "--version"],
};

export const SKIP_FLAGS: Record<string, string[]> = {
  "apps init": ["--name"],
  "postgres create-project": ["--name"],
  "postgres create-branch": ["--name"],
  "postgres update-branch": ["--name"],
  "postgres update-endpoint": ["--name"],
  "postgres update-project": ["--name"],
  // Job, pipeline, and task-specific flags are intentionally omitted from the
  // agents docs since bundle run is only used here to start apps.
  "bundle run": [
    "--only",
    "--params",
    "--dbt-commands",
    "--jar-params",
    "--notebook-params",
    "--pipeline-params",
    "--python-named-params",
    "--python-params",
    "--spark-submit-params",
    "--sql-params",
    "--full-refresh",
    "--full-refresh-all",
    "--refresh",
    "--refresh-all",
    "--validate-only",
    // These appear in help examples ("-- --key1 value1") or notes, not as real flags.
    "--key1",
    "--key2",
    "--param",
  ],
};

export const SHORT_TO_LONG: Record<string, string> = {
  "-o": "--output",
  "-f": "--follow",
  "-p": "--profile",
  "-t": "--target",
  "-c": "--cluster-id",
};

export function getAllOptionsBlocks(docPath: string): string[] {
  const content = readFileSync(resolve(process.cwd(), docPath), "utf-8");
  const blocks: string[] = [];
  const regex = /```\w+\s+title="All Options"\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

export const CLI_COMMANDS: CommandSpec[] = [
  // Lakebase
  {
    command: "postgres create-project",
    doc: "docs/lakebase/quickstart.md",
  },
  {
    command: "postgres list-endpoints",
    doc: "docs/lakebase/quickstart.md",
  },
  {
    command: "postgres list-databases",
    doc: "docs/lakebase/quickstart.md",
  },
  {
    command: "postgres generate-database-credential",
    doc: "docs/lakebase/quickstart.md",
  },
  {
    command: "psql",
    doc: "docs/lakebase/quickstart.md",
  },
  {
    command: "postgres create-branch",
    doc: "docs/lakebase/development.md",
  },
  {
    command: "postgres update-branch",
    doc: "docs/lakebase/development.md",
  },
  {
    command: "postgres update-endpoint",
    doc: "docs/lakebase/core-concepts.md",
  },
  {
    command: "postgres update-project",
    doc: "docs/lakebase/core-concepts.md",
  },
  {
    command: "postgres delete-branch",
    doc: "docs/lakebase/development.md",
  },
  {
    command: "psql",
    doc: "docs/lakebase/development.md",
  },
  // Apps
  {
    command: "apps init",
    doc: "docs/apps/quickstart.md",
  },
  {
    command: "apps deploy",
    doc: "docs/apps/development.md",
  },
  {
    command: "apps logs",
    doc: "docs/apps/development.md",
  },
  {
    command: "apps init",
    doc: "docs/apps/plugins.md",
  },
  {
    command: "apps manifest",
    doc: "docs/apps/plugins.md",
  },
  {
    command: "apps get",
    doc: "docs/apps/development.md",
  },
  {
    command: "apps stop",
    doc: "docs/apps/development.md",
  },
  {
    command: "apps start",
    doc: "docs/apps/development.md",
  },
  {
    command: "apps delete",
    doc: "docs/apps/development.md",
  },
  // Agents
  {
    command: "bundle validate",
    doc: "docs/agents/quickstart.md",
  },
  {
    command: "bundle deploy",
    doc: "docs/agents/quickstart.md",
  },
  {
    command: "bundle run",
    doc: "docs/agents/quickstart.md",
  },
  // agents/development.md cross-documents the same deploy and app management
  // commands; testing them here catches drift in that page independently.
  {
    command: "bundle validate",
    doc: "docs/agents/development.md",
  },
  {
    command: "bundle deploy",
    doc: "docs/agents/development.md",
  },
  {
    command: "bundle run",
    doc: "docs/agents/development.md",
  },
  {
    command: "apps get",
    doc: "docs/agents/development.md",
  },
  {
    command: "apps logs",
    doc: "docs/agents/development.md",
  },
  {
    command: "apps stop",
    doc: "docs/agents/development.md",
  },
  {
    command: "apps start",
    doc: "docs/agents/development.md",
  },
  {
    command: "apps delete",
    doc: "docs/agents/development.md",
  },
  {
    command: "apps get",
    doc: "docs/agents/quickstart.md",
  },
  {
    command: "serving-endpoints list",
    doc: "docs/agents/ai-gateway.md",
  },
  {
    command: "serving-endpoints get",
    doc: "docs/agents/ai-gateway.md",
  },
  {
    command: "serving-endpoints query",
    doc: "docs/agents/ai-gateway.md",
  },
  {
    command: "serving-endpoints create",
    doc: "docs/agents/ai-gateway.md",
  },
  {
    command: "experiments create-experiment",
    doc: "docs/agents/observability.md",
  },
];
