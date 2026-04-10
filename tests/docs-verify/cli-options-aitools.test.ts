import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, test, expect } from "vitest";

const DOC_PATH = resolve(
  __dirname,
  "..",
  "..",
  "docs",
  "tools",
  "ai-tools",
  "agent-skills.md",
);

const GLOBAL_FLAGS = ["--debug", "--output", "--profile", "--target"];

function getCliFlags(subcommand: string): string[] {
  const output = execSync(
    `databricks experimental aitools ${subcommand} --help`,
    { encoding: "utf-8" },
  );
  const flags: string[] = [];
  for (const match of output.matchAll(/--([\w-]+)/gm)) {
    flags.push(`--${match[1]}`);
  }
  return [...new Set(flags)].filter(
    (f) => f !== "--help" && !GLOBAL_FLAGS.includes(f),
  );
}

function extractDocFlags(content: string): string[] {
  const flags: string[] = [];
  for (const match of content.matchAll(/`(--[\w-]+)`/g)) {
    flags.push(match[1]);
  }
  return [...new Set(flags)];
}

describe("agent-skills aitools CLI options", () => {
  const page = readFileSync(DOC_PATH, "utf-8");
  const docFlags = extractDocFlags(page);

  for (const subcommand of ["install", "update", "uninstall", "list"]) {
    test(`all ${subcommand} flags appear in docs`, () => {
      const cliFlags = getCliFlags(subcommand);
      for (const flag of cliFlags) {
        expect(
          docFlags.includes(flag),
          `Flag ${flag} from 'databricks experimental aitools ${subcommand} --help' not found in agent-skills.md`,
        ).toBe(true);
      }
    });
  }

  test("no stale flags in docs", () => {
    const allCliFlags = new Set(
      ["install", "update", "uninstall", "list"].flatMap(getCliFlags),
    );
    for (const flag of docFlags) {
      expect(
        allCliFlags.has(flag),
        `Flag ${flag} in agent-skills.md does not exist in any aitools subcommand`,
      ).toBe(true);
    }
  });
});
