import type { ComponentPropsWithoutRef } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function BaseUrlAnchor({
  href,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const baseUrlHref = useBaseUrl(href ?? "");
  const resolvedHref =
    href && href.startsWith("/") && !href.startsWith("//") ? baseUrlHref : href;

  return <a href={resolvedHref} {...props} />;
}
