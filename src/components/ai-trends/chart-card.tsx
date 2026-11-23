import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

import { ShareControl } from "./share-control";

function requireShareVersion(slug: string, version?: string): string {
  if (!version) throw new Error(`Chart card "${slug}" has no shareVersion`);
  return version;
}

export function ChartCard({
  id,
  title,
  placeholder = false,
  description,
  note,
  shareSlug,
  shareVersion,
  shareTitle,
  getShareImage,
  children,
  className,
}: {
  id?: string;
  title?: string;
  placeholder?: boolean;
  description?: ReactNode;
  note?: ReactNode;
  shareSlug?: string;
  /** `getShareVersion(shareSlug)`, required with `shareSlug`. */
  shareVersion?: string;
  /** The share card title, for the X post text, when it differs from `title`. */
  shareTitle?: string;
  getShareImage?: () => Promise<Blob>;
  children?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <Card
      id={shareSlug ?? id}
      className={cn(
        "border-db-navy flex min-w-0 scroll-mt-24 flex-col gap-0 rounded-none border bg-white p-4 shadow-none md:px-6 md:pt-5 md:pb-6",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex flex-wrap items-start gap-x-3 gap-y-3 md:mb-5">
          <div className="min-w-0 grow basis-full sm:basis-0">
            <h3 className="text-xl/snug font-normal tracking-tight text-pretty text-black md:text-2xl/snug">
              {title}
            </h3>
          </div>
          {placeholder || shareSlug ? (
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              {placeholder ? (
                <span className="border-orange text-orange border px-1.5 py-1 font-mono text-xs/none font-medium uppercase">
                  Placeholder data
                </span>
              ) : null}
              {shareSlug ? (
                <ShareControl
                  shareSlug={shareSlug}
                  shareVersion={requireShareVersion(shareSlug, shareVersion)}
                  title={shareTitle ?? title}
                  getImage={getShareImage}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {description ? (
        <p className="mb-5 max-w-4xl text-sm tracking-tight text-black/80">
          {description}
        </p>
      ) : null}
      <div className="min-w-0 flex-none">{children}</div>
      {note ? (
        <div className="pt-5 md:pt-6">
          <p className="border-db-navy/15 text-grey-40 border-t pt-4 text-sm/normal tracking-tight text-pretty">
            {note}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
