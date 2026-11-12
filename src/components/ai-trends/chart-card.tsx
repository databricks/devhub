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
  updated,
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
  updated?: string;
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
        "border-foreground/15 flex min-w-0 scroll-mt-24 flex-col gap-0 rounded-lg border bg-white p-4 shadow-none md:px-6 md:pt-4 md:pb-6",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex flex-wrap items-start gap-x-3 gap-y-2">
          <h3 className="text-foreground min-w-0 grow basis-full text-base font-semibold sm:basis-0">
            {title}
          </h3>
          {placeholder || updated || shareSlug ? (
            <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
              {placeholder ? (
                <span className="bg-orange/15 text-orange rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Placeholder data
                </span>
              ) : null}
              {updated ? (
                <span className="text-foreground/65 text-xs leading-6">
                  Updated {updated}
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
        <p className="mb-5 max-w-4xl text-sm text-black/60">{description}</p>
      ) : null}
      <div className="min-w-0 flex-none">{children}</div>
      {note ? (
        <p className="border-foreground/10 text-foreground/65 mt-5 border-t pt-4 text-xs leading-relaxed">
          {note}
        </p>
      ) : null}
    </Card>
  );
}
