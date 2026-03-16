import { type ReactNode } from "react";
import clsx from "clsx";
import TOCItems from "@theme/TOCItems";
import type { Props } from "@theme/TOC";

const LINK_CLASS_NAME =
  "toc-link block py-1 pl-3 -ml-px border-l-2 border-transparent text-[13px] leading-snug no-underline transition-colors text-muted-foreground hover:text-foreground hover:border-db-navy dark:text-[rgb(245_247_248/0.55)] dark:hover:text-white dark:hover:border-white focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2";

const LINK_ACTIVE_CLASS_NAME = "toc-link-active";

export function TOC({ className, ...props }: Props): ReactNode {
  return (
    <div
      className={clsx(
        "sticky top-[calc(var(--ifm-navbar-height)+1rem)] max-h-[calc(100vh-var(--ifm-navbar-height)-2rem)] overflow-y-auto text-sm thin-scrollbar max-[996px]:static",
        className,
      )}
    >
      <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground dark:text-[rgb(245_247_248/0.5)]">
        On this page
      </p>
      <TOCItems
        {...props}
        className="m-0 list-none space-y-0.5 border-l-2 border-db-border p-0 dark:border-[rgb(245_247_248/0.12)]"
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </div>
  );
}

export default TOC;
