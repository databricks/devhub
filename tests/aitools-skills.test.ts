import { describe, expect, test } from "vitest";

import {
  firstSentence,
  renderSkillsTable,
} from "../scripts/lib/aitools-skills";

describe("firstSentence", () => {
  test("takes the first sentence of a long pushy description", () => {
    expect(
      firstSentence(
        "Build apps on Databricks Apps platform. Use when asked to create data apps. Invoke BEFORE starting.",
      ),
    ).toBe("Build apps on Databricks Apps platform.");
  });

  test("returns the whole string when there is no sentence break", () => {
    expect(firstSentence("Databricks SQL warehouse capabilities")).toBe(
      "Databricks SQL warehouse capabilities",
    );
  });

  test("does not split on abbreviations or version numbers", () => {
    expect(
      firstSentence(
        "Build eval datasets and demo documents (e.g. tables, forms). Use when generating data.",
      ),
    ).toBe("Build eval datasets and demo documents (e.g. tables, forms).");
    expect(firstSentence("Requires CLI v1.0 or newer. Install it first.")).toBe(
      "Requires CLI v1.0 or newer.",
    );
  });
});

describe("renderSkillsTable", () => {
  test("renders a sorted markdown table with escaped pipes", () => {
    const table = renderSkillsTable([
      {
        name: "databricks-core",
        description: "CLI operations. The parent skill.",
        experimental: false,
      },
      {
        name: "databricks-apps",
        description: "Build apps. Use when asked | now.",
        experimental: false,
      },
    ]);
    expect(table).toBe(
      [
        "| Skill | Description |",
        "| --- | --- |",
        "| `databricks-apps` | Build apps. |",
        "| `databricks-core` | CLI operations. |",
      ].join("\n"),
    );
  });

  test("returns empty string for no skills", () => {
    expect(renderSkillsTable([])).toBe("");
  });

  test("escapes angle brackets so they don't render as HTML", () => {
    const table = renderSkillsTable([
      {
        name: "databricks-x",
        description: "Pass <value> to the tool. Use when needed.",
        experimental: false,
      },
    ]);
    expect(table).toContain(
      "| `databricks-x` | Pass &lt;value> to the tool. |",
    );
  });
});
