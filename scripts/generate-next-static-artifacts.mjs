import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";

const rootDir = process.cwd();
const publicDir = join(rootDir, "public");
const docsContentDir = join(rootDir, "src", "content", "docs");
const publicDocsDir = join(publicDir, "docs");
const generatedHelperPath = join(
  rootDir,
  ".next",
  "cache",
  "static-artifacts-helper.mjs",
);
const PUBLIC_ASSET_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

function extensionOf(fileName) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

function toPosix(path) {
  return path.replace(/\\/g, "/");
}

function writeTextFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf-8");
}

function resetGeneratedPath(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

function copyIfExists(from, to) {
  if (!existsSync(from)) {
    return;
  }
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

function copyPublicAssetsTree(fromDir, toDir) {
  if (!existsSync(fromDir)) {
    return;
  }

  for (const entry of readdirSync(fromDir)) {
    const from = join(fromDir, entry);
    const to = join(toDir, entry);
    const stats = statSync(from);
    if (stats.isDirectory()) {
      copyPublicAssetsTree(from, to);
      continue;
    }

    if (PUBLIC_ASSET_EXTENSIONS.has(extensionOf(entry))) {
      copyIfExists(from, to);
    }
  }
}

function trimMarkdownExtension(path) {
  return path.replace(/\.(md|mdx)$/i, "");
}

function canonicalizeSlug(slug) {
  return slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug;
}

function collectDocsSlugs(directory, root = directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .flatMap((entry) => {
      const fullPath = join(directory, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        return collectDocsSlugs(fullPath, root);
      }
      if (!entry.endsWith(".md") && !entry.endsWith(".mdx")) {
        return [];
      }
      if (entry.startsWith("_")) {
        return [];
      }

      const relativePath = toPosix(relative(root, fullPath));
      const slug = canonicalizeSlug(trimMarkdownExtension(relativePath));
      if (slug.split("/").some((part) => part.startsWith("_"))) {
        return [];
      }
      return [slug];
    })
    .sort();
}

async function loadHelpers() {
  mkdirSync(dirname(generatedHelperPath), { recursive: true });
  await build({
    stdin: {
      contents: `
        export {
          renderDetailMarkdown,
        } from "./src/lib/agent-content-markdown.ts";
        export {
          getContentSlugs,
          getCookbookSlugs,
        } from "./src/lib/content-markdown.ts";
        export {
          copyRawDocs,
          generateLlmsTxt,
        } from "./src/lib/llms-txt.ts";
        export {
          buildSolutionItems,
          nativeSolutionItems,
        } from "./src/lib/solutions/solutions.ts";
        export {
          resolveSiteUrl,
        } from "./src/lib/site-url.ts";
      `,
      resolveDir: rootDir,
      sourcefile: "static-artifacts-helper.ts",
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    outfile: generatedHelperPath,
    packages: "external",
    platform: "node",
    target: "node20",
  });

  return import(pathToFileURL(generatedHelperPath).href);
}

function writeMarkdownArtifact({ helpers, section, slug, filePath, siteUrl }) {
  const body = helpers.renderDetailMarkdown(section, slug, rootDir, siteUrl);
  writeTextFile(filePath, body);
}

const helpers = await loadHelpers();
const siteUrl = helpers.resolveSiteUrl();

mkdirSync(publicDir, { recursive: true });
// /llms.txt is served by the src/app/llms.txt route handler (same output as
// /docs/llms.txt via /api/llms). Writing a static public/llms.txt here would
// collide with that route ("conflicting public file and page" — breaks dev).

for (const directory of ["docs", "raw-docs", "templates", "solutions"]) {
  resetGeneratedPath(join(publicDir, directory));
}

for (const slug of collectDocsSlugs(docsContentDir)) {
  writeMarkdownArtifact({
    helpers,
    section: "docs",
    slug,
    filePath: join(publicDir, "docs", `${slug}.md`),
    siteUrl,
  });
}

helpers.copyRawDocs(docsContentDir, join(publicDir, "raw-docs"), siteUrl);
copyPublicAssetsTree(docsContentDir, publicDocsDir);

writeMarkdownArtifact({
  helpers,
  section: "templates",
  slug: "",
  filePath: join(publicDir, "templates.md"),
  siteUrl,
});

writeMarkdownArtifact({
  helpers,
  section: "solutions",
  slug: "",
  filePath: join(publicDir, "solutions.md"),
  siteUrl,
});

for (const slug of [
  ...helpers.getCookbookSlugs(rootDir),
  ...helpers.getContentSlugs(rootDir, "recipes"),
  ...helpers.getContentSlugs(rootDir, "examples"),
]) {
  writeMarkdownArtifact({
    helpers,
    section: "templates",
    slug,
    filePath: join(publicDir, "templates", `${slug}.md`),
    siteUrl,
  });
}

for (const item of helpers.nativeSolutionItems) {
  writeMarkdownArtifact({
    helpers,
    section: "solutions",
    slug: item.id,
    filePath: join(publicDir, "solutions", `${item.id}.md`),
    siteUrl,
  });
}

const generatedSummary = [
  `${collectDocsSlugs(docsContentDir).length} docs markdown files`,
  `${helpers.getCookbookSlugs(rootDir).length} cookbook markdown files`,
  `${helpers.getContentSlugs(rootDir, "recipes").length} recipe markdown files`,
  `${helpers.getContentSlugs(rootDir, "examples").length} example markdown files`,
  `${helpers.nativeSolutionItems.length} native solution markdown files`,
];

console.log(`Generated Next static artifacts: ${generatedSummary.join(", ")}.`);
