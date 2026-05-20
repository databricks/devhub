import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, relative, resolve } from "path";
import { describe, expect, test } from "vitest";

/**
 * Vercel functions are bundled with `@vercel/node`, which runs the compiled
 * JS under plain Node.js. Webpack-style path aliases like `@/lib/...` (set up
 * by the Docusaurus build and the vitest config) are NOT resolved at runtime,
 * so any *value* import using `@/` in a file reachable from `api/*.ts` will
 * crash the function at module load with `Cannot find module "@/..."`.
 *
 * This test walks every relative import starting from each `api/*.ts`
 * entrypoint and fails if it finds a `@/` import anywhere in the closure —
 * including type-only ones, because the May 2026 regression flipped a
 * `import type { ContentSections } from "@/..."` into a value import by
 * adding one named binding to the same statement, and nothing flagged it
 * until the function crashed in production.
 *
 * Outside of the API closure (React components, Docusaurus plugins, hooks)
 * `@/` aliases are fine — webpack resolves them at build time.
 */

const ROOT = resolve(__dirname, "..");
const API_DIR = resolve(ROOT, "api");

function listApiEntrypoints(): string[] {
  return readdirSync(API_DIR)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => resolve(API_DIR, name));
}

function resolveRelativeImport(
  fromFile: string,
  spec: string,
): string | undefined {
  const base = resolve(dirname(fromFile), spec);
  const candidates = [
    base, // explicit extension (rare but legal)
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, "index.ts"),
    resolve(base, "index.tsx"),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

const IMPORT_SOURCE_PATTERN = /\bfrom\s+["']([^"']+)["']/g;

function findImportSources(source: string): string[] {
  const sources: string[] = [];
  for (const match of source.matchAll(IMPORT_SOURCE_PATTERN)) {
    sources.push(match[1]);
  }
  return sources;
}

/** Walks every transitive relative dependency. Returns the set of file paths. */
function collectClosure(entrypoints: string[]): Set<string> {
  const closure = new Set<string>();
  const stack = [...entrypoints];
  while (stack.length > 0) {
    const file = stack.pop()!;
    if (closure.has(file)) continue;
    closure.add(file);

    const source = readFileSync(file, "utf-8");
    for (const spec of findImportSources(source)) {
      if (!spec.startsWith(".")) continue;
      const resolved = resolveRelativeImport(file, spec);
      if (resolved && !closure.has(resolved)) {
        stack.push(resolved);
      }
    }
  }
  return closure;
}

const ALIAS_IMPORT_PATTERN =
  /^\s*(?:import|export)\b[^;]*?\bfrom\s+["'](@\/[^"']+)["']/gm;

type AliasViolation = {
  file: string;
  statement: string;
  spec: string;
};

function findAliasViolations(files: Iterable<string>): AliasViolation[] {
  const violations: AliasViolation[] = [];
  for (const file of files) {
    const source = readFileSync(file, "utf-8");
    for (const match of source.matchAll(ALIAS_IMPORT_PATTERN)) {
      violations.push({
        file: relative(ROOT, file),
        statement: match[0].trim().replace(/\s+/g, " "),
        spec: match[1],
      });
    }
  }
  return violations;
}

describe("api import graph", () => {
  // Regression guard for the May 2026 outage where a value-import using the
  // `@/` webpack alias landed in src/lib/cookbook-composition.ts. Docusaurus
  // resolved it at build time, vitest resolved it via vitest.config.ts, but
  // Vercel's @vercel/node runtime crashed at module load with
  // `Cannot find module '@/lib/content-sections'`, breaking the hero
  // "Copy prompt for your agent" button and every /templates/<slug>.md URL.

  const entrypoints = listApiEntrypoints();

  test("discovers every api/*.ts entrypoint", () => {
    expect(entrypoints.map((path) => relative(ROOT, path)).sort()).toEqual([
      "api/bootstrap-prompt.ts",
      "api/content-markdown.ts",
      "api/llms.ts",
      "api/markdown.ts",
      "api/mcp.ts",
    ]);
  });

  test("no file reachable from api/ uses the @/ webpack alias", () => {
    const closure = collectClosure(entrypoints);
    const violations = findAliasViolations(closure);
    expect(
      violations,
      violations.length === 0
        ? ""
        : `Forbidden "@/" alias imports in API closure (use relative paths instead):\n${violations
            .map((v) => `  - ${v.file}: ${v.statement}`)
            .join("\n")}`,
    ).toEqual([]);
  });
});
