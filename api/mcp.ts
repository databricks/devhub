import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { expandMdxImports } from "../src/lib/expand-mdx";

function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  throw new Error("SITE_URL or VERCEL_URL environment variable must be set");
}

const DOCS_DIR = resolve(__dirname, "..", "docs");

function validateDocSlug(slug: string): void {
  if (slug.includes("..")) {
    throw new Error('Invalid doc slug: path traversal ("..") is not allowed');
  }
  if (slug.includes("://")) {
    throw new Error("Invalid doc slug: absolute URLs are not allowed");
  }
  if (slug.startsWith("/")) {
    throw new Error('Invalid doc slug: slug must not start with "/"');
  }
}

function readDocFile(slug: string): string | undefined {
  for (const ext of [".md", ".mdx"]) {
    const filePath = resolve(DOCS_DIR, slug + ext);
    if (existsSync(filePath)) {
      return expandMdxImports(readFileSync(filePath, "utf-8"), filePath);
    }
    const indexPath = resolve(DOCS_DIR, slug, "index" + ext);
    if (existsSync(indexPath)) {
      return expandMdxImports(readFileSync(indexPath, "utf-8"), indexPath);
    }
  }
  return undefined;
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_docs_resources",
      {
        description:
          "Lists all available Databricks developer documentation pages. Returns the documentation index as markdown with page URLs and titles. Use get_doc_resource to fetch specific pages.",
      },
      async () => {
        const response = await fetch(`${getSiteUrl()}/llms.txt`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Docs index not found");
          }
          throw new Error(
            `Failed to fetch docs index: ${response.status} ${response.statusText}`,
          );
        }
        return {
          content: [{ type: "text" as const, text: await response.text() }],
        };
      },
    );

    server.registerTool(
      "get_doc_resource",
      {
        description:
          "Fetches a single Databricks developer documentation page as markdown. Use list_docs_resources first to discover available slugs.",
        inputSchema: {
          slug: z
            .string()
            .describe(
              "The docs page slug (path) to fetch, e.g. 'start-here'. Use list_docs_resources first to discover available slugs.",
            ),
        },
      },
      async ({ slug }) => {
        validateDocSlug(slug);
        const content = readDocFile(slug);
        if (!content) {
          throw new Error(`Doc page not found: "${slug}"`);
        }
        return { content: [{ type: "text" as const, text: content }] };
      },
    );
  },
  { serverInfo: { name: "devhub-docs", version: "1.0.0" } },
  { basePath: "/api", disableSse: true, maxDuration: 30 },
);

export { handler as GET, handler as POST, handler as DELETE };
