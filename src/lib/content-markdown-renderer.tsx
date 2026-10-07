import { readFile } from "node:fs/promises";
import path from "node:path";

import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { imageSize } from "image-size";
import type {
  Code,
  Delete,
  Emphasis,
  InlineCode,
  Link,
  List,
  ListItem,
  Image as MarkdownImage,
  Heading as MdastHeading,
  Table as MdastTable,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Strong,
  Text,
} from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";

import {
  getUniqueMarkdownHeadingId,
  parseMarkdownHeading,
} from "@/lib/markdown-heading-ids";
import { resolveSiteUrl } from "@/lib/site-url";
import { Admonition } from "@/components/content/admonition";
import { Details } from "@/components/content/details";
import { DocExample } from "@/components/content/doc-example";
import { Heading } from "@/components/content/heading";
import { HighlightedCodeBlock } from "@/components/content/highlighted-code-block";
import { MermaidDiagram } from "@/components/content/mermaid-diagram";
import { Table, type TablePresentation } from "@/components/content/table";
import { Tabs, type Tab } from "@/components/content/tabs";

type FrontmatterNode = { type: "toml"; value: string };
type MarkdownNode =
  RootContent | FrontmatterNode | MdxJsxFlowElement | MdxJsxTextElement;
type InlineMarkdownNode = PhrasingContent | MdxJsxTextElement;
type MarkdownVariant = "default" | "prose";

type RenderOptions = {
  headingDepthOffset: number;
  headingIds: Map<string, number>;
  imageMaxWidth?: string;
  showHeadingAnchors: boolean;
  sourcePath?: string;
  tableContext?: "details";
  tablePresentation: TablePresentation;
};

const DEVHUB_SITE_URL_PLACEHOLDER = "__DEVHUB_SITE_URL__";
const ADMONITION_TITLE_BY_TYPE: Record<string, string> = {
  caution: "caution",
  danger: "danger",
  important: "important",
  info: "info",
  note: "note",
  tip: "tip",
  warn: "warn",
  warning: "warning",
};

const markdownProcessor = remark()
  .use(remarkFrontmatter, ["yaml", "toml"])
  .use(remarkGfm)
  .use(remarkMdx);

function substituteDevhubSiteUrl(value: string): string {
  return value.includes(DEVHUB_SITE_URL_PLACEHOLDER)
    ? value.replaceAll(DEVHUB_SITE_URL_PLACEHOLDER, resolveSiteUrl())
    : value;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function normalizeAdmonitionTitle(
  source: string | undefined,
): string | undefined {
  return source?.replace(/<code>(.*?)<\/code>/g, "`$1`");
}

function rewriteAdmonitionFences(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const opening =
        /^(\s*):{3,}([A-Za-z][\w-]*)(?:\[([^\]]+)])?(?:\s+(.+))?\s*$/.exec(
          line,
        );
      if (opening) {
        const type = opening[2].toLowerCase();
        const title = normalizeAdmonitionTitle(
          opening[3] ?? opening[4]?.trim() ?? ADMONITION_TITLE_BY_TYPE[type],
        );
        const titleAttribute = title
          ? ` title="${escapeAttribute(title)}"`
          : "";

        return `${opening[1]}<Admonition type="${escapeAttribute(type)}"${titleAttribute}>`;
      }

      const closing = /^(\s*):{3,}\s*$/.exec(line);
      if (closing) {
        return `${closing[1]}</Admonition>`;
      }

      return line;
    })
    .join("\n");
}

function stripHtmlComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, "");
}

function isExternalReference(reference: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference);
}

