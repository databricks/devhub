import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";

type ImportEntry = {
  name: string;
  source: string;
};

const IMPORT_RE = /^import\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?\s*$/;

function parseImportLine(line: string): ImportEntry | undefined {
  const match = line.match(IMPORT_RE);
  if (!match) return undefined;
  return { name: match[1], source: match[2] };
}

function isLocalMdxImport(source: string): boolean {
  return source.startsWith("./") || source.startsWith("../");
}

function resolveImportContent(
  source: string,
  fileDir: string,
): string | undefined {
  const resolved = resolve(fileDir, source);
  if (!existsSync(resolved)) return undefined;
  return readFileSync(resolved, "utf-8").trim();
}

/**
 * Expand local MDX partial imports into inline markdown content and
 * strip all remaining import statements and unresolved JSX tags so the
 * output is plain markdown suitable for AI agents.
 *
 * Handles:
 *   import Foo from "./_foo.mdx";  +  <Foo />  →  inlined content
 *   import { X } from "@pkg";  →  stripped
 *   <SomeComponent prop="val" />  →  stripped (non-content JSX)
 */
export function expandMdxImports(content: string, filePath: string): string {
  const fileDir = dirname(filePath);
  const lines = content.split("\n");

  const localImports = new Map<string, string>();
  const outputLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      outputLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      outputLines.push(line);
      continue;
    }

    if (line.trimStart().startsWith("import ")) {
      const entry = parseImportLine(line.trim());
      if (entry && isLocalMdxImport(entry.source)) {
        const imported = resolveImportContent(entry.source, fileDir);
        if (imported) {
          localImports.set(entry.name, imported);
        }
      }
      continue;
    }

    outputLines.push(line);
  }

  let result = outputLines.join("\n");

  for (const [name, replacement] of localImports) {
    const selfClosing = new RegExp(`<${name}\\s*/>`, "g");
    result = result.replace(selfClosing, replacement);

    const withChildren = new RegExp(`<${name}\\s*>[\\s\\S]*?</${name}>`, "g");
    result = result.replace(withChildren, replacement);
  }

  result = result.replace(/^[ \t]*<[A-Z]\w*(?:\s[^>]*)?\/>\s*$/gm, "");
  result = result.replace(/^[ \t]*<[A-Z]\w*(?:\s[^>]*)?>[ \t]*$/gm, (match) => {
    const label = match.match(/label="([^"]*)"/);
    return label ? `### ${label[1]}` : "";
  });
  result = result.replace(/^[ \t]*<\/[A-Z]\w*>[ \t]*$/gm, "");

  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim() + "\n";
}
