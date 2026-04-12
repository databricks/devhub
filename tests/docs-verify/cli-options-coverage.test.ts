import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, test, expect } from "vitest";
import { CLI_COMMANDS, getAllOptionsBlocks } from "./cli-commands";

// Extract all databricks subcommands from a block. Combined blocks (multiple
// commands in one "All Options" fence) are split at lines beginning with
// "databricks" so each command is detected independently.
function getCommandsFromBlock(block: string): string[] {
  const sections = block.split(/\n(?=databricks\s)/);
  const commands: string[] = [];
  for (const section of sections) {
    // (?=\s|$) prevents partial matches like "agent" from "agent_openai_agents_sdk"
    const match = section.match(
      /^databricks\s+((?:[a-z][a-z0-9-]*\s+)*[a-z][a-z0-9-]*)(?=\s|$)/m,
    );
    if (match) commands.push(match[1].trimEnd());
  }
  return commands;
}

describe("All 'All Options' blocks are covered by CLI_COMMANDS", () => {
  test("every databricks 'All Options' block in docs has a CLI_COMMANDS entry", () => {
    const docsDir = resolve(process.cwd(), "docs");
    const mdFiles = (
      readdirSync(docsDir, { recursive: true, encoding: "utf-8" }) as string[]
    )
      .filter((f) => f.endsWith(".md"))
      .map((f) => `docs/${f}`);

    const missing: string[] = [];

    for (const docPath of mdFiles) {
      const blocks = getAllOptionsBlocks(docPath);
      for (const block of blocks) {
        for (const command of getCommandsFromBlock(block)) {
          const covered = CLI_COMMANDS.some(
            (s) => s.command === command && s.doc === docPath,
          );
          if (!covered)
            missing.push(`  { command: "${command}", doc: "${docPath}" }`);
        }
      }
    }

    expect(
      missing,
      `These "All Options" blocks in docs have no CLI_COMMANDS entry:\n${missing.join("\n")}`,
    ).toHaveLength(0);
  });
});
