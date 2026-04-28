import { describe, expect, test } from "vitest";
import {
  PRODUCTION_FALLBACK_SITE_URL,
  resolveSiteUrl,
  resolveSiteUrlForRequest,
  siteHost,
} from "../src/lib/site-url";

describe("resolveSiteUrl", () => {
  test("falls back to production URL when no env vars are set", () => {
    expect(resolveSiteUrl({})).toBe(PRODUCTION_FALLBACK_SITE_URL);
  });

  test("honors SITE_URL above all other signals", () => {
    expect(
      resolveSiteUrl({
        SITE_URL: "https://example.com",
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "should-be-ignored.example",
        VERCEL_URL: "should-also-be-ignored.example",
      }),
    ).toBe("https://example.com");
  });

  test("strips trailing slashes", () => {
    expect(resolveSiteUrl({ SITE_URL: "https://example.com/" })).toBe(
      "https://example.com",
    );
    expect(resolveSiteUrl({ SITE_URL: "https://example.com///" })).toBe(
      "https://example.com",
    );
  });

  test("prepends https:// when missing", () => {
    expect(resolveSiteUrl({ SITE_URL: "example.com" })).toBe(
      "https://example.com",
    );
  });

  test("preserves http:// for local URLs", () => {
    expect(resolveSiteUrl({ SITE_URL: "http://localhost:3001" })).toBe(
      "http://localhost:3001",
    );
  });

  test("uses http:// when VERCEL_URL points at localhost (vercel dev)", () => {
    expect(resolveSiteUrl({ VERCEL_URL: "localhost:3000" })).toBe(
      "http://localhost:3000",
    );
    expect(resolveSiteUrl({ VERCEL_URL: "127.0.0.1:3000" })).toBe(
      "http://127.0.0.1:3000",
    );
  });

  test("uses VERCEL_PROJECT_PRODUCTION_URL on production builds", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "dev-databricks.vercel.app",
        VERCEL_URL: "dev-databricks-abc123-databricks-web.vercel.app",
      }),
    ).toBe("https://dev-databricks.vercel.app");
  });

  test("uses VERCEL_URL on preview deployments", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "dev-databricks-git-some-branch.vercel.app",
      }),
    ).toBe("https://dev-databricks-git-some-branch.vercel.app");
  });

  test("falls back to VERCEL_URL when VERCEL_ENV is not production", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "development",
        VERCEL_PROJECT_PRODUCTION_URL: "dev-databricks.vercel.app",
        VERCEL_URL: "preview.vercel.app",
      }),
    ).toBe("https://preview.vercel.app");
  });

  test("falls back to production URL when VERCEL_PROJECT_PRODUCTION_URL is empty", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "",
      }),
    ).toBe(PRODUCTION_FALLBACK_SITE_URL);
  });

  test("ignores empty SITE_URL strings", () => {
    expect(
      resolveSiteUrl({ SITE_URL: "   ", VERCEL_URL: "preview.vercel.app" }),
    ).toBe("https://preview.vercel.app");
  });
});

describe("resolveSiteUrlForRequest", () => {
  test("uses request host with https for non-localhost", () => {
    expect(resolveSiteUrlForRequest("dev.databricks.com", {})).toBe(
      "https://dev.databricks.com",
    );
  });

  test("uses request host with http for localhost", () => {
    expect(resolveSiteUrlForRequest("localhost:3001", {})).toBe(
      "http://localhost:3001",
    );
  });

  test("falls back to resolveSiteUrl when no host header", () => {
    expect(resolveSiteUrlForRequest(undefined, {})).toBe(
      PRODUCTION_FALLBACK_SITE_URL,
    );
    expect(
      resolveSiteUrlForRequest(undefined, {
        SITE_URL: "https://example.com",
      }),
    ).toBe("https://example.com");
  });

  test("ignores empty host strings", () => {
    expect(
      resolveSiteUrlForRequest("", { SITE_URL: "https://example.com" }),
    ).toBe("https://example.com");
  });
});

describe("siteHost", () => {
  test("returns the hostname without scheme", () => {
    expect(siteHost({ SITE_URL: "https://dev.databricks.com" })).toBe(
      "dev.databricks.com",
    );
    expect(siteHost({ SITE_URL: "http://localhost:3001" })).toBe(
      "localhost:3001",
    );
  });
});
