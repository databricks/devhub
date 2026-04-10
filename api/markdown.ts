import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  appendLlmsFooter,
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

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const section = parseSection(req.query.section);
    const slug = String(req.query.slug || "");
    const markdown = getDetailMarkdown(section, slug);
    const host = req.headers.host ?? "dev.databricks.com";
    const withFooter = appendLlmsFooter(markdown, host);

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    res.status(200).send(withFooter);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(404).json({ error: message });
  }
}
