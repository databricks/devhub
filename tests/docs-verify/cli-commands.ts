import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Command configuration lives in scripts/lib so the CLI-options generator can
// share it without importing test-support code. Re-exported here so existing
// docs-verify tests keep importing from "./cli-commands".
export {
  CLI_COMMANDS,
  MUTUALLY_EXCLUSIVE,
  SHORT_TO_LONG,
  SKIP_FLAGS,
} from "../../scripts/lib/cli-commands";
export type { CommandSpec } from "../../scripts/lib/cli-commands";

export function getAllOptionsBlocks(docPath: string): string[] {
  const sourcePath = docPath.startsWith("docs/")
    ? `src/content/${docPath}`
    : docPath;
  const content = readFileSync(resolve(process.cwd(), sourcePath), "utf-8");
  const blocks: string[] = [];
  const regex = /```\w+\s+title="All Options"\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}
