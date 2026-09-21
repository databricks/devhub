import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, posix, relative } from "path";
import { fileURLToPath } from "url";

import { cache, createElement, Fragment, type ReactElement } from "react";
import matter from "gray-matter";

import { renderMarkdownContent } from "@/lib/content-markdown-renderer";
import { substituteAboutDevhubLlmsUrl } from "@/lib/copy-preamble";
import { expandLocalMdxImports } from "@/lib/expand-mdx";
import { getUniqueMarkdownHeadingId } from "@/lib/markdown-heading-ids";
import { buildSeoDescription } from "@/lib/seo-description";
import { resolveSiteUrl } from "@/lib/site-url";
import { getSuggestEditsUrl } from "@/lib/suggest-edits-url";

type DocMeta = {
  suggestEditsUrl: string;
  slug: string;
  sidebarLabel: string;
  title: string;
  description: string;
  sourcePath: string;
};

type DocPage = DocMeta & {
  content: ReactElement;
  tableOfContents: Array<{ id: string; value: string; depth: number }>;
};

export type DocsSidebarItem =
  | {
      className?: string;
      icon?: string;
      label: string;
      type: "separator";
    }
  | {
      autoAddBaseUrl?: boolean;
      className?: string;
      href: string;
      label: string;
      type: "link";
    }
  | {
      className?: string;
      collapsed?: boolean;
      href?: string;
      items: DocsSidebarItem[];
      label: string;
      type: "category";
    };

type DocPaginationLink = {
  permalink: string;
  title: string;
};

type DocsSearchItem = {
  description: string;
  group: string;
  href: string;
  icon: "docs";
  id: string;
  keywords: string[];
  title: string;
};

type DocsSidebarCategory = Extract<DocsSidebarItem, { type: "category" }>;
type DocsSidebarLink = Extract<DocsSidebarItem, { type: "link" }>;

type DocsJsonObject = Record<string, unknown>;

type ResolvedSidebarItem =
  | DocsSidebarItem
  | typeof REST_SIDEBAR_ITEMS
  | typeof REST_SIDEBAR_ITEMS_REVERSED;

type PositionedContentName = {
  name: string;
  position: number | null;
};

const MARKDOWN_EXTENSIONS = [".md", ".mdx"] as const;
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = join(MODULE_DIR, "..", "content", "docs");
const DOCS_INDEX_FILE_PATTERN = /^index\.(md|mdx)$/i;
const SIDEBAR_LINK_PATTERN = /^(?:\[([^\]]+)])?\[([^\]]+)]\(([^)]+)\)$/;
const SIDEBAR_SEPARATOR_PATTERN = /^---(?:\[([^\]]+)])?(.+?)---$/;
const REST_SIDEBAR_ITEMS = "...";
const REST_SIDEBAR_ITEMS_REVERSED = "z...a";
const EXTRACT_SIDEBAR_ITEM_PREFIX = "...";
const EXCLUDE_SIDEBAR_ITEM_PREFIX = "!";
const APPKIT_API_APPKIT_SLUG_PREFIX = "appkit/v0/api/appkit";
const APPKIT_API_APPKIT_SEARCH_GROUP_RANK: Record<string, number> = {
  Class: 0,
  Enumeration: 1,
  Function: 2,
  Index: 3,
  Interface: 4,
  TypeAlias: 5,
  Variable: 6,
};
let appKitApiAppkitTypedocOrder: Map<string, number> | null = null;

function docsRoot(): string {
  return DOCS_ROOT;
}

function toPosix(path: string): string {
  return path.replace(/\\/g, "/");
}

function isMarkdownFile(path: string): boolean {
  return MARKDOWN_EXTENSIONS.some((extension) => path.endsWith(extension));
}

function trimMarkdownExtension(path: string): string {
  return path.replace(/\.(md|mdx)$/i, "");
}

function canonicalizeSlug(slug: string): string {
  return slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug;
}

function canonicalizeMarkdownPath(path: string): string {
  return canonicalizeSlug(trimMarkdownExtension(path));
}

function docSlugFromHref(href: string): string {
  return href.replace(/^\/docs\/?/, "").replace(/\/$/, "");
}

