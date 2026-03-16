import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pillars } from "@/lib/landing-content";

export function PillarStrip(): ReactNode {
  return (
    <section className="bg-db-oat-medium py-16 dark:bg-black md:py-20">
      <div className="container px-4">
        <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:items-start">
          <p className="max-w-[210px] text-xs leading-relaxed tracking-[0.01em] text-black/60 dark:text-white/60">
            Bring data, models, and deployment together on a governed platform
            designed to help teams ship agentic systems faster.
          </p>
          <div className="max-w-2xl">
            <h2 className="mb-5 text-[2.05rem] leading-[1.1] font-normal tracking-tight text-black dark:text-white sm:text-[2.35rem]">
              The agentic stack{" "}
              <span className="text-db-lava">for data and AI</span> to build,
              deploy, and govern intelligent applications on one platform.
            </h2>
            <Button
              asChild
              className="h-8 rounded-full bg-black px-4 text-xs font-medium text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <a
                href="https://login.databricks.com/signup"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign Up
              </a>
            </Button>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Link key={pillar.title} to={pillar.link} className="no-underline">
              <Card className="group h-full overflow-hidden rounded-xl border border-black/12 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-black/25 dark:border-white/12 dark:bg-[#182a32] dark:hover:border-white/25">
                <div
                  className={[
                    "relative h-48 overflow-hidden",
                    index === 0
                      ? "bg-gradient-to-br from-[#17353d] via-[#2e5960] to-[#4f838b]"
                      : "",
                    index === 1
                      ? "bg-gradient-to-br from-[#f0eee9] via-[#f5f2eb] to-[#e9e5dc]"
                      : "",
                    index === 2
                      ? "bg-gradient-to-br from-[#11141a] via-[#1b2028] to-[#11141a]"
                      : "",
                  ].join(" ")}
                >
                  {index === 0 ? (
                    <div className="absolute inset-0">
                      <div className="absolute left-8 top-7 h-28 w-28 rotate-45 border border-white/70" />
                      <div className="absolute left-16 top-10 h-28 w-28 rotate-45 border border-white/45" />
                    </div>
                  ) : null}
                  {index === 1 ? (
                    <div className="absolute inset-0">
                      <div className="absolute left-8 top-8 h-12 w-12 rounded-full bg-[#0c4a63]/90" />
                      <div className="absolute left-24 top-9 h-14 w-14 bg-[#e6b83d]" />
                      <div className="absolute left-[4.6rem] top-24 h-16 w-16 rounded-md bg-[#f4c1b4]" />
                      <div className="absolute right-10 top-10 h-20 w-20 rounded-full border border-[#6f7682]/45" />
                    </div>
                  ) : null}
                  {index === 2 ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_1px_1px,rgba(239,83,54,0.9)_1px,transparent_0)] [background-size:10px_10px]" />
                    </div>
                  ) : null}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[1.08rem] text-black dark:text-white">
                    {pillar.title}
                  </CardTitle>
                  <p className="text-sm font-normal text-black/85 dark:text-white/85">
                    {pillar.subtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="m-0 text-sm leading-relaxed text-black/68 dark:text-white/68">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
