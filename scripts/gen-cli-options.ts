// Generate the CLI options tables in the docs from `databricks <cmd> --help`.
//
//   pnpm docs:cli-sync                    # refresh the tables in place
//   pnpm docs:cli-sync --check            # exit 1 if any table is out of date
//   pnpm docs:cli-sync --dump-help <dir>  # write full --help per command to <dir>
//
// --dump-help writes each documented command's full `--help` output (the
// description, arguments, examples, and every flag section) to <dir>, one file
// per command. It is optional and separate from table generation: use it to
// refresh the parser fixtures, or to feed an occasional LLM review that checks
// the doc pages against the full help text for anything not covered.
//
// A doc opts in with a marker pair around each command's table:
//   <!-- cli-options:apps deploy -->
//   <!-- /cli-options -->
//
// Only the `databricks` CLI is needed to run this (locally or on a schedule).
// The site build never runs it; it just reads the committed tables. If nobody
// runs it, the tables simply drift; nothing breaks.

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { format, resolveConfig } from "prettier";

import { CLI_COMMANDS, SKIP_FLAGS } from "./lib/cli-commands";
import { parseCliFlags, renderOptionsTable } from "./lib/cli-help-parser";
import {
  findMarkedCommands,
  injectOptionsTables,
  type OptionsTables,
} from "./lib/inject-options";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = resolve(repoRoot, "src", "content", "docs");
const checkOnly = process.argv.includes("--check");

function listDocs(): string[] {
  return (
    readdirSync(docsRoot, { recursive: true, encoding: "utf-8" }) as string[]
  )
    .filter((file) => file.endsWith(".md"))
    .map((file) => resolve(docsRoot, file));
}

function cliHelp(command: string): string {
  try {
    return execFileSync("databricks", [...command.split(" "), "--help"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw new Error(
        "The `databricks` CLI is not installed or not on PATH. Install it and re-run " +
          "`pnpm docs:cli-sync`. The site build never needs the CLI; only this generator does.",
      );
    }
    throw new Error(`\`databricks ${command} --help\` failed: ${err.message}`);
  }
}

function buildTable(command: string): string {
  const flags = parseCliFlags(cliHelp(command));
  if (flags.length === 0) {
    // Every command has at least the global flags, so zero parsed flags means the
    // `--help` layout no longer matches the parser. Fail loudly rather than
    // overwrite the committed table with an empty one.
    throw new Error(
      `Parsed zero flags from \`databricks ${command} --help\`. The help format may have ` +
        "changed; refusing to blank the options table. Update scripts/lib/cli-help-parser.ts.",
    );
  }
  const skip = new Set(SKIP_FLAGS[command] ?? []);
  return renderOptionsTable(flags.filter((flag) => !skip.has(flag.long)));
}

function commandToFilename(command: string): string {
  return `${command.replace(/\s+/g, "-")}.txt`;
}

// Write each documented command's full `databricks <cmd> --help` output to
// <dir>, one file per command. Includes the description, arguments, examples,
// and every flag section (more context than the generated table keeps).
function dumpHelp(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const { command } of CLI_COMMANDS) {
    writeFileSync(resolve(dir, commandToFilename(command)), cliHelp(command));
  }
  console.log(
    `Wrote full --help for ${CLI_COMMANDS.length} command(s) to ${dir}`,
  );
}

async function main(): Promise<void> {
  const dumpIndex = process.argv.indexOf("--dump-help");
  if (dumpIndex >= 0) {
    const dir = process.argv[dumpIndex + 1];
    if (!dir || dir.startsWith("--")) {
      throw new Error("Usage: pnpm docs:cli-sync --dump-help <dir>");
    }
    dumpHelp(resolve(process.cwd(), dir));
    return;
  }

  const docTexts = new Map<string, string>();
  const commands = new Set<string>();
  for (const doc of listDocs()) {
    const text = readFileSync(doc, "utf-8");
    const marked = findMarkedCommands(text);
    if (marked.length === 0) continue;
    docTexts.set(doc, text);
    for (const command of marked) commands.add(command);
  }

  if (commands.size === 0) {
    console.log("No <!-- cli-options:... --> markers found. Nothing to do.");
    return;
  }

  // Markers, the `All Options` bash blocks, and the docs-verify tests should
  // stay consistent: warn if a marker names a command not tracked in CLI_COMMANDS.
  const known = new Set(CLI_COMMANDS.map((spec) => spec.command));
  for (const command of commands) {
    if (!known.has(command)) {
      console.warn(
        `Warning: marker command "${command}" is not in CLI_COMMANDS.`,
      );
    }
  }

  const tables: OptionsTables = {};
  for (const command of [...commands].sort()) {
    tables[command] = buildTable(command);
  }

  // Format the whole doc through prettier after injecting, so the committed file
  // stays prettier-clean (pre-commit runs `prettier -c`) and re-running is
  // idempotent (the same formatting is compared each time).
  const prettierConfig = (await resolveConfig(docsRoot)) ?? {};
  const changed: string[] = [];
  for (const [doc, text] of docTexts) {
    const { text: injected, missing } = injectOptionsTables(text, tables);
    for (const command of missing) {
      console.warn(
        `Warning: no table generated for marker "${command}" in ${doc}.`,
      );
    }
    const next = await format(injected, { ...prettierConfig, filepath: doc });
    if (next !== text) {
      changed.push(doc);
      if (!checkOnly) writeFileSync(doc, next);
    }
  }

  if (checkOnly) {
    if (changed.length > 0) {
      console.error(
        `CLI options tables are out of date in ${changed.length} file(s). ` +
          "Run `pnpm docs:cli-sync`:\n" +
          changed.map((file) => `  ${file}`).join("\n"),
      );
      process.exit(1);
    }
    console.log("CLI options tables are up to date.");
    return;
  }

  if (changed.length === 0) {
    console.log("CLI options tables already up to date.");
    return;
  }

  console.log(`Updated CLI options tables in ${changed.length} file(s):`);
  for (const file of changed) console.log(`  ${file}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
