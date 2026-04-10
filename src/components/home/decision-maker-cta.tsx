import Link from "@docusaurus/Link";
import type { ReactNode } from "react";

function DevCard(): ReactNode {
  return (
    <article className="bg-db-lava p-5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] md:p-6">
      <div className="mb-4 h-10 w-10 rounded-full border border-white/35 bg-[radial-gradient(circle,rgba(255,255,255,0.95)_2px,rgba(255,255,255,0.28)_3px,transparent_9px)]" />
      <h3 className="text-2xl leading-tight font-medium tracking-tight md:text-3xl">
        For Developers
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/90 md:mt-4">
        Pick a{" "}
        <Link
          to="/resources"
          className="underline decoration-white/40 underline-offset-2 hover:decoration-white/70"
        >
          guide
        </Link>
        , paste it into your coding agent, and describe what you want. Database,
        AI models, and deployment are handled. You focus on your app.
      </p>
    </article>
  );
}

function OrgCard(): ReactNode {
  return (
    <article className="border border-white/12 bg-black/80 p-5 text-white backdrop-blur-sm md:p-6">
      <div className="mb-4 h-10 w-10 rounded-full border border-white/18 bg-[radial-gradient(circle,rgba(255,255,255,0.95)_2px,rgba(255,255,255,0.28)_3px,transparent_9px)]" />
      <h3 className="text-2xl leading-tight font-medium tracking-tight md:text-3xl">
        For Your Organization
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/78 md:mt-4">
        Every app and agent runs inside your Databricks environment. Unity
        Catalog governs access to data, models, and endpoints.{" "}
        <Link
          to="/docs/start-here"
          className="underline decoration-white/30 underline-offset-2 hover:decoration-white/60"
        >
          Read the docs
        </Link>{" "}
        to learn more.
      </p>
    </article>
  );
}

export function DecisionMakerCta(): ReactNode {
  return (
    <section className="bg-white py-16 text-black dark:bg-db-navy dark:text-white md:py-20">
      <div className="container px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1.4fr] lg:gap-10">
          <div>
            <h2 className="max-w-md text-4xl leading-[1.05] font-medium tracking-tight md:text-5xl lg:text-6xl">
              Built for enterprise.
              <br />
              <span className="text-db-lava">Loved</span> by developers.
            </h2>
          </div>

          <div className="flex flex-col gap-4 sm:hidden">
            <DevCard />
            <OrgCard />
          </div>

          <div className="relative hidden min-h-[360px] overflow-hidden border border-black/10 bg-[#0d1216] sm:block dark:border-white/10 md:min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.2)_0,transparent_40%),radial-gradient(circle_at_82%_18%,rgba(255,197,92,0.35)_0,transparent_34%),radial-gradient(circle_at_35%_86%,rgba(120,205,255,0.33)_0,transparent_40%)]" />
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.26)_1px,transparent_0)] [background-size:6px_6px]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.68)_15%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.8)_100%)]" />

            <div className="absolute right-5 top-5 max-w-[280px] md:right-7 md:top-7 md:max-w-[300px]">
              <OrgCard />
            </div>

            <div className="absolute bottom-0 left-5 max-w-[280px] md:bottom-6 md:left-7 md:max-w-[300px]">
              <DevCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
