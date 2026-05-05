import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

type VercelConfig = {
  rewrites: Array<{ source: string; destination: string }>;
  headers: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
};

const config = JSON.parse(
  readFileSync(resolve(__dirname, "..", "vercel.json"), "utf-8"),
) as VercelConfig;

function expectRewrite(source: string, destination: string): void {
  expect(config.rewrites).toContainEqual({ source, destination });
}

describe("vercel rewrites", () => {
  test("serves DevHub from /devhub while preserving Docusaurus baseUrl links", () => {
    expectRewrite("/devhub", "/");
    expectRewrite("/devhub/", "/");
    expectRewrite("/devhub/(.*)", "/$1");
  });

  test("serves DevHub API functions under /devhub/api", () => {
    expectRewrite("/devhub/api/(.*)", "/api/$1");
  });

  test("keeps markdown export routes working under /devhub", () => {
    expectRewrite("/devhub/docs/llms.txt", "/llms.txt");
    expectRewrite(
      "/devhub/docs/(.+)\\.md",
      "/api/markdown?section=docs&slug=$1",
    );
    expectRewrite(
      "/devhub/templates/(.+)\\.md",
      "/api/markdown?section=templates&slug=$1",
    );
    expectRewrite(
      "/devhub/solutions/(.+)\\.md",
      "/api/markdown?section=solutions&slug=$1",
    );
    expectRewrite(
      "/devhub/templates.md",
      "/api/markdown?section=templates&slug=",
    );
    expectRewrite(
      "/devhub/solutions.md",
      "/api/markdown?section=solutions&slug=",
    );
  });
});

describe("vercel headers", () => {
  test("applies API hardening headers to both root and /devhub API paths", () => {
    expect(config.headers).toContainEqual({
      source: "/api/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    });
    expect(config.headers).toContainEqual({
      source: "/devhub/api/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    });
  });
});
