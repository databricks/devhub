import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/code/copy-button";

export function HeroSection(): ReactNode {
  return (
    <section className="relative bg-white text-black dark:bg-black dark:text-white">
      <div className="container px-4 py-10 md:py-14">
        <div className="grid min-h-[560px] grid-cols-1 md:grid-cols-2">
          <div className="flex max-w-xl flex-col justify-center gap-8 md:py-8">
            <div className="space-y-7">
              <h1 className="text-5xl leading-tight font-medium tracking-tight md:text-6xl">
                Build agentic applications in minutes, not months.
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex h-10 items-stretch overflow-hidden rounded-full border border-black/22 bg-white pl-4 font-mono text-sm text-black dark:border-white/24 dark:bg-black dark:text-white">
                  <code className="m-0 flex items-center bg-transparent p-0 pr-2 text-inherit dark:text-white">
                    $ npx databricks-init
                  </code>
                  <CopyButton
                    text="npx databricks-init"
                    label="Copy command"
                    variant="segment"
                    className="!h-full !w-11 !rounded-none !rounded-r-full !border-l !border-black/16 !bg-transparent !text-black hover:!bg-black/10 hover:!text-black dark:!border-white/18 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/16 dark:hover:!text-white"
                  />
                </div>
                <Button asChild className="h-10 rounded-full px-6 font-medium">
                  <Link to="/docs/get-started/getting-started">
                    Get started
                  </Link>
                </Button>
              </div>
            </div>
            <p className="max-w-md text-base leading-relaxed text-black/68 dark:text-white/72">
              Lakebase for your data. AgentBricks for your AI. Databricks Apps
              for your deployment. One platform, one command, production-ready.
            </p>
          </div>
          <div className="hidden md:block" />
        </div>
      </div>
      <div className="h-3 w-full bg-db-lava" />
    </section>
  );
}
