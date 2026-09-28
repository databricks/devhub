import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { GET as GET_API } from "../src/app/api/llms/route";
import {
  GET as GET_PUBLIC,
  HEAD as HEAD_PUBLIC,
} from "../src/app/llms.txt/route";

type RawResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type LlmsRouteHandler = typeof GET_API | typeof GET_PUBLIC | typeof HEAD_PUBLIC;

async function call({
  handler = GET_API,
  path = "/api/llms",
  host = "dev-databricks.vercel.app",
}: {
  handler?: LlmsRouteHandler;
  path?: string;
  host?: string;
} = {}): Promise<RawResponse> {
  const response = handler(
    new NextRequest(`https://developers.databricks.com${path}`, {
      headers: { host },
    }),
  );
  return {
    statusCode: response.status,
    headers: Object.fromEntries(
      Array.from(response.headers.entries()).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    ),
    body: await response.text(),
  };
}

async function withSiteUrl<T>(
  siteUrl: string | undefined,
  run: () => T | Promise<T>,
): Promise<T> {
  const previous = process.env.SITE_URL;
  if (siteUrl === undefined) {
    delete process.env.SITE_URL;
  } else {
    process.env.SITE_URL = siteUrl;
  }

  try {
    return await run();
  } finally {
    if (previous === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = previous;
    }
  }
}

describe("/api/llms", () => {
  test("generates the docs index", async () => {
    const result = await call();
    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(result.headers["content-disposition"]).toBe(
      'inline; filename="llms.txt"',
    );
    expect(result.body).toContain("# Databricks Developer Hub");
    expect(result.body).toContain("/docs/start-here.md");
  });

  test("uses the configured SITE_URL origin with the request host", async () => {
    await withSiteUrl("https://developers.databricks.com/docs", async () => {
      const result = await call({ host: "127.0.0.1:4182" });
      expect(result.body).toContain(
        "https://developers.databricks.com/docs/start-here.md",
      );
      expect(result.body).toContain(
        "https://developers.databricks.com/templates/ai-chat-app.md",
      );
      expect(result.body).not.toMatch(
        /\]\(\/(?:docs|templates|api|llms\.txt)[^)]+\)/,
      );
    });
  });
});

describe("/llms.txt", () => {
  test("uses the same Next-native generator as /api/llms", async () => {
    const api = await call();
    const publicRoute = await call({
      handler: GET_PUBLIC,
      path: "/llms.txt",
    });

    expect(publicRoute.statusCode).toBe(200);
    expect(publicRoute.headers["content-type"]).toBe(
      "text/plain; charset=utf-8",
    );
    expect(publicRoute.headers["content-disposition"]).toBe(
      'inline; filename="llms.txt"',
    );
    expect(publicRoute.body).toBe(api.body);
  });

  test("supports HEAD without a response body", async () => {
    const result = await call({
      handler: HEAD_PUBLIC,
      path: "/llms.txt",
    });

    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(result.body).toBe("");
  });
});
