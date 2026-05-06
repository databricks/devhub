import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "@docusaurus/Link";
import { BootstrapCopyButton } from "@/components/home/bootstrap-copy-button";

const secondaryCtaClassName =
  "inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-medium text-black/80 no-underline dark:border-white/15 dark:bg-white/8 dark:text-white/80";

export function HeroSection(): ReactNode {
  return (
    <section className="relative bg-db-oat-medium text-black dark:bg-black dark:text-white">
      <div className="container px-4 py-20 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-5xl leading-[1.08] font-medium tracking-tight md:text-7xl">
            Build <span className="text-db-lava">agentic applications</span> in
            minutes, not months.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/60 md:text-lg dark:text-white/60">
            Copy the prompt into Cursor, Claude Code, Codex, or any coding agent
            — <br className="hidden md:inline" />
            it will walk you through building a complete app, step by step.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <BootstrapCopyButton source="hero" />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("wizard-flow")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={secondaryCtaClassName}
              >
                How it works
                <ArrowRight className="h-4 w-4 rotate-90" />
              </button>
              <Link to="/templates" className={secondaryCtaClassName}>
                Browse templates
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-db-lava" />
    </section>
  );
}
