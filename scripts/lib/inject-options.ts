// Pure marker-region replacement for generated CLI options tables. A doc opts
// in by placing a marker pair around the spot a table should live:
//
//   <!-- cli-options:apps deploy -->
//   <!-- /cli-options -->
//
// The generator replaces everything between the markers with the freshly
// rendered table. Only marked regions are touched, and re-running with the same
// input is idempotent (the markers and canonical spacing are always restored).

export type OptionsTables = Record<string, string>; // command -> markdown table

const MARKER_RE =
  /(<!-- cli-options:(.+?) -->)([\s\S]*?)(<!-- \/cli-options -->)/g;

export function findMarkedCommands(docText: string): string[] {
  const commands: string[] = [];
  for (const match of docText.matchAll(MARKER_RE)) {
    commands.push(match[2].trim());
  }
  return commands;
}

// Replace the body of a single named marker region, e.g. name "aitools-skills"
// matches `<!-- aitools-skills -->` ... `<!-- /aitools-skills -->`. Idempotent,
// and restores canonical spacing. Returns whether the region was found.
export function injectNamedRegion(
  docText: string,
  name: string,
  body: string,
): { text: string; found: boolean } {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `(<!-- ${escaped} -->)([\\s\\S]*?)(<!-- /${escaped} -->)`,
  );
  let found = false;
  const text = docText.replace(
    regex,
    (_full, open: string, _mid, close: string) => {
      found = true;
      return `${open}\n${body}\n${close}`;
    },
  );
  return { text, found };
}

export function injectOptionsTables(
  docText: string,
  tables: OptionsTables,
): { text: string; replaced: string[]; missing: string[] } {
  const replaced: string[] = [];
  const missing: string[] = [];
  const text = docText.replace(
    MARKER_RE,
    (full, open: string, rawCommand: string, _body: string, close: string) => {
      const command = rawCommand.trim();
      const table = tables[command];
      if (table === undefined) {
        missing.push(command);
        return full;
      }
      replaced.push(command);
      return `${open}\n${table}\n${close}`;
    },
  );
  return { text, replaced, missing };
}
