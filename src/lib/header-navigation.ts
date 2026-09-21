export type HeaderNavItem = {
  label: string;
  href: string;
  activePath?: string;
  links?: readonly { label: string; href: string }[];
};

export const HEADER_LINKS: readonly HeaderNavItem[] = [
  {
    label: "Product",
    href: "/product/lakebase",
    links: [
      { label: "Lakebase", href: "/product/lakebase" },
      { label: "Agent Bricks", href: "/product/agent-bricks" },
      { label: "Databricks Apps", href: "/product/databricks-apps" },
      { label: "Neon", href: "https://neon.com" },
    ],
  },
  {
    label: "Resources",
    href: "/solutions",
    links: [
      { label: "Solutions", href: "/solutions" },
      { label: "MVPs", href: "/mvps" },
      {
        label: "Student Fellows",
        href: "https://databricksstudentfellows.com/",
      },
    ],
  },
  { label: "Templates", href: "/templates" },
  { label: "Docs", href: "/docs/start-here", activePath: "/docs" },
];

function normalizePath(path: string) {
  if (path === "/") return path;

  return path.replace(/\/$/, "");
}

export function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function isHrefActive(href: string, pathname: string) {
  if (isExternalHref(href)) return false;

  const hrefPath = normalizePath(href);
  const currentPath = normalizePath(pathname);

  return hrefPath === "/"
    ? currentPath === "/"
    : currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`);
}

export function isHeaderNavItemActive(item: HeaderNavItem, pathname: string) {
  return item.links
    ? item.links.some(({ href }) => isHrefActive(href, pathname))
    : isHrefActive(item.activePath ?? item.href, pathname);
}