function normalizePathSegments(value: string): string {
  const segments: string[] = [];

  for (const segment of value.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }

    if (segment === "..") {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  return segments.join("/");
}

function sourceDirectory(sourcePath: string | undefined): string {
  if (!sourcePath?.includes("/")) {
    return "";
  }

  return sourcePath.split("/").slice(0, -1).join("/");
}

function resolveDocsRelativeReference(
  reference: string,
  sourcePath: string | undefined,
): string {
  if (isExternalReference(reference) || reference.startsWith("/")) {
    return reference;
  }

  if (!sourcePath) {
    return reference;
  }

  return `/docs/${normalizePathSegments(
    `${sourceDirectory(sourcePath)}/${reference}`,
  )}`;
}

function resolveDocsMarkdownLink(
  href: string,
  sourcePath: string | undefined,
): string {
  if (isExternalReference(href)) {
    return href;
  }

  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? "" : href.slice(hashIndex);
  const pointsToIndexPage = /(?:^|\/)index\.(?:md|mdx)$/i.test(pathPart);
  const resolvedPath = resolveDocsRelativeReference(pathPart, sourcePath)
    .replace(/\.(md|mdx)$/i, "")
    .replace(/\/index$/i, pointsToIndexPage ? "/" : "");

  return `${resolvedPath}${hashPart}`;
}

function asCssLength(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^\d+$/.test(value) ? `${value}px` : value;
}

function constrainCssLength(value: string | undefined): string | undefined {
  const length = asCssLength(value);
  if (!length) return undefined;
  return length.endsWith("%") ? length : `min(100%, ${length})`;
}

function parseNumericImageDimension(value: string | undefined) {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

function parseStyleMaxWidth(value: string | undefined): string | undefined {
  const maxWidth = /maxWidth:\s*(\d+)/.exec(value ?? "")?.[1];
  return maxWidth ? `${maxWidth}px` : undefined;
}

function getImageSizes(
  width: string | undefined,
  maxWidth: string | undefined,
  intrinsicWidth: number | undefined,
) {
  const resolvedMaxWidth =
    parseNumericImageDimension(maxWidth?.replace(/px$/, "")) ??
    parseNumericImageDimension(width) ??
    intrinsicWidth;

  return resolvedMaxWidth
    ? `(max-width: ${resolvedMaxWidth}px) 100vw, ${resolvedMaxWidth}px`
    : "100vw";
}

function getImageStyle({
  height,
  maxWidth,
  width,
}: {
  height?: string;
  maxWidth?: string;
  width?: string;
}) {
  const style: CSSProperties = {};
  const constrainedWidth = constrainCssLength(width);
  const constrainedMaxWidth = constrainCssLength(maxWidth);
  const resolvedHeight = asCssLength(height);

  if (resolvedHeight) style.height = resolvedHeight;
  else style.height = "auto";
  if (constrainedMaxWidth) style.maxWidth = constrainedMaxWidth;
  if (constrainedWidth) style.width = constrainedWidth;

  return Object.keys(style).length > 0 ? style : undefined;
}

async function getLocalImageDimensions(src: string): Promise<{
  height: number;
  width: number;
} | null> {
  if (!src.startsWith("/")) {
    return null;
  }

  try {
    const bytes = await readFile(path.join(process.cwd(), "public", src));
    const size = imageSize(bytes);

    if (!size.width || !size.height) {
      return null;
    }

    return {
      height: size.height,
      width: size.width,
    };
  } catch {
    return null;
  }
}

function isNodeType<T extends MarkdownNode["type"]>(
  node: MarkdownNode,
  type: T,
): node is Extract<MarkdownNode, { type: T }> {
  return node.type === type;
}

function isInlineNodeType<T extends InlineMarkdownNode["type"]>(
  node: InlineMarkdownNode,
  type: T,
): node is Extract<InlineMarkdownNode, { type: T }> {
  return node.type === type;
}

function isMdxJsxAttribute(
  attribute: MdxJsxFlowElement["attributes"][number],
): attribute is MdxJsxAttribute {
  return attribute.type === "mdxJsxAttribute";
}

function getMdxAttribute(
  attributes: MdxJsxFlowElement["attributes"],
  name: string,
): MdxJsxAttribute | undefined {
  for (const attribute of attributes) {
    if (isMdxJsxAttribute(attribute) && attribute.name === name) {
      return attribute;
    }
  }

  return undefined;
}

function getExpressionValue(
  value: MdxJsxAttributeValueExpression | undefined,
): string | undefined {
  return value && typeof value.value === "string" ? value.value : undefined;
}

function getStringAttribute(
  attributes: MdxJsxFlowElement["attributes"],
  name: string,
): string | undefined {
  const attribute = getMdxAttribute(attributes, name);
  if (!attribute) {
    return undefined;
  }

  if (attribute.value === null || attribute.value === undefined) {
    return "";
  }

  if (typeof attribute.value === "string") {
    return substituteDevhubSiteUrl(attribute.value);
  }

  return getExpressionValue(attribute.value);
}

function getBooleanAttribute(
  attributes: MdxJsxFlowElement["attributes"],
  name: string,
): boolean | undefined {
  const attribute = getMdxAttribute(attributes, name);
  if (!attribute) {
    return undefined;
  }

  if (attribute.value === null || attribute.value === undefined) {
    return true;
  }

  if (typeof attribute.value === "string") {
    return attribute.value === "true";
  }

  const expression = getExpressionValue(attribute.value);
  if (expression === "true") return true;
  if (expression === "false") return false;
  return undefined;
}

function getBooleanStringAttribute(
  attributes: MdxJsxFlowElement["attributes"],
  name: string,
): boolean | string | undefined {
  const attribute = getMdxAttribute(attributes, name);
  if (!attribute) {
    return undefined;
  }

  if (attribute.value === null || attribute.value === undefined) {
    return true;
  }

  if (typeof attribute.value === "string") {
    if (attribute.value === "" || attribute.value === "true") return true;
    if (attribute.value === "false") return false;
    return attribute.value;
  }

  const expression = getExpressionValue(attribute.value);
  if (expression === "true") return true;
  if (expression === "false") return false;
  return expression;
}

function getStringArrayAttribute(
  attributes: MdxJsxFlowElement["attributes"],
  name: string,
): string[] | undefined {
  const expression = getStringAttribute(attributes, name);
  if (!expression) {
    return undefined;
  }

  const matches = Array.from(expression.matchAll(/["']([^"']+)["']/g)).map(
    (match) => match[1],
  );
  return matches.length > 0 ? matches : undefined;
}

function parseCodeTitle(meta: string | null | undefined): string | undefined {
  if (!meta) {
    return undefined;
  }

  return /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta)?.[1];
}

function parseCodeTab(meta: string | null | undefined): string | undefined {
  if (!meta) {
    return undefined;
  }

  return /(?:^|\s)tab=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta)?.[1];
}

