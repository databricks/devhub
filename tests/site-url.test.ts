import { describe, expect, test } from "vitest";
import {
  PRODUCTION_FALLBACK_SITE_URL,
  resolveSiteBaseUrl,
  resolveSiteOrigin,
  resolveSiteUrl,
  resolveSiteUrlForRequest,
  siteHost,
  siteUrlFromConfig,
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
    expect(resolveSiteUrl({ SITE_URL: "https://example.com/devhub/" })).toBe(
      "https://example.com/devhub",
    );
  });

  test("prepends https:// when missing", () => {
    expect(resolveSiteUrl({ SITE_URL: "example.com" })).toBe(
      "https://example.com",
    );
    expect(resolveSiteUrl({ SITE_URL: "example.com/devhub" })).toBe(
      "https://example.com/devhub",
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

describe("resolveSiteOrigin", () => {
  test("returns only the origin even when SITE_URL includes a path", () => {
    expect(
      resolveSiteOrigin({ SITE_URL: "https://stage.databricks.com/devhub" }),
    ).toBe("https://stage.databricks.com");
  });
});

describe("resolveSiteBaseUrl", () => {
  test("returns root when SITE_URL has no path", () => {
    expect(resolveSiteBaseUrl({ SITE_URL: "https://dev.databricks.com" })).toBe(
      "/",
    );
  });

  test("returns the configured path with a trailing slash", () => {
    expect(
      resolveSiteBaseUrl({ SITE_URL: "https://stage.databricks.com/devhub" }),
    ).toBe("/devhub/");
  });
});

describe("siteUrlFromConfig", () => {
  test("recombines Docusaurus url and baseUrl", () => {
    expect(siteUrlFromConfig("https://stage.databricks.com", "/devhub/")).toBe(
      "https://stage.databricks.com/devhub",
    );
    expect(siteUrlFromConfig("https://dev.databricks.com", "/")).toBe(
      "https://dev.databricks.com",
    );
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
    expect(resolveSiteUrlForRequest("127.0.0.1:3001", {})).toBe(
      "http://127.0.0.1:3001",
    );
  });

  test("preserves configured SITE_URL base path with request host", () => {
    expect(
      resolveSiteUrlForRequest("stage.databricks.com", {
        SITE_URL: "https://stage.databricks.com/devhub",
      }),
    ).toBe("https://stage.databricks.com/devhub");
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
    expect(siteHost({ SITE_URL: "https://stage.databricks.com/devhub" })).toBe(
      "stage.databricks.com",
    );
    expect(siteHost({ SITE_URL: "http://localhost:3001" })).toBe(
      "localhost:3001",
    );
  });
});
