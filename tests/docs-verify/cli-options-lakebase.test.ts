import { execSync } from "node:child_process";
import { describe, test, expect } from "vitest";
import {
  CLI_COMMANDS,
  MUTUALLY_EXCLUSIVE,
  SKIP_FLAGS,
  SHORT_TO_LONG,
  getAllOptionsBlocks,
} from "./cli-commands";

const LONG_TO_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(SHORT_TO_LONG).map(([short, long]) => [long, short]),
);

function getCliFlags(command: string): string[] {
  const output = execSync(`databricks ${command} --help`, {
    encoding: "utf-8",
  });
  const flags: string[] = [];
  for (const match of output.matchAll(/(--[a-zA-Z][a-zA-Z0-9-]*)/gm)) {
    const flag = match[1];
    if (flag !== "--help") {
      flags.push(flag);
    }
  }
  return [...new Set(flags)];
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

// When a single "All Options" block documents multiple commands, split it into
// per-command sections (split at lines that start a new `databricks` command)
// and return flags only for the relevant section.
function extractFlagsForCommand(block: string, command: string): string[] {
  const cliCommand = `databricks ${command}`;
  const sections = block.split(/\n(?=databricks\s)/);
  const section =
    sections.length > 1
      ? (sections.find((s) => s.includes(cliCommand)) ?? block)
      : block;
  return extractFlagsFromBlocks([section]);
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

        const docFlags = extractFlagsForCommand(block!, spec.command);
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

        const docFlags = extractFlagsForCommand(block, spec.command);

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
