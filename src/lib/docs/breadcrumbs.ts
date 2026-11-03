import type { DocsSidebarItem } from "@/lib/docs-content";

export type DocsBreadcrumbItem = {
  label: string;
  href?: string;
};

export function getDocsBreadcrumbs(
  items: readonly DocsSidebarItem[],
  currentPath: string,
  currentLabel: string,
): DocsBreadcrumbItem[] {
  const normalizedPath = currentPath.replace(/\/$/, "");

  function findPath(
    entries: readonly DocsSidebarItem[],
  ): DocsBreadcrumbItem[] | null {
    for (const item of entries) {
      if (item.type === "separator") {
        continue;
      }

      if (item.href?.replace(/\/$/, "") === normalizedPath) {
        return [{ label: item.label }];
      }

      if (item.type === "category") {
        const nestedPath = findPath(item.items);
        if (nestedPath) {
          return [{ label: item.label, href: item.href }, ...nestedPath];
        }
      }
    }

    return null;
  }

  return [
    { label: "Docs", href: "/docs" },
    ...(findPath(items) ?? [{ label: currentLabel }]),
  ];
}