function isPublicDocSlug(slug: string): boolean {
  return slug !== "" && !slug.split("/").some((part) => part.startsWith("_"));
}

function collectMarkdownFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .flatMap((entry) => {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        return collectMarkdownFiles(fullPath);
      }
      return isMarkdownFile(fullPath) ? [fullPath] : [];
    })
    .sort();
}

function resolveDocFile(
  slug: string,
): { absolutePath: string; relativePath: string; slug: string } | null {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  const root = docsRoot();
  const candidates = MARKDOWN_EXTENSIONS.flatMap((extension) => [
    `${normalized}${extension}`,
    join(normalized, `index${extension}`),
  ]);

  for (const candidate of candidates) {
    const absolutePath = join(root, candidate);
    if (!existsSync(absolutePath)) {
      continue;
    }

    const relativePath = toPosix(relative(root, absolutePath));
    return {
      absolutePath,
      relativePath,
      slug: canonicalizeMarkdownPath(relativePath),
    };
  }

  return null;
}

function readFirstMarkdownHeading(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function readDocSource(absolutePath: string): string {
  return substituteAboutDevhubLlmsUrl(
    expandLocalMdxImports(readFileSync(absolutePath, "utf-8"), absolutePath),
    resolveSiteUrl(),
  );
}

function buildDocDescription(content: string): string {
  return buildSeoDescription(content);
}

function resolveDocSidebarLabel({
  sidebarLabel,
  slug,
  title,
}: {
  sidebarLabel?: unknown;
  slug: string;
  title: string;
}): string {
  if (typeof sidebarLabel === "string" && sidebarLabel.trim() !== "") {
    return sidebarLabel;
  }

  if (slug.startsWith("appkit/v0/api/") && title.startsWith("@databricks/")) {
    return slug.split("/").at(-1) ?? title;
  }

  return title;
}

function readDocMetaFromFile(absolutePath: string, slug: string): DocMeta {
  const source = readDocSource(absolutePath);
  const { data, content } = matter(source);
  const relativeDocsPath = toPosix(relative(docsRoot(), absolutePath));
  const title =
    typeof data.title === "string" && data.title.trim() !== ""
      ? data.title
      : (readFirstMarkdownHeading(content) ??
        slug.split("/").at(-1)?.replace(/-/g, " ") ??
        "Documentation");
  const description =
    typeof data.description === "string" && data.description.trim() !== ""
      ? data.description
      : buildDocDescription(content);
  const sidebarLabel = resolveDocSidebarLabel({
    sidebarLabel: data.sidebar_label,
    slug,
    title,
  });

  return {
    suggestEditsUrl: getSuggestEditsUrl(relativeDocsPath),
    slug,
    sidebarLabel,
    title,
    description,
    sourcePath: `src/content/docs/${relativeDocsPath}`,
  };
}

function titleFromSlug(slug: string): string {
  const lastPart = slug.split("/").at(-1);
  if (!lastPart) {
    return "Documentation";
  }
  if (lastPart.toLowerCase() === "appkit") {
    return "AppKit";
  }

  return lastPart
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAppKitApiAppkitTypedocOrder(): Map<string, number> {
  if (appKitApiAppkitTypedocOrder) {
    return appKitApiAppkitTypedocOrder;
  }

  const sidebarPath = join(
    docsRoot(),
    "appkit",
    "v0",
    "api",
    "appkit",
    "typedoc-sidebar.ts",
  );

  if (!existsSync(sidebarPath)) {
    appKitApiAppkitTypedocOrder = new Map();
    return appKitApiAppkitTypedocOrder;
  }

  const sidebar = readFileSync(sidebarPath, "utf-8");
  const ids = Array.from(
    sidebar.matchAll(/id:\s*"api\/appkit\/([^"]+)"/g),
    (match) => `${APPKIT_API_APPKIT_SLUG_PREFIX}/${match[1]}`,
  );

  appKitApiAppkitTypedocOrder = new Map(
    ids.map((slug, index) => [slug, index]),
  );
  return appKitApiAppkitTypedocOrder;
}

function getAppKitApiAppkitSearchGroupRank(slug: string): number | null {
  if (slug === APPKIT_API_APPKIT_SLUG_PREFIX) {
    return APPKIT_API_APPKIT_SEARCH_GROUP_RANK.Index;
  }

  if (!slug.startsWith(`${APPKIT_API_APPKIT_SLUG_PREFIX}/`)) {
    return null;
  }

  const fileName = slug.slice(APPKIT_API_APPKIT_SLUG_PREFIX.length + 1);
  const group = fileName.split(".")[0];

  return APPKIT_API_APPKIT_SEARCH_GROUP_RANK[group] ?? null;
}

function compareDocSearchSlugs(a: string, b: string): number {
  const aRank = getAppKitApiAppkitSearchGroupRank(a);
  const bRank = getAppKitApiAppkitSearchGroupRank(b);

  if (aRank === null || bRank === null) {
    return 0;
  }

  if (aRank !== bRank) {
    return aRank - bRank;
  }

  const typedocOrder = getAppKitApiAppkitTypedocOrder();
  const aOrder = typedocOrder.get(a);
  const bOrder = typedocOrder.get(b);

  if (aOrder !== undefined && bOrder !== undefined) {
    return aOrder - bOrder;
  }

  return a.localeCompare(b);
}

function toDocSearchGroup(slug: string): string {
  const [section] = slug.split("/");

  if (!section) {
    return "Docs";
  }

  return section
    .replaceAll(/[-_]/g, " ")
    .replaceAll(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

function toDocSearchTitle(slug: string): string {
  const lastPart = slug.split("/").filter(Boolean).at(-1);

  if (!lastPart) {
    return slug;
  }

  return lastPart
    .replaceAll(/[-_]/g, " ")
    .replaceAll(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

function getDocTitle(slug: string): string {
  return getDocPostMetaBySlug(slug)?.title ?? titleFromSlug(slug);
}

function getDocSidebarLabel(slug: string): string {
  return getDocPostMetaBySlug(slug)?.sidebarLabel ?? titleFromSlug(slug);
}

function toLabel(value: string): string {
  return value.replaceAll(/[-_]/g, " ").replaceAll(/\s+/g, " ").trim();
}

function readSidebarPosition(filePath: string): number | null {
  const content = readFileSync(filePath, "utf-8");
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  const position = match[1].match(/^sidebar_position:\s*(\d+)/m);
  return position ? Number(position[1]) : null;
}

function isJsonObject(value: unknown): value is DocsJsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJsonObject(filePath: string): DocsJsonObject | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const value = JSON.parse(readFileSync(filePath, "utf-8")) as unknown;
  return isJsonObject(value) ? value : null;
}

function readStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function readCategoryPosition(dirPath: string): number | null {
  const data = readJsonObject(join(dirPath, "_category_.json"));
  return typeof data?.position === "number" ? data.position : null;
}

function toDocHref(slug: string): string {
  return `/docs/${slug}`;
}

function isIndexDocName(name: string): boolean {
  return DOCS_INDEX_FILE_PATTERN.test(name.split("/").at(-1) ?? name);
}

function normalizeDocRelativePath(path: string): string {
  return toPosix(path).replace(/^\/+|\/+$/g, "");
}

function readDocsDirectoryNames(relativeDir: string): string[] | null {
  const absoluteDir = join(docsRoot(), relativeDir);
  if (!existsSync(absoluteDir)) {
    return null;
  }

  return readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) {
      return [];
    }

    if (entry.isDirectory()) {
      return [`${entry.name}/`];
    }

    if (
      entry.isFile() &&
      (entry.name === "meta.json" || isMarkdownFile(entry.name))
    ) {
      return [entry.name];
    }

    return [];
  });
}

function readFolderMeta(relativeDir: string): DocsJsonObject | null {
  return readJsonObject(join(docsRoot(), relativeDir, "meta.json"));
}

function readCategoryMeta(relativeDir: string): DocsJsonObject | null {
  return readJsonObject(join(docsRoot(), relativeDir, "_category_.json"));
}

function readMetaPages(meta: DocsJsonObject | null): string[] | null {
  if (!Array.isArray(meta?.pages)) {
    return null;
  }

  return meta.pages.filter((page): page is string => typeof page === "string");
}

function getFolderCollapsed(
  meta: DocsJsonObject | null,
  category: DocsJsonObject | null,
): boolean | undefined {
  if (typeof meta?.defaultOpen === "boolean") {
    return meta.defaultOpen ? false : true;
  }

  return category?.collapsed === true ? true : undefined;
}

function getContentPosition(baseDir: string, name: string): number | null {
  if (isMarkdownFile(name)) {
    return readSidebarPosition(join(docsRoot(), baseDir, name));
  }

  if (name.endsWith("/")) {
    return readCategoryPosition(join(docsRoot(), baseDir, name.slice(0, -1)));
  }

  return null;
}

function sortContentNames(
  names: string[],
  baseDir: string,
  reversed: boolean,
): string[] {
  return names
    .map((name): PositionedContentName => ({
      name,
      position: getContentPosition(baseDir, name),
    }))
    .sort((a, b) => {
      if (a.position !== null && b.position !== null) {
        return (a.position - b.position) * (reversed ? -1 : 1);
      }
      if (a.position !== null) {
        return -1;
      }
      if (b.position !== null) {
        return 1;
      }
      return a.name.localeCompare(b.name) * (reversed ? -1 : 1);
    })
    .map((entry) => entry.name);
}

function buildMarkdownFileSidebarItem(
  relativeFile: string,
): DocsSidebarLink | null {
  const normalizedFile = normalizeDocRelativePath(relativeFile);
  const absoluteFile = join(docsRoot(), normalizedFile);
  if (!existsSync(absoluteFile) || !isMarkdownFile(normalizedFile)) {
    return null;
  }

  const slug = canonicalizeMarkdownPath(normalizedFile);
  if (!isPublicDocSlug(slug)) {
    return null;
  }

  return {
    href: toDocHref(slug),
    label: getDocSidebarLabel(slug),
    type: "link",
  };
}

function buildMarkdownFileSidebarItemFromBase(
  relativeBase: string,
): DocsSidebarLink | null {
  if (isMarkdownFile(relativeBase)) {
    return buildMarkdownFileSidebarItem(relativeBase);
  }

  for (const extension of MARKDOWN_EXTENSIONS) {
    const item = buildMarkdownFileSidebarItem(`${relativeBase}${extension}`);
    if (item) {
      return item;
    }
  }

  return null;
}

function buildIndexSidebarItem(relativeDir: string): DocsSidebarLink | null {
  for (const extension of MARKDOWN_EXTENSIONS) {
    const item = buildMarkdownFileSidebarItem(
      posix.join(relativeDir, `index${extension}`),
    );
    if (item) {
      return item;
    }
  }

  return null;
}

function buildAllSidebarItems(
  names: string[],
  baseDir: string,
  filter?: (name: string) => boolean,
  reversed = false,
): DocsSidebarItem[] {
  const contentNames = sortContentNames(
    names.filter((name) => name !== "meta.json" && (!filter || filter(name))),
    baseDir,
    reversed,
  );
  const output: DocsSidebarItem[] = [];

  for (const name of contentNames) {
    if (isMarkdownFile(name)) {
      const item = buildMarkdownFileSidebarItem(posix.join(baseDir, name));
      if (item) {
        output.push(item);
      }
      continue;
    }

    if (name.endsWith("/")) {
      const item = buildFolderSidebarItem(
        posix.join(baseDir, name.slice(0, -1)),
        false,
      );
      if (item) {
        output.push(item);
      }
    }
  }

  return output;
}

function removeRestContentNames(restNames: Set<string>, rawName: string): void {
  if (rawName.startsWith("/")) {
    return;
  }

  const normalizedName = normalizeDocRelativePath(rawName);
  const withoutTrailingSlash = normalizedName.replace(/\/$/, "");
  const candidates = new Set([
    normalizedName,
    withoutTrailingSlash,
    `${withoutTrailingSlash}.md`,
    `${withoutTrailingSlash}.mdx`,
    `${withoutTrailingSlash}/`,
  ]);

  for (const candidate of candidates) {
    restNames.delete(candidate);
  }
}

function resolveFolderItem(
  folderPath: string,
  item: string,
  restNames: Set<string>,
):
  | DocsSidebarItem[]
  | typeof REST_SIDEBAR_ITEMS
  | typeof REST_SIDEBAR_ITEMS_REVERSED {
  if (item === REST_SIDEBAR_ITEMS || item === REST_SIDEBAR_ITEMS_REVERSED) {
    return item;
  }

  if (item === "---") {
    return [{ label: "", type: "separator" }];
  }

  const separatorMatch = SIDEBAR_SEPARATOR_PATTERN.exec(item);
  if (separatorMatch) {
    return [
      {
        icon: readStringValue(separatorMatch[1]),
        label: separatorMatch[2].trim(),
        type: "separator",
      },
    ];
  }

  const linkMatch = SIDEBAR_LINK_PATTERN.exec(item);
  if (linkMatch) {
    return [
      {
        href: linkMatch[3],
        label: linkMatch[2],
        type: "link",
      },
    ];
  }

  const isExcluded = item.startsWith(EXCLUDE_SIDEBAR_ITEM_PREFIX);
  const isExtracted =
    !isExcluded && item.startsWith(EXTRACT_SIDEBAR_ITEM_PREFIX);
  const rawName = isExcluded
    ? item.slice(EXCLUDE_SIDEBAR_ITEM_PREFIX.length)
    : isExtracted
      ? item.slice(EXTRACT_SIDEBAR_ITEM_PREFIX.length)
      : item;

  removeRestContentNames(restNames, rawName);

  if (isExcluded) {
    return [];
  }

  const normalizedName = normalizeDocRelativePath(rawName);
  const fullBase = rawName.startsWith("/")
    ? normalizedName
    : normalizeDocRelativePath(posix.join(folderPath, normalizedName));
  const folder = buildFolderSidebarItem(fullBase, false);

  if (folder) {
    return isExtracted ? folder.items : [folder];
  }

  const file = buildMarkdownFileSidebarItemFromBase(fullBase);
  return file ? [file] : [];
}

function buildFolderSidebarItem(
  relativeDir: string,
  isGlobalRoot: boolean,
): DocsSidebarCategory | null {
  const folderPath = normalizeDocRelativePath(relativeDir);
  const names = readDocsDirectoryNames(folderPath);
  if (!names) {
    return null;
  }

  const meta = readFolderMeta(folderPath);
  const category = readCategoryMeta(folderPath);
  const metaPages = readMetaPages(meta);
  const isRoot = typeof meta?.root === "boolean" ? meta.root : isGlobalRoot;
  const children = metaPages
    ? buildSidebarItemsFromMetaPages(folderPath, names, metaPages, isRoot)
    : buildAllSidebarItems(
        names,
        folderPath,
        (name) => isRoot || !isIndexDocName(name),
      );
  const index = buildIndexSidebarItem(folderPath);

  if (!index && children.length === 0) {
    return null;
  }

  return {
    collapsed: getFolderCollapsed(meta, category),
    href: index?.type === "link" ? index.href : undefined,
    items: children,
    label:
      readStringValue(meta?.title) ??
      readStringValue(category?.label) ??
      index?.label ??
      titleFromSlug(folderPath),
    type: "category",
  };
}

function buildSidebarItemsFromMetaPages(
  folderPath: string,
  names: string[],
  pages: string[],
  isRoot: boolean,
): DocsSidebarItem[] {
  const restNames = new Set(names);
  const processed: ResolvedSidebarItem[] = [];

  for (const page of pages) {
    const item = resolveFolderItem(folderPath, page, restNames);
    processed.push(...(typeof item === "string" ? [item] : item));
  }

  const restIndex = processed.findIndex(
    (item) =>
      item === REST_SIDEBAR_ITEMS || item === REST_SIDEBAR_ITEMS_REVERSED,
  );

  if (restIndex >= 0) {
    const restItem = processed[restIndex];
    const restItems = buildAllSidebarItems(
      Array.from(restNames),
      folderPath,
      (name) => isRoot || !isIndexDocName(name),
      restItem === REST_SIDEBAR_ITEMS_REVERSED,
    );
    processed.splice(restIndex, 1, ...restItems);
  }

  return processed.filter(
    (item): item is DocsSidebarItem => typeof item !== "string",
  );
}

function buildDocsSidebarItems(): DocsSidebarItem[] {
  return buildFolderSidebarItem("", true)?.items ?? [];
}

function flattenSidebarLinks(
  items: readonly DocsSidebarItem[],
): DocPaginationLink[] {
  return items.flatMap((item) => {
    if (item.type === "link") {
      return [{ permalink: item.href, title: item.label }];
    }

    if (item.type === "separator") {
      return [];
    }

    const ownLink = item.href
      ? [
          {
            permalink: item.href,
            title: getDocTitle(docSlugFromHref(item.href)),
          },
        ]
      : [];
    return [...ownLink, ...flattenSidebarLinks(item.items)];
  });
}

function tocHeadingHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .trim();
}

