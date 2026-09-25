import { describe, expect, test } from "vitest";

import {
  getDocsSidebarItems,
  type DocsSidebarItem,
} from "../src/lib/docs-content";

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
      "Apps",
      "Postgres Database",
      "Gateway",
      "Agents",
      "Meta-Harness",
      "Data Lakehouse",
    ]);

    const tools = findCategory(items, "Set up your environment");
    expect(tools.collapsed).toBe(false);
    expect(collectHrefs(tools.items)).toEqual([
      "/docs/tools/databricks-cli",
      "/docs/tools/ai-tools/agent-skills",
      "/docs/tools/ai-tools/docs-mcp-server",
    ]);
  });

  test("mounts AppKit under Apps while keeping AppKit links intact", () => {
    const apps = findCategory(getDocsSidebarItems(), "Apps");
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