function extractInlineText(nodes: readonly InlineMarkdownNode[]): string {
  return nodes
    .map((node) => {
      if (isInlineNodeType(node, "text")) {
        return substituteDevhubSiteUrl(node.value);
      }

      if (isInlineNodeType(node, "inlineCode")) {
        return node.value;
      }

      if ("children" in node && Array.isArray(node.children)) {
        return extractInlineText(node.children as InlineMarkdownNode[]);
      }

      return "";
    })
    .join("");
}

function renderInlineNodes(
  nodes: readonly InlineMarkdownNode[],
  variant: MarkdownVariant,
  options: RenderOptions,
): ReactNode[] {
  return nodes.flatMap((node, index) =>
    renderInlineNode(node, variant, options, index),
  );
}

function renderInlineNode(
  node: InlineMarkdownNode,
  variant: MarkdownVariant,
  options: RenderOptions,
  key: number,
): ReactNode {
  if (isInlineNodeType(node, "text")) {
    return substituteDevhubSiteUrl(node.value);
  }

  if (isInlineNodeType(node, "inlineCode")) {
    return <code key={key}>{substituteDevhubSiteUrl(node.value)}</code>;
  }

  if (isInlineNodeType(node, "strong")) {
    return (
      <strong key={key}>
        {renderInlineNodes(node.children, variant, options)}
      </strong>
    );
  }

  if (isInlineNodeType(node, "emphasis")) {
    return (
      <em key={key}>{renderInlineNodes(node.children, variant, options)}</em>
    );
  }

  if (isInlineNodeType(node, "delete")) {
    return (
      <del key={key}>{renderInlineNodes(node.children, variant, options)}</del>
    );
  }

  if (isInlineNodeType(node, "link")) {
    const href = resolveDocsMarkdownLink(
      substituteDevhubSiteUrl(node.url),
      options.sourcePath,
    );

    return (
      <a
        className={
          variant === "default"
            ? "text-db-lava-light underline decoration-white/20 underline-offset-4 hover:text-white"
            : undefined
        }
        href={href}
        key={key}
      >
        {renderInlineNodes(node.children, variant, options)}
      </a>
    );
  }

  if (isInlineNodeType(node, "break")) {
    return <br key={key} />;
  }

  if (isInlineNodeType(node, "mdxJsxTextElement")) {
    if (node.name === "code") {
      return (
        <code key={key}>
          {renderInlineNodes(node.children, variant, options)}
        </code>
      );
    }

    return renderInlineNodes(node.children, variant, options);
  }

  return null;
}

