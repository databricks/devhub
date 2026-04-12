import fs from "node:fs";
import path from "node:path";
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

type AppKitSidebarItem =
  | string
  | {
      type: "category";
      label: string;
      link?: {
        type: "doc";
        id: string;
      };
      collapsed?: boolean;
      items: AppKitSidebarItem[];
    };

type AppKitDocTree = {
  indexDocId: string | null;
  items: AppKitSidebarItem[];
};

function getAppKitMajorChannels(): string[] {
  const docsAppKitRoot = path.resolve(process.cwd(), "docs", "appkit");

  if (!fs.existsSync(docsAppKitRoot)) {
    return [];
  }

  return fs
    .readdirSync(docsAppKitRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => Number(b.slice(1)) - Number(a.slice(1)));
}

function toDocId(relativePath: string): string {
  const ext = path.extname(relativePath);
  return relativePath.slice(0, -ext.length).replaceAll(path.sep, "/");
}

function toLabel(value: string): string {
  return value.replaceAll(/[-_]/g, " ").replaceAll(/\s+/g, " ").trim();
}

function readSidebarPosition(filePath: string): number | null {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const posMatch = match[1].match(/^sidebar_position:\s*(\d+)/m);
  return posMatch ? Number(posMatch[1]) : null;
}

function readCategoryPosition(dirPath: string): number | null {
  const categoryFile = path.join(dirPath, "_category_.json");
  if (!fs.existsSync(categoryFile)) return null;
  const data = JSON.parse(fs.readFileSync(categoryFile, "utf-8"));
  return typeof data.position === "number" ? data.position : null;
}

function readAppKitDocTree(relativeDir: string): AppKitDocTree {
  const absoluteDir = path.resolve(process.cwd(), "docs", relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return { indexDocId: null, items: [] };
  }

  const entries = fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."));

  const files = entries.filter(
    (entry) =>
      entry.isFile() &&
      [".md", ".mdx"].includes(path.extname(entry.name)) &&
      !entry.name.startsWith("_"),
  );
  const directories = entries.filter((entry) => entry.isDirectory());

  const indexFile = files.find((entry) =>
    ["index.md", "index.mdx"].includes(entry.name),
  );
  const indexDocId = indexFile
    ? toDocId(path.join(relativeDir, indexFile.name))
    : null;

  type PositionedItem = {
    position: number | null;
    name: string;
    item: AppKitSidebarItem;
  };

  const fileDocItems: PositionedItem[] = files
    .filter((entry) => !["index.md", "index.mdx"].includes(entry.name))
    .map((entry) => ({
      position: readSidebarPosition(path.join(absoluteDir, entry.name)),
      name: entry.name,
      item: toDocId(path.join(relativeDir, entry.name)),
    }));

  const directoryItems: PositionedItem[] = directories
    .map((entry) => {
      const childRelativeDir = path.join(relativeDir, entry.name);
      const childTree = readAppKitDocTree(childRelativeDir);

      if (!childTree.indexDocId && childTree.items.length === 0) {
        return null;
      }

      return {
        position: readCategoryPosition(path.join(absoluteDir, entry.name)),
        name: entry.name,
        item: {
          type: "category" as const,
          label: toLabel(entry.name),
          link: childTree.indexDocId
            ? {
                type: "doc" as const,
                id: childTree.indexDocId,
              }
            : undefined,
          collapsed: true,
          items: childTree.items,
        },
      };
    })
    .filter((item): item is Exclude<typeof item, null> => item !== null);

  const allItems = [...fileDocItems, ...directoryItems].sort((a, b) => {
    if (a.position != null && b.position != null)
      return a.position - b.position;
    if (a.position != null) return -1;
    if (b.position != null) return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    indexDocId,
    items: allItems.map((entry) => entry.item),
  };
}

const appKitMajorChannels = getAppKitMajorChannels();

const appKitVersionItems = appKitMajorChannels
  .map((majorChannel, index) => {
    const majorTree = readAppKitDocTree(path.join("appkit", majorChannel));

    if (!majorTree.indexDocId && majorTree.items.length === 0) {
      return null;
    }

    return {
      type: "category" as const,
      label: index === 0 ? `${majorChannel} (current)` : majorChannel,
      link: majorTree.indexDocId
        ? {
            type: "doc" as const,
            id: majorTree.indexDocId,
          }
        : undefined,
      collapsed: true,
      items: majorTree.items,
    };
  })
  .filter((item): item is Exclude<typeof item, null> => item !== null);

const latestAppKitMajorChannel = appKitMajorChannels[0];
const latestAppKitDocId = latestAppKitMajorChannel
  ? readAppKitDocTree(path.join("appkit", latestAppKitMajorChannel)).indexDocId
  : null;

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "start-here",
    {
      type: "category",
      label: "AI agents",
      items: [
        "agents/quickstart",
        "agents/core-concepts",
        "agents/development",
        "agents/ai-gateway",
        "agents/observability",
      ],
    },
    {
      type: "category",
      label: "Databricks Apps",
      items: [
        "apps/quickstart",
        "apps/core-concepts",
        "apps/appkit",
        "apps/plugins",
        "apps/development",
      ],
    },
    {
      type: "category",
      label: "Lakebase Postgres",
      items: [
        "lakebase/quickstart",
        "lakebase/core-concepts",
        "lakebase/development",
      ],
    },
    {
      type: "category",
      label: "Developer tools",
      items: [
        "tools/databricks-cli",
        "tools/ai-tools/agent-skills",
        "tools/ai-tools/docs-mcp-server",
      ],
    },
    {
      type: "category",
      label: "Reference",
      items: [
        {
          type: "link",
          label: "Databricks CLI",
          href: "https://docs.databricks.com/aws/en/dev-tools/cli/commands",
        },
        {
          type: "category",
          label: "AppKit",
          link: {
            type: "doc",
            id: latestAppKitDocId ?? "appkit/v0/index",
          },
          collapsed: true,
          items: appKitVersionItems,
        },
      ],
    },
  ],
};

export default sidebars;
