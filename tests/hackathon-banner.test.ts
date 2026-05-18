import { describe, expect, test } from "vitest";
import {
  getHackathonBannerConfig,
  resolveHackathonBannerActive,
  type HackathonBannerEnv,
} from "../src/lib/hackathon-banner-server";

const INSIDE = new Date("2026-06-15T12:00:00Z");
const BEFORE = new Date("2026-05-01T12:00:00Z");
const AFTER = new Date("2026-08-01T12:00:00Z");
const ON_START_MIDNIGHT = new Date("2026-06-10T00:00:00Z");
const ON_END_LAST_MS = new Date("2026-06-20T23:59:59.999Z");
const JUST_BEFORE_START = new Date("2026-06-09T23:59:59.999Z");
const JUST_AFTER_END = new Date("2026-06-21T00:00:00.000Z");

const WINDOW = {
  HACKATHON_START: "2026-06-10",
  HACKATHON_END: "2026-06-20",
} satisfies HackathonBannerEnv;

describe("resolveHackathonBannerActive", () => {
  test("returns false when no env vars are set", () => {
    expect(resolveHackathonBannerActive({}, INSIDE)).toBe(false);
  });

  test('HACKATHON_BANNER_ENABLED="true" forces on, ignoring dates', () => {
    expect(
      resolveHackathonBannerActive(
        { HACKATHON_BANNER_ENABLED: "true" },
        BEFORE,
      ),
    ).toBe(true);
    expect(
      resolveHackathonBannerActive(
        { HACKATHON_BANNER_ENABLED: "true", ...WINDOW },
        AFTER,
      ),
    ).toBe(true);
  });

  test('HACKATHON_BANNER_ENABLED="false" forces off, ignoring dates', () => {
    expect(
      resolveHackathonBannerActive(
        { HACKATHON_BANNER_ENABLED: "false", ...WINDOW },
        INSIDE,
      ),
    ).toBe(false);
  });

  test("non-boolean enable values fall through to the date window", () => {
    for (const value of ["1", "yes", "True", "TRUE", ""]) {
      expect(
        resolveHackathonBannerActive(
          { HACKATHON_BANNER_ENABLED: value, ...WINDOW },
          INSIDE,
        ),
      ).toBe(true);
      expect(
        resolveHackathonBannerActive(
          { HACKATHON_BANNER_ENABLED: value, ...WINDOW },
          BEFORE,
        ),
      ).toBe(false);
    }
  });

  test("date window is inclusive on both ends", () => {
    expect(resolveHackathonBannerActive(WINDOW, ON_START_MIDNIGHT)).toBe(true);
    expect(resolveHackathonBannerActive(WINDOW, ON_END_LAST_MS)).toBe(true);
    expect(resolveHackathonBannerActive(WINDOW, INSIDE)).toBe(true);
  });

  test("date window excludes times outside the range", () => {
    expect(resolveHackathonBannerActive(WINDOW, BEFORE)).toBe(false);
    expect(resolveHackathonBannerActive(WINDOW, AFTER)).toBe(false);
    expect(resolveHackathonBannerActive(WINDOW, JUST_BEFORE_START)).toBe(false);
    expect(resolveHackathonBannerActive(WINDOW, JUST_AFTER_END)).toBe(false);
  });

  test("requires both start and end to be set", () => {
    expect(
      resolveHackathonBannerActive({ HACKATHON_START: "2026-06-10" }, INSIDE),
    ).toBe(false);
    expect(
      resolveHackathonBannerActive({ HACKATHON_END: "2026-06-20" }, INSIDE),
    ).toBe(false);
  });

  test("rejects start > end", () => {
    expect(
      resolveHackathonBannerActive(
        { HACKATHON_START: "2026-06-20", HACKATHON_END: "2026-06-10" },
        INSIDE,
      ),
    ).toBe(false);
  });

  test("rejects malformed or non-ISO dates", () => {
    for (const [start, end] of [
      ["06/10/2026", "06/20/2026"],
      ["2026-6-10", "2026-6-20"],
      ["not-a-date", "2026-06-20"],
      ["2026-06-10", "not-a-date"],
      ["2026-13-01", "2026-13-20"],
    ] as const) {
      expect(
        resolveHackathonBannerActive(
          { HACKATHON_START: start, HACKATHON_END: end },
          INSIDE,
        ),
      ).toBe(false);
    }
  });
});

describe("getHackathonBannerConfig", () => {
  test("returns undefined when inactive", () => {
    expect(getHackathonBannerConfig({}, INSIDE)).toBeUndefined();
  });

  test("returns a brand-styled, non-dismissible config when active", () => {
    const config = getHackathonBannerConfig(
      { HACKATHON_BANNER_ENABLED: "true" },
      INSIDE,
    );
    expect(config).toBeDefined();
    expect(config?.id).toBe("hackathon-2026");
    expect(config?.isCloseable).toBe(false);
    expect(config?.backgroundColor).toBe("var(--db-lava)");
    expect(config?.textColor).toBe("#ffffff");
    expect(config?.content).toContain('href="/hackathon"');
  });

  test("HACKATHON_BANNER_TEXT overrides only the lead text; link is always appended", () => {
    const config = getHackathonBannerConfig(
      {
        HACKATHON_BANNER_ENABLED: "true",
        HACKATHON_BANNER_TEXT: "Custom message",
      },
      INSIDE,
    );
    expect(config?.content).toContain("Custom message");
    expect(config?.content).toContain('href="/hackathon"');
    expect(config?.content).toContain("See resources");
    expect(config?.content).not.toContain(
      "Databricks Developer Hackathon is live",
    );
  });

  test("trims trailing whitespace from HACKATHON_BANNER_TEXT before appending the link", () => {
    const config = getHackathonBannerConfig(
      {
        HACKATHON_BANNER_ENABLED: "true",
        HACKATHON_BANNER_TEXT: "Custom message   ",
      },
      INSIDE,
    );
    expect(config?.content).toBe(
      'Custom message <a href="/hackathon"><b>See resources &rarr;</b></a>',
    );
  });

  test("default lead text is used when HACKATHON_BANNER_TEXT is unset", () => {
    const config = getHackathonBannerConfig(
      { HACKATHON_BANNER_ENABLED: "true" },
      INSIDE,
    );
    expect(config?.content).toContain(
      "Databricks Developer Hackathon is live.",
    );
    expect(config?.content).toContain('href="/hackathon"');
  });
});
