// Shared configuration for the documented `databricks` CLI commands. This is
// plain data (which commands are documented, plus curation for how their flags
// map to docs) used by both the docs-verify tests and the CLI-options generator
// (scripts/gen-cli-options.ts). It lives outside tests/ so the generator does
// not import test-support code.

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
  "apps init": ["--name", "--auto-approve"],
  "apps deploy": [
    // Advanced API/CI flags not surfaced in user-facing docs
    "--cluster-id",
    "--fail-on-active-runs",
    "--force-lock",
    "--plan",
  ],
  "postgres create-branch": ["--name"],
  "postgres update-endpoint": ["--name"],
  "postgres update-project": ["--name"],
  // Lakebase Provisioned is legacy: since March 2026 new Lakebase instances are
  // created as Autoscaling projects, and existing ones were upgraded. Leave
  // --provisioned out of the psql options table so the docs lead with Autoscaling.
  psql: ["--provisioned"],
};

export const SHORT_TO_LONG: Record<string, string> = {
  "-o": "--output",
  "-f": "--follow",
  "-p": "--profile",
  "-t": "--target",
  "-c": "--cluster-id",
};

export const CLI_COMMANDS: CommandSpec[] = [
  // Lakebase
  {
    command: "postgres create-branch",
    doc: "docs/lakebase/development.md",
  },
  {
    command: "postgres update-endpoint",
    doc: "docs/lakebase/configuration.md",
  },
  {
    command: "postgres update-project",
    doc: "docs/lakebase/configuration.md",
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
    doc: "docs/apps/development.md",
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
    command: "apps manifest",
    doc: "docs/apps/development.md",
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
  // Agent skills
  {
    command: "aitools install",
    doc: "docs/tools/ai-tools/agent-skills.md",
  },
  // Agents: serving-endpoints commands shown on the ai-gateway page.
  {
    command: "serving-endpoints list",
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
];
