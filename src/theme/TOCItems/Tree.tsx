import React, { type ReactNode } from "react";
import Link from "@docusaurus/Link";
import type { Props } from "@theme/TOCItems/Tree";

function TOCItemTree({
  toc,
  className,
  linkClassName,
  isChild,
}: Props): ReactNode {
  if (!toc.length) {
    return null;
  }
  return (
    <ul className={isChild ? "m-0 list-none pl-3" : className}>
      {toc.map((heading) => (
        <li key={heading.id} className="m-0">
          <Link
            to={`#${heading.id}`}
            className={linkClassName ?? undefined}
            dangerouslySetInnerHTML={{ __html: heading.value }}
          />
          <TOCItemTree
            isChild
            toc={heading.children}
            className={className}
            linkClassName={linkClassName}
          />
        </li>
      ))}
    </ul>
  );
}

export default React.memo(TOCItemTree);
