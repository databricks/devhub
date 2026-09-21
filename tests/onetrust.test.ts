import { describe, expect, test } from "vitest";

import { resolveOneTrustEnv, resolveRudderstackKey } from "../src/lib/onetrust";

describe("resolveOneTrustEnv", () => {
  test("ONETRUST_ENV override wins over VERCEL_ENV", () => {
    expect(
      resolveOneTrustEnv({ ONETRUST_ENV: "test", VERCEL_ENV: "production" }),
    ).toBe("test");
    expect(
      resolveOneTrustEnv({ ONETRUST_ENV: "production", VERCEL_ENV: "preview" }),
    ).toBe("production");
  });

  test("VERCEL_ENV=production resolves to the production variant", () => {
    expect(resolveOneTrustEnv({ VERCEL_ENV: "production" })).toBe("production");
  });

  test("VERCEL_ENV preview and development resolve to the test variant", () => {
    expect(resolveOneTrustEnv({ VERCEL_ENV: "preview" })).toBe("test");
    expect(resolveOneTrustEnv({ VERCEL_ENV: "development" })).toBe("test");
  });

  test("no recognized env resolves to null (no tags, no banner)", () => {
    expect(resolveOneTrustEnv({})).toBe(null);
    expect(resolveOneTrustEnv({ VERCEL_ENV: "staging" })).toBe(null);
  });

  test("unrecognized ONETRUST_ENV values fall through to VERCEL_ENV", () => {
    expect(
      resolveOneTrustEnv({ ONETRUST_ENV: "on", VERCEL_ENV: "preview" }),
    ).toBe("test");
    expect(resolveOneTrustEnv({ ONETRUST_ENV: "off" })).toBe(null);
  });
});

const KEY = "test-write-key";

describe("resolveRudderstackKey", () => {
  test("null without a write key, even in production", () => {
    expect(resolveRudderstackKey({ VERCEL_ENV: "production" })).toBe(null);
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "production",
        RUDDERSTACK_WRITE_KEY: "",
      }),
    ).toBe(null);
  });

  test("VERCEL_ENV=production returns the key", () => {
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "production",
        RUDDERSTACK_WRITE_KEY: KEY,
      }),
    ).toBe(KEY);
  });

  test("previews and development are off by default, so preview traffic never reaches the production source", () => {
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "preview",
        RUDDERSTACK_WRITE_KEY: KEY,
      }),
    ).toBe(null);
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "development",
        RUDDERSTACK_WRITE_KEY: KEY,
      }),
    ).toBe(null);
  });

  test("RUDDERSTACK_ENABLED=true opts a single preview in", () => {
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "preview",
        RUDDERSTACK_WRITE_KEY: KEY,
        RUDDERSTACK_ENABLED: "true",
      }),
    ).toBe(KEY);
  });

  test('RUDDERSTACK_ENABLED only counts when it is exactly "true"', () => {
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "preview",
        RUDDERSTACK_WRITE_KEY: KEY,
        RUDDERSTACK_ENABLED: "1",
      }),
    ).toBe(null);
  });

  test("never returns a key when OneTrust is off — Rudderstack must stay consent-gated", () => {
    expect(
      resolveRudderstackKey({
        RUDDERSTACK_WRITE_KEY: KEY,
        RUDDERSTACK_ENABLED: "true",
      }),
    ).toBe(null);
    expect(
      resolveRudderstackKey({
        VERCEL_ENV: "staging",
        RUDDERSTACK_WRITE_KEY: KEY,
        RUDDERSTACK_ENABLED: "true",
      }),
    ).toBe(null);
  });

  test("ONETRUST_ENV plus the opt-in enables it locally", () => {
    expect(
      resolveRudderstackKey({
        ONETRUST_ENV: "test",
        RUDDERSTACK_WRITE_KEY: KEY,
        RUDDERSTACK_ENABLED: "true",
      }),
    ).toBe(KEY);
  });
});
