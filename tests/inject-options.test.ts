import { describe, expect, test } from "vitest";

import {
  findMarkedCommands,
  injectOptionsTables,
} from "../scripts/lib/inject-options";

const TABLE = "| Option | Description |\n| --- | --- |\n| `--foo` | does foo |";

describe("findMarkedCommands", () => {
  test("finds every marked command", () => {
    const doc = [
      "# Doc",
      "<!-- cli-options:apps deploy -->",
      "<!-- /cli-options -->",
      "text",
      "<!-- cli-options:apps logs -->",
      "old table",
      "<!-- /cli-options -->",
    ].join("\n");
    expect(findMarkedCommands(doc)).toEqual(["apps deploy", "apps logs"]);
  });
});

describe("injectOptionsTables", () => {
  test("fills an empty marker region with canonical spacing", () => {
    const doc =
      "before\n<!-- cli-options:apps deploy -->\n<!-- /cli-options -->\nafter";
    const { text, replaced } = injectOptionsTables(doc, {
      "apps deploy": TABLE,
    });
    expect(replaced).toEqual(["apps deploy"]);
    expect(text).toBe(
      `before\n<!-- cli-options:apps deploy -->\n${TABLE}\n<!-- /cli-options -->\nafter`,
    );
  });

  test("is idempotent: replacing an already-filled region reproduces it", () => {
    const doc =
      "before\n<!-- cli-options:apps deploy -->\n<!-- /cli-options -->\nafter";
    const once = injectOptionsTables(doc, { "apps deploy": TABLE }).text;
    const twice = injectOptionsTables(once, { "apps deploy": TABLE }).text;
    expect(twice).toBe(once);
  });

  test("replaces stale table content between markers", () => {
    const doc =
      "<!-- cli-options:apps deploy -->\nOLD STALE TABLE\nmore old\n<!-- /cli-options -->";
    const { text } = injectOptionsTables(doc, { "apps deploy": TABLE });
    expect(text).not.toContain("OLD STALE TABLE");
    expect(text).toContain(TABLE);
  });

  test("leaves a region untouched and reports it when no table is provided", () => {
    const doc = "<!-- cli-options:apps get -->\nkeep me\n<!-- /cli-options -->";
    const { text, replaced, missing } = injectOptionsTables(doc, {});
    expect(replaced).toEqual([]);
    expect(missing).toEqual(["apps get"]);
    expect(text).toBe(doc);
  });
});
