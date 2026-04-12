import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, test, expect } from "vitest";

const MUTUALLY_EXCLUSIVE: Record<string, string[]> = {
  psql: ["--provisioned", "--autoscaling"],
  manifest: ["--branch", "--version"],
  init: ["--branch", "--version"],
};

const SKIP_FLAGS: Record<string, string[]> = {
  "apps init": ["--name"],
  "postgres create-project": ["--name"],
  "postgres create-branch": ["--name"],
  "postgres update-branch": ["--name"],
  "postgres update-endpoint": ["--name"],
  "postgres update-project": ["--name"],
};

const SHORT_TO_LONG: Record<string, string> = {
  "-o": "--output",
  "-f": "--follow",
  "-p": "--profile",
  "-t": "--target",
  "-c": "--cluster-id",
};

const LONG_TO_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(SHORT_TO_LONG).map(([short, long]) => [long, short]),
);

type CommandSpec = {
  command: string;
  doc: string;
};

const CLI_COMMANDS: CommandSpec[] = [
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
    doc: "docs/lakebase/core-concepts.md",
  },
  {
    command: "postgres update-branch",
    doc: "docs/lakebase/core-concepts.md",
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
    command: "apps manifest",
    doc: "docs/apps/plugins.md",
  },
  {
    command: "apps get",
    doc: "docs/apps/development.md",
  },
  // Agents
  {
    command: "bundle validate",
    doc: "docs/agents/quickstart.md",
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
    doc: "docs/agents/development.md",
  },
  {
    command: "experiments create-experiment",
    doc: "docs/agents/observability.md",
  },
];

function getCliFlags(command: string): string[] {
  const output = execSync(`databricks ${command} --help`, {
    encoding: "utf-8",
  });
  const flags: string[] = [];
  for (const match of output.matchAll(/(--[\w-]+)/gm)) {
    const flag = match[1];
    if (flag !== "--help") {
      flags.push(flag);
    }
  }
  return [...new Set(flags)];
}

function getAllOptionsBlocks(docPath: string): string[] {
  const content = readFileSync(resolve(process.cwd(), docPath), "utf-8");
  const blocks: string[] = [];
  const regex = /```\w+\s+title="All Options"\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

function extractFlagsFromBlocks(blocks: string[]): string[] {
  const flags: string[] = [];
  for (const block of blocks) {
    for (const match of block.matchAll(/(--[\w-]+)/g)) {
      flags.push(match[1]);
    }
    for (const match of block.matchAll(/^\s+(-[a-zA-Z])\s/gm)) {
      flags.push(match[1]);
    }
  }
  return [...new Set(flags)];
}

function findBlockForCommand(
  blocks: string[],
  command: string,
): string | undefined {
  const parts = command.split(" ");
  const cliCommand = `databricks ${parts.join(" ")}`;
  return blocks.find((b) => b.includes(cliCommand));
}

function flagInSet(flag: string, flagSet: string[]): boolean {
  if (flagSet.includes(flag)) return true;
  const alt = SHORT_TO_LONG[flag] ?? LONG_TO_SHORT[flag];
  return alt ? flagSet.includes(alt) : false;
}

describe("CLI options completeness", () => {
  for (const spec of CLI_COMMANDS) {
    describe(spec.command, () => {
      test("all CLI flags appear in docs (no missing)", () => {
        const cliFlags = getCliFlags(spec.command);
        const blocks = getAllOptionsBlocks(spec.doc);
        const block = findBlockForCommand(blocks, spec.command);

        expect(
          block,
          `No "All Options" code block found for '${spec.command}' in ${spec.doc}`,
        ).toBeTruthy();

        const docFlags = extractFlagsFromBlocks([block!]);
        const subcommand = spec.command.split(" ").pop()!;
        const exclusiveGroup = MUTUALLY_EXCLUSIVE[subcommand] ?? [];
        const skipFlags = SKIP_FLAGS[spec.command] ?? [];

        for (const flag of cliFlags) {
          if (skipFlags.includes(flag)) continue;
          if (
            exclusiveGroup.includes(flag) &&
            exclusiveGroup.some((f) => flagInSet(f, docFlags))
          ) {
            continue;
          }
          expect(
            flagInSet(flag, docFlags),
            `Flag ${flag} from 'databricks ${spec.command} --help' not found in ${spec.doc}`,
          ).toBe(true);
        }
      });

      test("all documented flags exist in CLI (no stale)", () => {
        const cliFlags = getCliFlags(spec.command);
        const blocks = getAllOptionsBlocks(spec.doc);
        const block = findBlockForCommand(blocks, spec.command);

        if (!block) return;

        const docFlags = extractFlagsFromBlocks([block]);

        for (const flag of docFlags) {
          expect(
            flagInSet(flag, cliFlags),
            `Flag ${flag} in ${spec.doc} does not exist in 'databricks ${spec.command} --help'`,
          ).toBe(true);
        }
      });
    });
  }
});