function extractTableOfContents(markdown: string): DocPage["tableOfContents"] {
  const usedIds = new Map<string, number>();
  const items: DocPage["tableOfContents"] = [];

  for (const line of markdown.split("\n")) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (!heading) {
      continue;
    }

    const value = tocHeadingHtml(heading[2]);
    const id = getUniqueMarkdownHeadingId(value, usedIds);

    if (heading[1].length >= 2) {
      items.push({
        depth: heading[1].length,
        id,
        value,
      });
    }
  }

  return items;
}

async function renderDocContent({
  relativePath,
  source,
}: {
  relativePath: string;
  source: string;
}): Promise<ReactElement> {
  return createElement(
    Fragment,
    null,
    await renderMarkdownContent({
      source,
      sourcePath: relativePath,
      variant: "prose",
    }),
  );
}

export const getAllDocPostSlugs = cache(
  function getAllDocPostSlugs(): string[] {
    return collectMarkdownFiles(docsRoot())
      .map((filePath) =>
        canonicalizeMarkdownPath(toPosix(relative(docsRoot(), filePath))),
      )
      .filter(isPublicDocSlug);
  },
);

export const getDocsSidebarItems = cache(
  function getDocsSidebarItems(): DocsSidebarItem[] {
    return buildDocsSidebarItems();
  },
);