async function renderCodeBlock(
  node: Code,
  { showTitle = true }: { showTitle?: boolean } = {},
): Promise<ReactNode> {
  const language = node.lang ?? undefined;

  return language === "mermaid" ? (
    <MermaidDiagram chart={node.value} />
  ) : (
    <HighlightedCodeBlock
      language={language}
      showTitle={showTitle}
      text={node.value}
      title={parseCodeTitle(node.meta)}
    />
  );
}

function renderCompactCodeSnippet(node: Code): ReactNode {
  return <code>{substituteDevhubSiteUrl(node.value)}</code>;
}

function shouldRenderCompactCodeSnippet(node: Code): boolean {
  return !node.lang && !parseCodeTitle(node.meta) && !parseCodeTab(node.meta);
}

async function renderCodeTabs(
  nodes: readonly Code[],
): Promise<ReactNode | null> {
  const tabs: Tab[] = await Promise.all(
    nodes.map(async (node, index) => {
      const title = parseCodeTitle(node.meta);
      const tab = parseCodeTab(node.meta);
      const label = tab ?? title ?? node.lang ?? "Code";

      return {
        content: <div>{await renderCodeBlock(node, { showTitle: false })}</div>,
        label,
        value: `${label}-${index}`,
      };
    }),
  );

  return tabs.length > 0 ? <Tabs tabs={tabs} /> : null;
}

function shouldGroupCodeTabs(current: Code, next: MarkdownNode | undefined) {
  if (!next || !isNodeType(next, "code")) {
    return false;
  }

  const currentTitle = parseCodeTitle(current.meta);
  const nextTitle = parseCodeTitle(next.meta);
  if (currentTitle === "Common" && nextTitle === "All Options") {
    return true;
  }

  return Boolean(parseCodeTab(current.meta) && parseCodeTab(next.meta));
}

function collectCodeTabGroup(
  nodes: readonly MarkdownNode[],
  startIndex: number,
): { endIndex: number; nodes: Code[] } {
  const first = nodes[startIndex];
  if (!isNodeType(first, "code")) {
    return { endIndex: startIndex, nodes: [] };
  }

  const grouped = [first];
  const next = nodes[startIndex + 1];
  if (
    parseCodeTitle(first.meta) === "Common" &&
    next &&
    isNodeType(next, "code")
  ) {
    if (parseCodeTitle(next.meta) === "All Options") {
      grouped.push(next);
      return { endIndex: startIndex + 1, nodes: grouped };
    }
  }

  let cursor = startIndex + 1;
  while (cursor < nodes.length) {
    const codeNode = nodes[cursor];
    if (
      !codeNode ||
      !isNodeType(codeNode, "code") ||
      !parseCodeTab(codeNode.meta)
    ) {
      break;
    }

    grouped.push(codeNode);
    cursor += 1;
  }

  return { endIndex: cursor - 1, nodes: grouped };
}

async function renderImage({
  alt,
  height,
  maxWidth,
  src,
  variant,
  width,
}: {
  alt: string;
  height?: string;
  maxWidth?: string;
  src: string;
  variant: MarkdownVariant;
  width?: string;
}): Promise<ReactNode> {
  const dimensions = await getLocalImageDimensions(src);

  return (
    <Image
      alt={alt}
      className={variant === "prose" ? undefined : "my-8 h-auto max-w-full"}
      height={parseNumericImageDimension(height) ?? dimensions?.height ?? 675}
      sizes={getImageSizes(width, maxWidth, dimensions?.width)}
      src={src}
      style={getImageStyle({ height, maxWidth, width })}
      width={parseNumericImageDimension(width) ?? dimensions?.width ?? 1200}
      quality={100}
    />
  );
}

async function renderMarkdownImage(
  node: MarkdownImage,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  return renderImage({
    alt: node.alt ?? "",
    maxWidth: options.imageMaxWidth,
    src: resolveDocsRelativeReference(
      substituteDevhubSiteUrl(node.url),
      options.sourcePath,
    ),
    variant,
  });
}

