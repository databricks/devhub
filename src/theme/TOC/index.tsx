import { type ReactNode } from "react";
import clsx from "clsx";
import TOCItems from "@theme/TOCItems";
import type { Props } from "@theme/TOC";

const LINK_CLASS_NAME = "table-of-contents__link toc-highlight";
const LINK_ACTIVE_CLASS_NAME = "table-of-contents__link--active";

export function TOC({ className, ...props }: Props): ReactNode {
  return (
    <div className={clsx("db-toc thin-scrollbar", className)}>
      <p className="db-toc-heading">On this page</p>
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </div>
  );
}

export default TOC;