export const getDocsSearchItems = cache(
  function getDocsSearchItems(): DocsSearchItem[] {
    return getAllDocPostSlugs()
      .slice()
      .sort(compareDocSearchSlugs)
      .map((slug) => {
        const href = toDocHref(slug);
        const group = toDocSearchGroup(slug);

        return {
          description: group,
          group,
          href,
          icon: "docs",
          id: slug,
          keywords: [slug, href],
          title: toDocSearchTitle(slug),
        };
      });
  },
);

export const getDocPagination = cache(function getDocPagination(slug: string): {
  next: DocPaginationLink | null;
  previous: DocPaginationLink | null;
} {
  const links = flattenSidebarLinks(getDocsSidebarItems());
  const currentIndex = links.findIndex(
    (link) => link.permalink === toDocHref(slug),
  );

  if (currentIndex === -1) {
    return { next: null, previous: null };
  }

  return {
    next: links[currentIndex + 1] ?? null,
    previous: links[currentIndex - 1] ?? null,
  };
});

export const getDocPostMetaBySlug = cache(function getDocPostMetaBySlug(
  slug: string,
): DocMeta | null {
  const resolved = resolveDocFile(slug);
  if (!resolved) {
    return null;
  }

  return readDocMetaFromFile(resolved.absolutePath, resolved.slug);
});

export const getDocPostBySlug = cache(async function getDocPostBySlug(
  slug: string,
): Promise<DocPage | null> {
  const resolved = resolveDocFile(slug);
  if (!resolved) {
    return null;
  }

  const source = readDocSource(resolved.absolutePath);
  const meta = readDocMetaFromFile(resolved.absolutePath, resolved.slug);

  return {
    ...meta,
    content: await renderDocContent({
      relativePath: resolved.relativePath,
      source,
    }),
    tableOfContents: extractTableOfContents(source),
  };
});