async function renderMdxImage(
  node: MdxJsxFlowElement,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const src = getStringAttribute(node.attributes, "src");
  if (!src) {
    return null;
  }

  return renderImage({
    alt: getStringAttribute(node.attributes, "alt") ?? "",
    height: getStringAttribute(node.attributes, "height"),
    maxWidth: options.imageMaxWidth,
    src: resolveDocsRelativeReference(src, options.sourcePath),
    variant,
    width: getStringAttribute(node.attributes, "width"),
  });
}

async function renderParagraph(
  node: Paragraph,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  if (
    node.children.length === 1 &&
    isInlineNodeType(node.children[0], "image")
  ) {
    const image = await renderMarkdownImage(node.children[0], variant, options);
    return variant === "prose" ? <p>{image}</p> : image;
  }

  return <p>{renderInlineNodes(node.children, variant, options)}</p>;
}

async function renderHeading(
  node: MdastHeading,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const headingDepth = Math.min(
    Math.max(node.depth + options.headingDepthOffset, 1),
    6,
  );
  const parsedHeading = parseMarkdownHeading(extractInlineText(node.children));
  const id =
    parsedHeading.id ??
    getUniqueMarkdownHeadingId(parsedHeading.text, options.headingIds);
  const headingChildren = [...node.children];
  const lastChild = headingChildren.at(-1);

  if (parsedHeading.id && lastChild?.type === "text") {
    headingChildren[headingChildren.length - 1] = {
      ...lastChild,
      value: parseMarkdownHeading(lastChild.value).text,
    };
  }

  return (
    <Heading
      depth={headingDepth}
      id={id}
      isProse={variant === "prose"}
      showAnchor={options.showHeadingAnchors}
    >
      {renderInlineNodes(headingChildren, variant, options)}
    </Heading>
  );
}

async function renderListItem(
  node: ListItem,
  list: List,
  variant: MarkdownVariant,
  options: RenderOptions,
  index: number,
): Promise<ReactNode> {
  if (
    node.children.length > 0 &&
    isNodeType(node.children[0] as MarkdownNode, "paragraph")
  ) {
    const [firstChild, ...remainingChildren] = node.children as MarkdownNode[];
    const shouldUnwrapLeadingParagraph =
      (!list.spread && remainingChildren.length === 0) ||
      (remainingChildren.length > 0 &&
        remainingChildren.every((child) => isNodeType(child, "list")));

    if (shouldUnwrapLeadingParagraph) {
      const paragraph = firstChild as Paragraph;

      return (
        <li key={index}>
          {renderInlineNodes(paragraph.children, variant, options)}
          {remainingChildren.length > 0
            ? await renderNodes(remainingChildren, variant, options)
            : null}
        </li>
      );
    }
  }

  return (
    <li key={index}>
      {await renderNodes(node.children as MarkdownNode[], variant, options)}
    </li>
  );
}

async function renderList(
  node: List,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const Component = node.ordered ? "ol" : "ul";
  const renderedItems = await Promise.all(
    node.children.map((item, index) =>
      renderListItem(item, node, variant, options, index),
    ),
  );

  if (variant === "prose") {
    return <Component>{renderedItems}</Component>;
  }

  return (
    <Component
      className={`space-y-2 pl-6 ${node.ordered ? "list-decimal" : "list-disc"}`}
    >
      {renderedItems}
    </Component>
  );
}

async function renderBlockquote(
  node: Extract<RootContent, { type: "blockquote" }>,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const children = await renderNodes(
    node.children as MarkdownNode[],
    variant,
    options,
  );

  if (variant === "prose") {
    return <blockquote>{children}</blockquote>;
  }

  return (
    <blockquote className="text-grey-90 border-l-2 border-white pl-4">
      {children}
    </blockquote>
  );
}

function renderTableCell(
  children: readonly PhrasingContent[],
  variant: MarkdownVariant,
  options: RenderOptions,
): ReactNode[] {
  return renderInlineNodes(children, variant, options);
}

function renderTable(
  node: MdastTable,
  variant: MarkdownVariant,
  options: RenderOptions,
): ReactNode {
  const [headerRow, ...bodyRows] = node.children;
  const headers =
    headerRow?.children.map((cell) =>
      renderTableCell(cell.children, variant, options),
    ) ?? [];
  const rows = bodyRows.map((row) =>
    row.children.map((cell) =>
      renderTableCell(cell.children, variant, options),
    ),
  );

  return (
    <Table
      headers={headers}
      presentation={
        variant === "prose" && options.tablePresentation === "prose"
          ? "prose"
          : "scroll"
      }
      rows={rows}
      tableContext={options.tableContext}
    />
  );
}

