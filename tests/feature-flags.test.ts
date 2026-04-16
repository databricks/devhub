import { afterEach, describe, expect, test, vi } from "vitest";

describe("server feature flags", () => {
  afterEach(() => {
    delete process.env.SHOW_DRAFTS;
    delete process.env.EXAMPLES_FEATURE;
    vi.resetModules();
  });

  test("showDrafts returns false when env var is unset", async () => {
    const { showDrafts } = await import("../src/lib/feature-flags-server");
    expect(showDrafts()).toBe(false);
  });

  test('showDrafts returns true when env var is "true"', async () => {
    process.env.SHOW_DRAFTS = "true";
    const { showDrafts } = await import("../src/lib/feature-flags-server");
    expect(showDrafts()).toBe(true);
  });

  test('showDrafts returns true when env var is "1"', async () => {
    process.env.SHOW_DRAFTS = "1";
    const { showDrafts } = await import("../src/lib/feature-flags-server");
    expect(showDrafts()).toBe(true);
  });

  test("showDrafts returns false for arbitrary string", async () => {
    process.env.SHOW_DRAFTS = "yes";
    const { showDrafts } = await import("../src/lib/feature-flags-server");
    expect(showDrafts()).toBe(false);
  });

  test("examplesEnabled returns false when env var is unset", async () => {
    const { examplesEnabled } = await import("../src/lib/feature-flags-server");
    expect(examplesEnabled()).toBe(false);
  });

  test('examplesEnabled returns true when env var is "true"', async () => {
    process.env.EXAMPLES_FEATURE = "true";
    const { examplesEnabled } = await import("../src/lib/feature-flags-server");
    expect(examplesEnabled()).toBe(true);
  });

  test('examplesEnabled returns true when env var is "1"', async () => {
    process.env.EXAMPLES_FEATURE = "1";
    const { examplesEnabled } = await import("../src/lib/feature-flags-server");
    expect(examplesEnabled()).toBe(true);
  });
});
