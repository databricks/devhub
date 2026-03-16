import { type ReactNode } from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import type { Props } from "@theme/DocSidebarItem/Link";

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  ...props
}: Props): ReactNode {
  const { href, label, className, autoAddBaseUrl } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        "menu__list-item my-0",
        className,
      )}
      key={label}
    >
      <Link
        className={clsx(
          "menu__link",
          "relative !rounded-md !border-none !px-2.5 !py-2 !text-[13.5px] !font-normal !leading-snug transition-colors",
          "!text-muted-foreground hover:!text-foreground hover:!bg-accent",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          !isInternalLink && "items-center",
          isActive && [
            "menu__link--active",
            "!font-medium !text-foreground !bg-accent",
            "before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-sm before:bg-primary",
          ],
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? "page" : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        <span title={label} className="overflow-hidden line-clamp-2">
          {label}
        </span>
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