function firstDetailsSummary(children: readonly MarkdownNode[]): {
  content: MarkdownNode[];
  summary: ReactNode;
} {
  const [first, ...rest] = children;
  if (!first || !isNodeType(first, "paragraph")) {
    return {
      content: [...children],
      summary: "Details",
    };
  }

  const [summary] = first.children;
  if (!summary || !isInlineNodeType(summary, "mdxJsxTextElement")) {
    return {
      content: [...children],
      summary: "Details",
    };
  }

  if (summary.name !== "summary") {
    return {
      content: [...children],
      summary: "Details",
    };
  }

  return {
    content: rest,
    summary: renderInlineNodes(summary.children, "prose", {
      headingDepthOffset: 0,
      headingIds: new Map(),
      showHeadingAnchors: false,
      tablePresentation: "scroll",
    }),
  };
}

async function renderDetails(
  node: MdxJsxFlowElement,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const { content, summary } = firstDetailsSummary(
    node.children as MarkdownNode[],
  );

  return (
    <Details summary={summary}>
      {await renderNodes(content, variant, {
        ...options,
        tableContext: "details",
      })}
    </Details>
  );
}

async function renderTabs(
  node: MdxJsxFlowElement,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const tabItems = (node.children as MarkdownNode[]).filter(
    (child): child is MdxJsxFlowElement =>
      isNodeType(child, "mdxJsxFlowElement") && child.name === "TabItem",
  );

  if (tabItems.length === 0) {
    return renderNodes(node.children as MarkdownNode[], variant, options);
  }

  const labels = getStringArrayAttribute(node.attributes, "labels");
  const tabs: Tab[] = await Promise.all(
    tabItems.map(async (tabItem, index) => {
      const value =
        getStringAttribute(tabItem.attributes, "value") ??
        labels?.[index] ??
        `tab-${index}`;

      return {
        content: await renderNodes(
          tabItem.children as MarkdownNode[],
          variant,
          options,
        ),
        default: getBooleanAttribute(tabItem.attributes, "default"),
        label:
          getStringAttribute(tabItem.attributes, "label") ??
          labels?.[index] ??
          value,
        value,
      };
    }),
  );

  return (
    <Tabs
      defaultValue={getStringAttribute(node.attributes, "defaultValue")}
      groupId={getStringAttribute(node.attributes, "groupId")}
      queryString={getBooleanStringAttribute(node.attributes, "queryString")}
      tabs={tabs}
    />
  );
}

async function renderCodeTabsElement(
  node: MdxJsxFlowElement,
): Promise<ReactNode> {
  const rawTabs = getStringAttribute(node.attributes, "tabs");
  if (!rawTabs) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawTabs) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const codeNodes = parsed.flatMap((tab): Code[] => {
      if (tab === null || typeof tab !== "object") {
        return [];
      }

      const candidate = tab as {
        code?: unknown;
        label?: unknown;
        language?: unknown;
        meta?: unknown;
      };

      if (
        typeof candidate.code !== "string" ||
        typeof candidate.label !== "string"
      ) {
        return [];
      }

      return [
        {
          type: "code",
          lang:
            typeof candidate.language === "string"
              ? candidate.language
              : undefined,
          meta:
            typeof candidate.meta === "string"
              ? `title="${candidate.label}"`
              : undefined,
          value: candidate.code,
        },
      ];
    });

    return renderCodeTabs(codeNodes);
  } catch {
    return null;
  }
}

async function renderAdmonition(
  node: MdxJsxFlowElement,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  const type = getStringAttribute(node.attributes, "type") || "note";
  const title = getStringAttribute(node.attributes, "title") || type;

  return (
    <Admonition
      title={renderInlineNodes(
        [{ type: "text", value: title } satisfies Text],
        variant,
        options,
      )}
      type={type}
    >
      {await renderNodes(node.children as MarkdownNode[], variant, options)}
    </Admonition>
  );
}

