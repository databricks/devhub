import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { templates } from "@/lib/recipes/recipes";

const CARD_VISUALS: Array<{
  gradient: string;
  shapes: ReactNode;
}> = [
  {
    gradient: "bg-gradient-to-br from-[#171b21] via-[#2a3038] to-[#11141a]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-7 top-6 h-16 w-24 rounded-md bg-[#0e1116]/95 shadow-lg" />
        <div className="absolute left-16 top-12 h-20 w-28 rounded-md bg-db-lava/95" />
        <div className="absolute right-8 top-8 h-14 w-14 rounded-full border border-white/25" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#eceff2] via-[#fafafa] to-[#e8ebee]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-6 top-6 h-30 w-16 border-r border-black/12 bg-white/72" />
        <div className="absolute left-28 top-12 h-2 w-24 rounded bg-black/14" />
        <div className="absolute left-28 top-20 h-2 w-32 rounded bg-black/10" />
        <div className="absolute left-28 top-28 h-2 w-20 rounded bg-black/12" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#0f1923] via-[#162333] to-[#0a1219]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-7 top-8 h-14 w-20 rounded-sm bg-[#1a3a52]/90 shadow-lg" />
        <div className="absolute left-7 top-26 h-14 w-20 rounded-sm bg-[#1a3a52]/90 shadow-lg" />
        <div className="absolute left-32 top-14 h-20 w-24 rounded-md border border-[#2a8af6]/30 bg-[#0e1a26]/95" />
        <div className="absolute right-8 top-8 h-6 w-6 rounded-full bg-[#2a8af6]/50" />
        <div className="absolute right-10 bottom-8 h-4 w-12 rounded bg-[#2a8af6]/25" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#e9ecef] via-[#f9fafb] to-[#e2e7eb]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-6 bottom-6 h-28 w-10 rounded-t bg-[#4a9ff5]/40" />
        <div className="absolute left-20 bottom-6 h-20 w-10 rounded-t bg-[#4a9ff5]/55" />
        <div className="absolute left-34 bottom-6 h-32 w-10 rounded-t bg-[#4a9ff5]/35" />
        <div className="absolute right-10 top-8 h-2 w-20 rounded bg-black/12" />
        <div className="absolute right-10 top-14 h-2 w-14 rounded bg-black/10" />
        <div className="absolute right-10 top-20 h-2 w-18 rounded bg-black/8" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#11141a] via-[#1b2028] to-[#0d0f14]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.25)_1px,transparent_0)] [background-size:8px_8px]" />
        <div className="absolute left-8 top-8 h-12 w-28 rounded-md bg-[#1a1f28]/95 shadow-lg" />
        <div className="absolute left-8 top-24 h-12 w-28 rounded-md bg-[#1a1f28]/95 shadow-lg" />
        <div className="absolute right-6 top-6 h-32 w-24 rounded-lg border border-db-lava/30 bg-[#0e1116]/90" />
        <div className="absolute right-10 top-12 h-2 w-16 rounded bg-db-lava/40" />
        <div className="absolute right-10 top-18 h-2 w-12 rounded bg-white/15" />
        <div className="absolute right-10 top-24 h-2 w-14 rounded bg-white/10" />
      </div>
    ),
  },
];

export default function ResourcesPage(): ReactNode {
  return (
    <Layout title="Resources" description="Templates and starter resources">
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <div className="container px-4 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
              <span className="text-db-lava">&#9658;</span>
              Resources
            </p>
            <h1 className="mb-4 max-w-3xl text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">
                Guides &amp; setup instructions
              </span>{" "}
              for building on Databricks.
            </h1>
            <p className="mb-12 max-w-2xl text-lg text-black/68 dark:text-white/68">
              Step-by-step recipes to follow along or copy-paste into your
              coding agent.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {templates.map((template, index) => {
                const visual = CARD_VISUALS[index % CARD_VISUALS.length];
                return (
                  <Link
                    key={template.id}
                    to={`/resources/${template.id}`}
                    className="no-underline"
                  >
                    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-[#f7f6f4] shadow-none transition-all duration-200 hover:border-black/20 dark:border-white/10 dark:bg-[#182a32] dark:hover:border-white/20">
                      <div
                        className={`relative h-52 overflow-hidden border-b border-black/10 dark:border-white/10 ${visual.gradient}`}
                      >
                        {visual.shapes}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl leading-tight font-medium text-black dark:text-white">
                          {template.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 pt-0">
                        <p className="m-0 text-[15px] leading-relaxed text-black/68 dark:text-white/68">
                          {template.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.map((tag) => (
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
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
