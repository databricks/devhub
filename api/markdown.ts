import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDetailMarkdown, type MarkdownSection } from "./content-markdown";

function parseSection(section: unknown): MarkdownSection {
  if (
    section === "docs" ||
    section === "solutions" ||
    section === "templates"
  ) {
    return section;
  }
  throw new Error(
    'Invalid section. Expected one of: "docs", "solutions", "templates".',
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

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    res.status(200).send(markdown);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(404).json({ error: message });
  }
}
