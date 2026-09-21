import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import {
  parseCliFlags,
  renderOptionsTable,
} from "../scripts/lib/cli-help-parser";

function fixture(name: string): string {
  return readFileSync(
    resolve(process.cwd(), "tests/fixtures/cli-help", `${name}.txt`),
    "utf-8",
  );
}

describe("parseCliFlags", () => {
  test("collects flags from every '*Flags:' section, not just 'Flags:'", () => {
    // apps logs groups flags under Streaming Flags / Filtering Flags / Flags /
    // Global Flags. All must be captured.
    const flags = parseCliFlags(fixture("apps-logs"));
    const longs = flags.map((f) => f.long);

    expect(longs).toEqual(
      expect.arrayContaining([
        "--follow", // Streaming Flags
        "--tail-lines",
        "--timeout",
        "--search", // Filtering Flags
        "--source",
        "--output-file", // Flags
        "--debug", // Global Flags
        "--output",
        "--profile",
        "--target",
        "--var",
      ]),
    );
  });

  test("excludes --help", () => {
    const flags = parseCliFlags(fixture("apps-logs"));
    expect(flags.map((f) => f.long)).not.toContain("--help");
  });

  test("captures short aliases", () => {
    const follow = parseCliFlags(fixture("apps-logs")).find(
      (f) => f.long === "--follow",
    );
    expect(follow?.short).toBe("-f");

    const output = parseCliFlags(fixture("apps-logs")).find(
      (f) => f.long === "--output",
    );
    expect(output?.short).toBe("-o");
  });

  test("captures the description, stripping the type token and padding", () => {
    const flags = parseCliFlags(fixture("apps-logs"));
    const follow = flags.find((f) => f.long === "--follow");
    expect(follow?.description).toBe(
      "Continue streaming logs until interrupted.",
    );

    const tailLines = flags.find((f) => f.long === "--tail-lines");
    // "--tail-lines int     Number of recent..." → type "int" dropped.
    expect(tailLines?.description).toBe(
      "Number of recent log lines to show before streaming. Set to 0 to show everything. (default 200)",
    );
  });

  test("handles boolean and typed flags in another command family", () => {
    const flags = parseCliFlags(fixture("postgres-create-branch"));
    const byLong = Object.fromEntries(flags.map((f) => [f.long, f]));

    expect(byLong["--no-wait"].description).toBe(
      "do not wait to reach DONE state",
    );
    expect(byLong["--replace-existing"].description).toBe(
      "If true, update the branch if it already exists instead of returning an error.",
    );
    expect(byLong["--json"]).toBeTruthy();
  });
});

describe("renderOptionsTable", () => {
  test("renders a markdown table with escaped pipes", () => {
    const table = renderOptionsTable([
      { long: "--follow", short: "-f", description: "Stream logs" },
      { long: "--mode", description: "AUTO_SYNC | SNAPSHOT" },
    ]);
    expect(table).toBe(
      [
        "| Option | Description |",
        "| --- | --- |",
        "| `--follow`, `-f` | Stream logs |",
        "| `--mode` | AUTO_SYNC \\| SNAPSHOT |",
      ].join("\n"),
    );
  });

  test("escapes angle brackets so they don't render as HTML", () => {
    const table = renderOptionsTable([
      { long: "--update-mask", description: "Fields to update, e.g. <field>" },
    ]);
    expect(table).toBe(
      [
        "| Option | Description |",
        "| --- | --- |",
        "| `--update-mask` | Fields to update, e.g. &lt;field> |",
      ].join("\n"),
    );
  });

  test("returns empty string for no flags", () => {
    expect(renderOptionsTable([])).toBe("");
  });
});
