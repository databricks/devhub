import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import matter from "gray-matter";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

import { absolutizeMarkdown } from "./copy-preamble";
import { expandMdxImports } from "./expand-mdx";
import { PRODUCTION_FALLBACK_SITE_URL, resolveSiteUrl } from "./site-url";

// A page's `sourceOfTruth` frontmatter names the agent skill(s) and canonical
// docs that own the product this page describes. Surface it as one compact line
// so an agent fetching the page knows what else to load for current behavior.
// The line is deliberately terse (skills + canonical for this page only); the
// convention and install command live in the tool description, so it stays
// cheap to repeat across many get_doc_resource calls.
function sourceOfTruthHint(content: string): string {
  const sot = matter(content).data.sourceOfTruth;
  if (sot === null || typeof sot !== "object") {
    return "";
  }
  const record = sot as Record<string, unknown>;
  const skills = Array.isArray(record.skills)
    ? record.skills.filter((s): s is string => typeof s === "string")
    : [];
  const docs = Array.isArray(record.docs)
    ? record.docs.filter((d): d is string => typeof d === "string")
    : [];
  const note = typeof record.note === "string" ? record.note : "";

  // Internal `/docs/...` links are DevHub-owned references (the AppKit wiring
  // authority); external links are the product's canonical docs. Labeling them
  // separately tells the agent which is which. Emit the DevHub links as absolute
  // production URLs so an agent reading the fetched page knows where they resolve
  // (the hint is plain text, so link-absolutizing does not reach it). Hardcode the
  // production origin rather than the request/env origin: the source of truth is
  // the live site, not a localhost or preview deployment.
  const isDevhub = (d: string) =>
    d.startsWith("/") || d.startsWith(PRODUCTION_FALLBACK_SITE_URL);
  const devhubDocs = docs
    .filter(isDevhub)
    .map((d) =>
      d.startsWith("/") ? `${PRODUCTION_FALLBACK_SITE_URL}${d}` : d,
    );
  const canonicalDocs = docs.filter((d) => !isDevhub(d));

  const bits: string[] = [];
  if (skills.length > 0) {
    bits.push(`skills: ${skills.join(", ")}`);
  }
  if (devhubDocs.length > 0) {
    bits.push(`DevHub: ${devhubDocs.join(", ")}`);
  }
  if (canonicalDocs.length > 0) {
    bits.push(`canonical: ${canonicalDocs.join(", ")}`);
  }
  if (bits.length === 0) {
    return "";
  }
  return `> **Source of truth:** ${bits.join(" · ")}.${note ? ` ${note}` : ""}\n\n`;
}

function docsDirectory(): string {
  return resolve(process.cwd(), "src", "content", "docs");
}

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
    const filePath = resolve(docsDirectory(), slug + ext);
    if (existsSync(filePath)) {
      return expandMdxImports(readFileSync(filePath, "utf-8"), filePath);
    }
    const indexPath = resolve(docsDirectory(), slug, "index" + ext);
    if (existsSync(indexPath)) {
      return expandMdxImports(readFileSync(indexPath, "utf-8"), indexPath);
    }
  }
  return undefined;
}

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_docs_resources",
      {
        description:
          "Lists all available Databricks developer documentation pages. Returns the documentation index as markdown with page URLs and titles. Use get_doc_resource to fetch specific pages.",
      },
      async () => {
        const response = await fetch(`${resolveSiteUrl()}/llms.txt`);
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
          "Fetches a single Databricks developer documentation page as markdown. Use list_docs_resources first to discover available slugs. DevHub pages document the AppKit wiring; a page may begin with a compact 'Source of truth' line naming the agent skill(s) to install (`databricks aitools install`) for the current behavior of the product it wires. Load those skills rather than relying on training data.",
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
        const siteUrl = resolveSiteUrl();
        return {
          content: [
            {
              type: "text" as const,
              text: absolutizeMarkdown(
                sourceOfTruthHint(content) + content,
                siteUrl,
              ),
            },
          ],
        };
      },
    );
  },
  { serverInfo: { name: "devhub-docs", version: "1.0.0" } },
  { basePath: "/api", disableSse: true, maxDuration: 30 },
);

async function handler(request: Request): Promise<Response> {
  return mcpHandler(request);
}

export { handler as GET, handler as POST, handler as DELETE };
