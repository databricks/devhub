import { describe, expect, test } from "vitest";

import {
  getDocsSidebarItems,
  type DocsSidebarItem,
} from "../src/lib/docs-content";
import { getDocsBreadcrumbs } from "../src/lib/docs/breadcrumbs";

type SidebarCategory = Extract<DocsSidebarItem, { type: "category" }>;

function findCategory(
  items: readonly DocsSidebarItem[],
  label: string,
): SidebarCategory {
  const match = findCategoryOrNull(items, label);
  if (!match) {
    throw new Error(`Unable to find sidebar category "${label}"`);
  }
  return match;
}

function findCategoryOrNull(
  items: readonly DocsSidebarItem[],
  label: string,
): SidebarCategory | null {
  for (const item of items) {
    if (item.type === "category" && item.label === label) {
      return item;
    }

    if (item.type === "category") {
      const match = findCategoryOrNull(item.items, label);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

function findByHref(
  items: readonly DocsSidebarItem[],
  href: string,
): DocsSidebarItem | null {
  for (const item of items) {
    if (item.type !== "separator" && item.href === href) {
      return item;
    }

    if (item.type === "category") {
      const match = findByHref(item.items, href);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

function collectHrefs(items: readonly DocsSidebarItem[]): string[] {
  return items.flatMap((item) => {
    if (item.type === "separator") {
      return [];
    }

    const nested = item.type === "category" ? collectHrefs(item.items) : [];
    return item.href ? [item.href, ...nested] : nested;
  });
}

describe("docs sidebar", () => {
  test("builds the main docs tree from meta.json order", () => {
    const items = getDocsSidebarItems();
    expect(
      items.map((item) => (item.type === "link" ? item.href : item.label)),
    ).toEqual([
      "/docs/start-here",
      "/docs/platform-overview",
      "Set up your environment",
      "/docs/templates",
      "Databricks Apps",
      "Lakebase Postgres",
      "Unity Gateway",
      "Agent Bricks",
      "Omnigent",
      "Data Lakehouse",
    ]);

    const tools = findCategory(items, "Set up your environment");
    expect(tools.collapsed).toBe(false);
    expect(collectHrefs(tools.items)).toEqual([
      "/docs/tools/databricks-cli",
      "/docs/tools/ai-tools/agent-skills",
      "/docs/tools/ai-tools/docs-mcp-server",
    ]);

    const omnigent = findCategory(items, "Omnigent");
    expect(collectHrefs(omnigent.items)).toEqual([
      "/docs/omnigent/overview",
      "/docs/omnigent/quickstart",
      "/docs/omnigent/programmatic",
    ]);
  });

  test("mounts AppKit under Databricks Apps while keeping AppKit links intact", () => {
    const apps = findCategory(getDocsSidebarItems(), "Databricks Apps");
    const appKit = findCategory(apps.items, "AppKit");

    expect(appKit.href).toBeUndefined();
    expect(appKit.items[0]).toMatchObject({
      href: "/docs/appkit/v0",
      label: "Getting started",
      type: "category",
    });
    expect(collectHrefs(appKit.items)).toEqual(
      expect.arrayContaining([
        "/docs/appkit/v0/api/appkit-ui",
        "/docs/appkit/v0/api/appkit",
      ]),
    );
  });

  test("keeps API index pages as linked sidebar folders", () => {
    const items = getDocsSidebarItems();

    expect(findByHref(items, "/docs/appkit/v0/api/appkit-ui")).toMatchObject({
      type: "category",
    });
    expect(findByHref(items, "/docs/appkit/v0/api/appkit")).toMatchObject({
      type: "category",
    });
  });
});

describe("docs breadcrumbs", () => {
  test("follows AppKit's mounted sidebar hierarchy rather than its URL segments", () => {
    expect(
      getDocsBreadcrumbs(
        getDocsSidebarItems(),
        "/docs/appkit/v0/plugins/server",
        "Server plugin",
      ),
    ).toEqual([
      { label: "Docs", href: "/docs" },
      { label: "Databricks Apps", href: undefined },
      { label: "AppKit", href: undefined },
      { label: "Getting started", href: "/docs/appkit/v0" },
      { label: "Plugins", href: "/docs/appkit/v0/plugins" },
      { label: "Server plugin" },
    ]);
  });

  test("does not repeat a category index also listed as a child page", () => {
    const items: DocsSidebarItem[] = [
      {
        type: "category",
        label: "AppKit",
        href: "/docs/appkit/v0",
        items: [
          {
            type: "link",
            label: "Overview",
            href: "/docs/appkit/v0",
          },
        ],
      },
    ];

    expect(
      getDocsBreadcrumbs(items, "/docs/appkit/v0/", "Getting started"),
    ).toEqual([{ label: "Docs", href: "/docs" }, { label: "AppKit" }]);
  });

  test("keeps the docs root for top-level pages", () => {
    expect(
      getDocsBreadcrumbs(
        getDocsSidebarItems(),
        "/docs/start-here",
        "Start here",
      ),
    ).toEqual([{ label: "Docs", href: "/docs" }, { label: "Start here" }]);
  });

  test("uses the supplied page label when a page is absent from the sidebar", () => {
    expect(
      getDocsBreadcrumbs([], "/docs/unlisted-page", "Unlisted page"),
    ).toEqual([{ label: "Docs", href: "/docs" }, { label: "Unlisted page" }]);
  });
});
