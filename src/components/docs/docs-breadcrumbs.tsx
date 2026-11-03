import { Fragment, type ReactNode } from "react";
import Link from "next/link";

import type { DocsBreadcrumbItem } from "@/lib/docs/breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DocsBreadcrumbs({
  items,
}: {
  items: readonly DocsBreadcrumbItem[];
}): ReactNode {
  if (items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(-3);

  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-10">
      <BreadcrumbList className="text-grey-70 gap-x-0 gap-y-3 text-sm leading-5 tracking-tight sm:gap-x-0">
        {visibleItems.map((item, index) => (
          <Fragment key={`${item.href ?? item.label}-${index}`}>
            {index > 0 ? (
              <BreadcrumbSeparator className="mx-2.5 shrink-0" />
            ) : null}
            <BreadcrumbItem className="max-w-full min-w-0">
              {index === visibleItems.length - 1 ? (
                <BreadcrumbPage className="font-medium wrap-anywhere whitespace-normal text-white">
                  {item.label}
                </BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink
                  asChild
                  className="leading-none wrap-anywhere no-underline hover:text-white hover:no-underline"
                >
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <span className="leading-none wrap-anywhere">{item.label}</span>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
