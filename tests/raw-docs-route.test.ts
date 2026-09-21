import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { GET } from "../src/app/raw-docs/[...slug]/route";

async function callRawDocs(path: string): Promise<Response> {
  return GET(
    new NextRequest(`https://developers.databricks.com/raw-docs/${path}`),
    {
      params: Promise.resolve({
        slug: path.split("/"),
      }),
    },
  );
}

describe("/raw-docs route", () => {
  test("strips docs frontmatter like the static raw-doc artifact", async () => {
    const response = await callRawDocs("start-here.md");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).not.toMatch(/^---\n/);
    expect(body).toMatch(/^# Start here/);
  });

  test("appends the AI feedback note with this page's path", async () => {
    const response = await callRawDocs("start-here.md");
    const body = await response.text();

    expect(body).toContain("**Note for AI assistants:**");
    expect(body).toContain('"path": "/docs/start-here"');
    expect(body).toContain("/api/feedback");
  });
});
