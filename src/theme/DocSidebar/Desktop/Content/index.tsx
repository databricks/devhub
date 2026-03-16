import clsx from "clsx";
import type { Props } from "@theme/DocSidebar/Desktop/Content";
import DocSidebarDesktopContent from "@theme-original/DocSidebar/Desktop/Content";
import type { ReactNode } from "react";

export default function DocSidebarDesktopContentWrapper({
  className,
  ...props
}: Props): ReactNode {
  return (
    <DocSidebarDesktopContent
      className={clsx("db-docs-sidebar-nav", className)}
      {...props}
    />
  );
}
