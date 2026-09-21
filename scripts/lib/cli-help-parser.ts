// Pure parsing of `databricks <command> --help` output into flag rows, and
// rendering those rows as a markdown options table. No I/O here so it can be
// unit-tested against captured fixtures without the CLI installed. The
// imperative shell (scripts/gen-cli-options.ts) runs the CLI and writes docs.

export type CliFlag = {
  long: string; // "--follow"
  short?: string; // "-f"
  description: string;
};

// A flag-definition line inside a flags section, e.g.
//   "  -f, --follow             Continue streaming logs until interrupted."
//   "      --tail-lines int     Number of recent log lines... (default 200)"
// Captures the optional short alias, the long flag, and the rest of the line
// (an optional type token plus the description, separated later).
const FLAG_LINE = /^\s+(?:(-\w), )?(--[\w-]+)\b(.*)$/;

// The Databricks CLI groups flags under several headers, not just "Flags:":
// "Global Flags:", "Streaming Flags:", "Filtering Flags:", etc. Collect from
// every "*Flags:" header, and stop at any other section header ("Usage:",
// "Examples:", "Arguments:", ...).
const FLAGS_SECTION = /^(?:[A-Za-z][A-Za-z ]*)?Flags:\s*$/;
const OTHER_SECTION = /^[A-Za-z][A-Za-z ]*:\s*$/;

// The description begins after the first run of two or more spaces following the
// flag (and its optional type token). Everything before that gap is the type.
function descriptionFromRest(rest: string): string {
  const match = rest.match(/\s{2,}(.+?)\s*$/);
  return (match ? match[1] : rest).trim();
}

export function parseCliFlags(helpText: string): CliFlag[] {
  const flags: CliFlag[] = [];
  const seen = new Set<string>();
  let inFlags = false;

  for (const line of helpText.split("\n")) {
    if (FLAGS_SECTION.test(line)) {
      inFlags = true;
      continue;
    }
    if (OTHER_SECTION.test(line)) {
      inFlags = false;
      continue;
    }
    if (!inFlags) continue;

    const match = line.match(FLAG_LINE);
    if (!match) continue;

    const [, short, long, rest] = match;
    if (long === "--help" || seen.has(long)) continue;
    seen.add(long);
    flags.push({
      long,
      short: short ?? undefined,
      description: descriptionFromRest(rest),
    });
  }

  return flags;
}

export function renderOptionsTable(flags: CliFlag[]): string {
  if (flags.length === 0) return "";
  const rows = flags.map((flag) => {
    // Long flag first so every row starts with `--…` and aligns with flags that
    // have no short alias (e.g. `--output`, `-o` lines up under `--var`).
    const option = flag.short
      ? `\`${flag.long}\`, \`${flag.short}\``
      : `\`${flag.long}\``;
    // Escape `|` (ends a table cell) and `<` (can start an HTML tag, which would
    // swallow the following text) so arbitrary help descriptions render intact.
    const description = flag.description
      .replace(/\|/g, "\\|")
      .replace(/</g, "&lt;");
    return `| ${option} | ${description} |`;
  });
  return ["| Option | Description |", "| --- | --- |", ...rows].join("\n");
}
