import { describe, expect, test } from "vitest";
import {
  routePathWithBaseUrl,
  toSiteRelativePath,
  withSiteBaseUrl,
} from "../src/lib/site-paths";

describe("routePathWithBaseUrl", () => {
  test("leaves generated Docusaurus routes at root when baseUrl is root", () => {
    expect(routePathWithBaseUrl("/", "/templates/ai-chat-app")).toBe(
      "/templates/ai-chat-app",
    );
  });

  test("prefixes generated Docusaurus routes with a configured baseUrl", () => {
    expect(routePathWithBaseUrl("/devhub/", "/templates/ai-chat-app")).toBe(
      "/devhub/templates/ai-chat-app",
    );
    expect(routePathWithBaseUrl("/devhub/", "/solutions/devhub-launch")).toBe(
      "/devhub/solutions/devhub-launch",
    );
  });

  test("does not double-prefix generated routes already under baseUrl", () => {
    expect(
      routePathWithBaseUrl("/devhub/", "/devhub/templates/ai-chat-app"),
    ).toBe("/devhub/templates/ai-chat-app");
  });
});

describe("withSiteBaseUrl", () => {
  test("prefixes API and raw markdown paths for subpath deployments", () => {
    expect(withSiteBaseUrl("/api/bootstrap-prompt", "/devhub/")).toBe(
      "/devhub/api/bootstrap-prompt",
    );
    expect(withSiteBaseUrl("/raw-docs/start-here.md", "/devhub/")).toBe(
      "/devhub/raw-docs/start-here.md",
    );
  });

  test("leaves root deployments unchanged", () => {
    expect(withSiteBaseUrl("/api/bootstrap-prompt", "/")).toBe(
      "/api/bootstrap-prompt",
    );
  });

  test("leaves absolute and protocol-relative URLs unchanged", () => {
    expect(withSiteBaseUrl("https://example.com/x", "/devhub/")).toBe(
      "https://example.com/x",
    );
    expect(withSiteBaseUrl("//cdn.example.com/x", "/devhub/")).toBe(
      "//cdn.example.com/x",
    );
  });
});

describe("toSiteRelativePath", () => {
  test("strips baseUrl before composing public page URLs", () => {
    expect(
      toSiteRelativePath("/devhub/templates/ai-chat-app", "/devhub/"),
    ).toBe("/templates/ai-chat-app");
  });

  test("returns the site root for the baseUrl itself", () => {
    expect(toSiteRelativePath("/devhub", "/devhub/")).toBe("/");
  });

  test("leaves unprefixed paths untouched", () => {
    expect(toSiteRelativePath("/templates/ai-chat-app", "/devhub/")).toBe(
      "/templates/ai-chat-app",
    );
  });
});
