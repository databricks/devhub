import Link from "@docusaurus/Link";
import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  landingTemplates,
  type TemplatePreviewItem,
} from "@/lib/landing-content";

export function TemplatePreview(): ReactNode {
  const displayTemplates: TemplatePreviewItem[] = landingTemplates.slice(0, 3);

  return (
    <section className="bg-db-oat-medium py-16 dark:bg-[#111b20] md:py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
            <span className="text-db-lava">&#9658;</span>
            Templates
          </p>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-3xl text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">Step-by-step setup guides</span> to
              follow along or copy-paste into your coding agent.
            </h2>
            <Link
              to="/resources"
              className="shrink-0 text-sm font-medium text-black/80 no-underline hover:text-black dark:text-white/80 dark:hover:text-white"
            >
              See all templates &rarr;
            </Link>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayTemplates.map((template, index) => (
            <Link key={template.id} to={template.path} className="no-underline">
              <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-[#f7f6f4] shadow-none transition-all duration-200 hover:border-black/20 dark:border-white/10 dark:bg-[#182a32] dark:hover:border-white/20">
                <div
                  className={[
                    "relative h-44 overflow-hidden border-b border-black/10 dark:border-white/10",
                    index % 4 === 0
                      ? "bg-gradient-to-br from-[#171b21] via-[#2a3038] to-[#11141a]"
                      : "",
                    index % 4 === 1
                      ? "bg-gradient-to-br from-[#eceff2] via-[#fafafa] to-[#e8ebee]"
                      : "",
                    index % 4 === 2
                      ? "bg-gradient-to-br from-[#11141a] via-[#1b2028] to-[#0d0f14]"
                      : "",
                    index % 4 === 3
                      ? "bg-gradient-to-br from-[#e9ecef] via-[#f9fafb] to-[#e2e7eb]"
                      : "",
                  ].join(" ")}
                >
                  {index % 4 === 0 ? (
                    <div className="absolute inset-0">
                      <div className="absolute left-7 top-6 h-16 w-24 rounded-md bg-[#0e1116]/95 shadow-lg" />
                      <div className="absolute left-16 top-12 h-20 w-28 rounded-md bg-db-lava/95" />
                      <div className="absolute right-8 top-8 h-14 w-14 rounded-full border border-white/25" />
                    </div>
                  ) : null}
                  {index % 4 === 1 ? (
                    <div className="absolute inset-0">
                      <div className="absolute left-6 top-6 h-30 w-16 border-r border-black/12 bg-white/72" />
                      <div className="absolute left-28 top-12 h-2 w-24 rounded bg-black/14" />
                      <div className="absolute left-28 top-20 h-2 w-32 rounded bg-black/10" />
                      <div className="absolute left-28 top-28 h-2 w-20 rounded bg-black/12" />
                    </div>
                  ) : null}
                  {index % 4 === 2 ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.25)_1px,transparent_0)] [background-size:8px_8px]" />
                      <div className="absolute left-6 top-8 h-24 w-24 rounded-full border border-white/25" />
                      <div className="absolute right-8 bottom-7 h-14 w-20 rounded-md bg-[#0f141b] shadow-lg" />
                    </div>
                  ) : null}
                  {index % 4 === 3 ? (
                    <div className="absolute inset-0">
                      <div className="absolute left-6 top-6 h-32 w-20 border-r border-black/10 bg-white/72" />
                      <div className="absolute right-7 top-6 h-12 w-14 rounded bg-[#78a8ff]/55" />
                      <div className="absolute right-7 top-22 h-16 w-14 rounded bg-[#7dc8ff]/45" />
                    </div>
                  ) : null}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-[1.2rem] leading-tight font-medium text-black dark:text-white">
                    {template.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <p className="m-0 text-sm leading-relaxed text-black/68 dark:text-white/68">
                    {template.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags?.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-sm border border-black/10 bg-black/4 px-1.5 py-0 text-[11px] font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
