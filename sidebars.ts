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

// Returns the list of AppKit doc channels found under docs/appkit/.
// Channels are versioned per major (v0, v1, ...) and sorted descending so
// the highest-numbered version (the canonical "latest" stable release) is
// first. Optional "next" is appended last for unreleased dev docs.
function getAppKitChannels(): string[] {
  const docsAppKitRoot = path.resolve(process.cwd(), "docs", "appkit");

  if (!fs.existsSync(docsAppKitRoot)) {
    return [];
  }

  const entries = fs
    .readdirSync(docsAppKitRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const channels: string[] = [];

  const versionDirs = entries
    .filter((entry) => /^v\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => Number(b.slice(1)) - Number(a.slice(1)));

  channels.push(...versionDirs);

  if (entries.some((entry) => entry.name === "next")) {
    channels.push("next");
  }

  return channels;
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

// Build a flat list of AppKit sidebar items from the latest channel.
// The index doc ("Getting started") is prepended as an explicit item so it
// appears in the sidebar and Docusaurus pagination works correctly.
const latestChannel = getAppKitChannels()[0];
const latestAppKitTree = latestChannel
  ? readAppKitDocTree(path.join("appkit", latestChannel))
  : null;

const appKitItems: AppKitSidebarItem[] = [];
const appKitIndexDocId = latestAppKitTree?.indexDocId ?? null;
if (latestAppKitTree) {
  if (appKitIndexDocId) {
    appKitItems.push(appKitIndexDocId);
  }
  appKitItems.push(...latestAppKitTree.items);
}

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "start-here",
    "platform-overview",
    {
      type: "category",
      label: "Set up your environment",
      items: ["tools/databricks-cli", "tools/ai-tools/agent-skills"],
    },
    {
      type: "category",
      label: "Databricks Apps",
      items: [
        "apps/overview",
        "apps/quickstart",
        "apps/configuration",
        "apps/development",
      ],
    },
    {
      type: "category",
      label: "Lakebase Postgres",
      items: [
        "lakebase/overview",
        "lakebase/quickstart",
        "lakebase/configuration",
        "lakebase/development",
      ],
    },
    {
      type: "category",
      label: "Agent Bricks",
      items: [
        "agents/overview",
        "agents/ai-gateway",
        "agents/genie",
        "agents/custom-agents",
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
        "tools/ai-tools/docs-mcp-server",
        {
          type: "category",
          label: "AppKit",
          collapsed: true,
          ...(appKitIndexDocId
            ? { link: { type: "doc" as const, id: appKitIndexDocId } }
            : {}),
          items: appKitItems,
        },
      ],
    },
  ],
};

export default sidebars;
