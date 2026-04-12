import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  prependLlmsReference,
  getDetailMarkdown,
  type MarkdownSection,
} from "./content-markdown";

function parseSection(section: unknown): MarkdownSection {
  if (
    section === "docs" ||
    section === "recipes" ||
    section === "solutions" ||
    section === "examples" ||
    section === "templates" ||
    section === "resources"
  ) {
    return section;
  }
  throw new Error(
    'Invalid section. Expected one of: "docs", "recipes", "solutions", "examples", "templates", "resources".',
  );
}

/**
 * Serves markdown content for any doc/resource/solution/template page.
 * Reached via .md URL rewrites (vercel.json) or content negotiation (middleware.ts).
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const section = String(req.query.section || "");
  const slug = String(req.query.slug || "");
  const requestedPath = slug ? `/${section}/${slug}.md` : `/${section}.md`;

  try {
    const parsed = parseSection(req.query.section);
    const markdown = getDetailMarkdown(parsed, slug);
    const host = req.headers.host ?? "dev.databricks.com";
    const withRef = prependLlmsReference(markdown, host);

    const filename = slug ? `${slug.replace(/\//g, "-")}.md` : `${parsed}.md`;
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    res.setHeader("Vary", "Accept");
    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.status(200).send(withRef);
  } catch {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Vary", "Accept");
    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader("Content-Disposition", 'inline; filename="not-found.md"');
    res
      .status(404)
      .send(
        [
          "# Page not found",
          "",
          `\`${requestedPath}\` does not exist.`,
          "",
          "- [Site index](/llms.txt): Table of contents for all documentation, guides, and examples",
          "- [All resources](/resources.md): Guides and examples for building on Databricks",
          "- [All solutions](/solutions.md): Use-case solutions",
          "- [Start here](/docs/start-here.md): Site orientation and getting started guide",
          "",
        ].join("\n"),
      );
  }
}
