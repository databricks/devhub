import { describe, expect, test } from "vitest";
import { decompressFromEncodedURIComponent } from "lz-string";
import { getPromptTargets } from "../src/lib/prompt-targets";

describe("getPromptTargets", () => {
  test("returns an empty array when no replitPrompt is provided", () => {
    expect(getPromptTargets({})).toEqual([]);
    expect(getPromptTargets({ replitPrompt: undefined })).toEqual([]);
    expect(getPromptTargets({ replitPrompt: "" })).toEqual([]);
  });

  test("returns a single Replit target when replitPrompt is provided", () => {
    const targets = getPromptTargets({ replitPrompt: "Hello Replit" });
    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({ id: "replit", label: "Replit" });
    expect(targets[0].icon).toBeDefined();
    expect(targets[0].href).toMatch(/^https:\/\/replit\.com\/\?/);
  });

  test("Replit URL includes the required stack=Build parameter", () => {
    // The Open in Replit protocol requires stack=Build for Agent (Build) mode.
    // Without it Replit may silently fail to fill the prompt. See
    // https://docs.replit.com/references/integrations/open-in-replit.
    const targets = getPromptTargets({ replitPrompt: "Build me an app" });
    const url = new URL(targets[0].href);
    expect(url.searchParams.get("stack")).toBe("Build");
  });

  test("Replit URL includes referrer and full UTM attribution", () => {
    const targets = getPromptTargets({ replitPrompt: "x" });
    const url = new URL(targets[0].href);
    expect(url.searchParams.get("referrer")).toBe("devhub");
    expect(url.searchParams.get("utm_source")).toBe("devhub");
    expect(url.searchParams.get("utm_medium")).toBe("docs");
    expect(url.searchParams.get("utm_campaign")).toBe("run-on-replit");
    expect(url.searchParams.get("utm_content")).toBeTruthy();
  });

  test("the encoded prompt param losslessly roundtrips to the original input", () => {
    // Full pipeline: prompt text → lz-string encode → URL param → Replit's
    // decode must equal the original. If this breaks, Replit Agent sees
    // garbage instead of the template's instructions.
    const original = [
      "# Build a Databricks app on Replit",
      "",
      "Steps:",
      "1. Configure Replit Secrets `DATABRICKS_HOST` and `DATABRICKS_TOKEN`.",
      "2. Run `SELECT current_user()` to verify the warehouse.",
      "",
      "Use the Databricks palette: #FF3621, #0B2026, #EEEDE9, #F9F7F4.",
      "",
      'Ask: "Not sure — help me decide".',
    ].join("\n");
    const targets = getPromptTargets({ replitPrompt: original });
    const encoded = new URL(targets[0].href).searchParams.get("prompt");
    expect(encoded).toBeTruthy();
    expect(decompressFromEncodedURIComponent(encoded!)).toBe(original);
  });
});
