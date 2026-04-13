import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { pillars, type Pillar } from "@/lib/landing-content";

function PillarVisual({ index }: { index: number }): ReactNode {
  return (
    <div
      className={[
        "relative aspect-[4/3] w-full overflow-hidden rounded-lg",
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
          <div className="absolute left-10 top-8 h-32 w-32 rotate-45 border border-white/60" />
          <div className="absolute left-20 top-12 h-32 w-32 rotate-45 border border-white/35" />
          <div className="absolute right-8 bottom-8 h-20 w-40 rounded-md border border-white/20 bg-white/5" />
          <div className="absolute right-12 bottom-14 h-2 w-24 rounded bg-white/20" />
          <div className="absolute right-12 bottom-20 h-2 w-16 rounded bg-white/15" />
        </div>
      ) : null}
      {index === 1 ? (
        <div className="absolute inset-0">
          <div className="absolute left-8 top-8 h-14 w-14 rounded-full bg-[#0c4a63]/90" />
          <div className="absolute left-28 top-10 h-16 w-16 bg-[#e6b83d]" />
          <div className="absolute left-[5rem] top-28 h-18 w-18 rounded-md bg-[#f4c1b4]" />
          <div className="absolute right-12 top-12 h-24 w-24 rounded-full border border-[#6f7682]/40" />
          <div className="absolute right-8 bottom-10 h-16 w-32 rounded-md border border-black/8 bg-white/60" />
          <div className="absolute right-12 bottom-16 h-2 w-20 rounded bg-black/10" />
        </div>
      ) : null}
      {index === 2 ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(239,83,54,0.8)_1px,transparent_0)] [background-size:10px_10px]" />
          <div className="absolute left-8 top-8 h-24 w-44 rounded-md border border-white/15 bg-white/5" />
          <div className="absolute left-12 top-14 h-2 w-28 rounded bg-white/20" />
          <div className="absolute left-12 top-20 h-2 w-16 rounded bg-white/15" />
          <div className="absolute right-8 bottom-8 h-20 w-28 rounded-md border border-white/10 bg-white/5" />
        </div>
      ) : null}
    </div>
  );
}

function PillarRow({
  pillar,
  index,
}: {
  pillar: Pillar;
  index: number;
}): ReactNode {
  const isReversed = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      className={[
        "grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12",
        isReversed ? "md:[direction:rtl]" : "",
      ].join(" ")}
    >
      <div className={isReversed ? "md:[direction:ltr]" : ""}>
        <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
          <span className="text-db-lava">{number}</span>
          <span className="text-black/50 dark:text-white/50">
            {pillar.title}
          </span>
        </p>
        <h3 className="text-2xl leading-snug font-medium tracking-tight text-black dark:text-white md:text-3xl">
          {pillar.subtitle}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-black/50 italic dark:text-white/50">
          {pillar.description}
        </p>
        <Link
          to={pillar.link}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-db-lava no-underline hover:underline"
        >
          Learn more
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1 13L13 1M13 1H3M13 1v10" />
          </svg>
        </Link>
      </div>
      <div className={isReversed ? "md:[direction:ltr]" : ""}>
        <PillarVisual index={index} />
      </div>
    </div>
  );
}

export function PillarStrip(): ReactNode {
  return (
    <section className="bg-db-oat-medium py-16 dark:bg-black md:py-24">
      <div className="container px-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-16 md:gap-24">
          {pillars.map((pillar, index) => (
            <PillarRow key={pillar.title} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