async function renderMdxElement(
  node: MdxJsxFlowElement,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  if (node.name === "Admonition") {
    return renderAdmonition(node, variant, options);
  }

  if (node.name === "CodeTabs") {
    return renderCodeTabsElement(node);
  }

  if (node.name === "details") {
    return renderDetails(node, variant, options);
  }

  if (node.name === "div") {
    const maxWidth = parseStyleMaxWidth(
      getStringAttribute(node.attributes, "style"),
    );
    const children = await renderNodes(
      node.children as MarkdownNode[],
      variant,
      {
        ...options,
        imageMaxWidth: maxWidth ?? options.imageMaxWidth,
      },
    );

    return maxWidth ? (
      <div style={{ maxWidth }}>{children}</div>
    ) : (
      <div>{children}</div>
    );
  }

  if (node.name === "DocExample") {
    const name = getStringAttribute(node.attributes, "name");
    return name ? <DocExample name={name} /> : null;
  }

  if (node.name === "img") {
    return renderMdxImage(node, variant, options);
  }

  if (node.name === "Tabs") {
    return renderTabs(node, variant, options);
  }

  if (node.name === "TabItem") {
    return renderNodes(node.children as MarkdownNode[], variant, options);
  }

  return renderNodes(node.children as MarkdownNode[], variant, options);
}

async function renderNode(
  node: MarkdownNode,
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode> {
  if (isNodeType(node, "yaml") || isNodeType(node, "toml")) {
    return null;
  }

  if (isNodeType(node, "mdxjsEsm") || isNodeType(node, "html")) {
    return null;
  }

  if (isNodeType(node, "heading")) {
    return renderHeading(node as MdastHeading, variant, options);
  }

  if (isNodeType(node, "paragraph")) {
    return renderParagraph(node as Paragraph, variant, options);
  }

  if (isNodeType(node, "list")) {
    return renderList(node as List, variant, options);
  }

  if (isNodeType(node, "blockquote")) {
    return renderBlockquote(node, variant, options);
  }

  if (isNodeType(node, "code")) {
    if (shouldRenderCompactCodeSnippet(node as Code)) {
      return renderCompactCodeSnippet(node as Code);
    }

    return <div>{await renderCodeBlock(node as Code)}</div>;
  }

  if (isNodeType(node, "thematicBreak")) {
    return variant === "prose" ? (
      <hr />
    ) : (
      <hr className="border-grey-30 my-8" />
    );
  }

  if (isNodeType(node, "table")) {
    return renderTable(node as MdastTable, variant, options);
  }

  if (isNodeType(node, "mdxJsxFlowElement")) {
    return renderMdxElement(node, variant, options);
  }

  return null;
}

async function renderNodes(
  nodes: readonly MarkdownNode[],
  variant: MarkdownVariant,
  options: RenderOptions,
): Promise<ReactNode[]> {
  const rendered: ReactNode[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (
      isNodeType(node, "code") &&
      shouldGroupCodeTabs(node, nodes[index + 1])
    ) {
      const group = collectCodeTabGroup(nodes, index);
      rendered.push(
        <Fragment key={index}>{await renderCodeTabs(group.nodes)}</Fragment>,
      );
      index = group.endIndex;
      continue;
    }

    rendered.push(
      <Fragment key={index}>
        {await renderNode(node, variant, options)}
      </Fragment>,
    );
  }

  return rendered;
}

function parseMarkdown(source: string): Root {
  const tree = markdownProcessor.parse(
    rewriteAdmonitionFences(stripHtmlComments(source)),
  );
  return tree as Root;
}

export async function renderMarkdownContent({
  headingDepthOffset = 0,
  showHeadingAnchors,
  source,
  sourcePath,
  tablePresentation = "scroll",
  variant = "default",
}: {
  source: string;
  headingDepthOffset?: number;
  showHeadingAnchors?: boolean;
  sourcePath?: string;
  tablePresentation?: TablePresentation;
  variant?: MarkdownVariant;
}): Promise<ReactNode> {
  const root = parseMarkdown(source);
  const renderedBlocks = await renderNodes(
    root.children as MarkdownNode[],
    variant,
    {
      headingDepthOffset,
      headingIds: new Map(),
      showHeadingAnchors: showHeadingAnchors ?? variant === "prose",
      sourcePath,
      tablePresentation,
    },
  );

  if (variant === "prose") {
    return renderedBlocks;
  }

  return (
    <div className="text-grey-80 space-y-5 text-base leading-7">
      {renderedBlocks}
    </div>
  );
}
