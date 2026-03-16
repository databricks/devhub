import type { ReactNode } from "react";

export function DecisionMakerCta(): ReactNode {
  return (
    <section className="bg-db-navy py-16 text-white dark:bg-black md:py-20">
      <div className="container px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-[1.05fr_1.4fr] md:gap-10">
          <div>
            <h2 className="max-w-md text-4xl leading-[1.05] font-medium tracking-tight md:text-6xl">
              Built for enterprise.
              <br />
              <span className="text-db-lava">Loved</span> by developers.
            </h2>
          </div>

          <div className="relative min-h-[360px] overflow-hidden border border-white/10 bg-[#0d1216] md:min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.2)_0,transparent_40%),radial-gradient(circle_at_82%_18%,rgba(255,197,92,0.35)_0,transparent_34%),radial-gradient(circle_at_35%_86%,rgba(120,205,255,0.33)_0,transparent_40%)]" />
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.26)_1px,transparent_0)] [background-size:6px_6px]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.68)_15%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.8)_100%)]" />

            <article className="absolute right-5 top-5 max-w-[300px] border border-white/12 bg-black/80 p-6 text-white backdrop-blur-sm md:right-7 md:top-7">
              <div className="mb-4 h-10 w-10 rounded-full border border-white/18 bg-[radial-gradient(circle,rgba(255,255,255,0.95)_2px,rgba(255,255,255,0.28)_3px,transparent_9px)]" />
              <h3 className="text-3xl leading-tight font-medium tracking-tight">
                For Your Organization
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/78">
                Every app and agent runs inside your Databricks environment.
                Unity Catalog governs access to data, models, and endpoints.
                Your developers ship faster without adding risk.
              </p>
            </article>

            <article className="absolute -bottom-0 left-5 max-w-[300px] bg-db-lava p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] md:bottom-6 md:left-7">
              <div className="mb-4 h-10 w-10 rounded-full border border-white/35 bg-[radial-gradient(circle,rgba(255,255,255,0.95)_2px,rgba(255,255,255,0.28)_3px,transparent_9px)]" />
              <h3 className="text-3xl leading-tight font-medium tracking-tight">
                For Developers
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/90">
                Pick a template, run one command, and your agentic app is live -
                with a database, AI model access, and auth already wired up.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
