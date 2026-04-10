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

function readAppKitDocTree(relativeDir: string): AppKitDocTree {
  const absoluteDir = path.resolve(process.cwd(), "docs", relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return { indexDocId: null, items: [] };
  }

  const entries = fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const fileDocItems: AppKitSidebarItem[] = files
    .filter((entry) => !["index.md", "index.mdx"].includes(entry.name))
    .map((entry) => toDocId(path.join(relativeDir, entry.name)));

  const directoryItems: AppKitSidebarItem[] = directories
    .map((entry) => {
      const childRelativeDir = path.join(relativeDir, entry.name);
      const childTree = readAppKitDocTree(childRelativeDir);

      if (!childTree.indexDocId && childTree.items.length === 0) {
        return null;
      }

      return {
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
      };
    })
    .filter((item): item is Exclude<typeof item, null> => item !== null);

  return {
    indexDocId,
    items: [...fileDocItems, ...directoryItems],
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
      label: "Agents",
      items: [
        "agents/getting-started",
        "agents/core-concepts",
        "agents/development",
        "agents/ai-gateway",
        "agents/observability",
      ],
    },
    {
      type: "category",
      label: "Apps",
      items: [
        "apps/getting-started",
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
        "lakebase/getting-started",
        "lakebase/core-concepts",
        "lakebase/development",
      ],
    },
    {
      type: "category",
      label: "Tools",
      items: [
        "tools/databricks-cli",
        "tools/ai-tools/agent-skills",
        "tools/ai-tools/docs-mcp-server",
      ],
    },
    {
      type: "category",
      label: "References",
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
