import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { absolutizeMarkdown } from "./copy-preamble";
import { expandMdxImports } from "./expand-mdx";
import { buildDocsFeedbackNote } from "./feedback/docs-feedback-note";

/** Maps an on-disk docs source path to its public `/docs/<slug>` URL path. */
export function docPathFromSourcePath(sourcePath: string): string {
  const normalized = sourcePath.replace(/\\/g, "/");
  const marker = "src/content/docs/";
  const index = normalized.lastIndexOf(marker);
  const relative =
    index === -1 ? normalized : normalized.slice(index + marker.length);
  const slug = relative.replace(/\.(md|mdx)$/, "").replace(/(^|\/)index$/, "");
  return slug ? `/docs/${slug}` : "/docs";
}

function normalizeRawDocSlug(rawSlug: string): string {
  const trimmed = rawSlug.trim();
  if (trimmed.endsWith(".mdx")) return trimmed.slice(0, -4);
  if (trimmed.endsWith(".md")) return trimmed.slice(0, -3);
  return trimmed;
}

function validateRawDocSlug(slug: string): void {
  if (!slug || slug.trim() === "") {
    throw new Error("Missing slug");
  }
  if (slug.includes("..")) {
    throw new Error('Invalid slug: path traversal ("..") is not allowed');
  }
  if (slug.includes("://")) {
    throw new Error("Invalid slug: absolute URLs are not allowed");
  }
  if (slug.startsWith("/")) {
    throw new Error('Invalid slug: slug must not start with "/"');
  }
}

export function buildRawDocMarkdown(
  source: string,
  sourcePath: string,
  siteOrigin: string,
): string {
  const expanded = expandMdxImports(source, sourcePath);
  const withoutFrontmatter = expanded.replace(/^---\n[\s\S]*?\n---\n*/, "");
  // Append the note before absolutizing (same order as getDetailMarkdown) so
  // both doc-markdown surfaces process it identically.
  const withNote =
    withoutFrontmatter +
    buildDocsFeedbackNote(docPathFromSourcePath(sourcePath), siteOrigin);
  return absolutizeMarkdown(withNote, siteOrigin);
}

export function readRawDocMarkdown(
  rootDir: string,
  rawSlug: string,
  siteOrigin: string,
): string {
  const slug = normalizeRawDocSlug(rawSlug);
  validateRawDocSlug(slug);

  const docsDir = resolve(rootDir, "src", "content", "docs");
  for (const extension of [".md", ".mdx"]) {
    const directPath = resolve(docsDir, `${slug}${extension}`);
    if (existsSync(directPath)) {
      return buildRawDocMarkdown(
        readFileSync(directPath, "utf-8"),
        directPath,
        siteOrigin,
      );
    }

    const indexPath = resolve(docsDir, slug, `index${extension}`);
    if (existsSync(indexPath)) {
      return buildRawDocMarkdown(
        readFileSync(indexPath, "utf-8"),
        indexPath,
        siteOrigin,
      );
    }
  }

  throw new Error(`Raw doc not found: "${slug}"`);
}
