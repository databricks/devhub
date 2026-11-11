import type { PersonKind } from "@/lib/community/schema";

export function DirectoryHero({ kind }: { kind: PersonKind }) {
  const mvp = kind === "mvp";
  return (
    <section className="bg-black pt-16 pb-20 text-white md:pt-24 md:pb-22 xl:pt-22.75">
      <div className="mx-auto max-w-7xl px-5 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-end md:gap-8 md:px-8 xl:gap-24">
        <h1 className="font-sans text-4xl/none font-normal tracking-normal md:text-[2.75rem]/none lg:text-5xl/none xl:indent-24 xl:text-[4rem]/none">
          <span className="text-db-lava">
            {mvp ? "Meet the MVPs." : "Student Fellows."}
          </span>{" "}
          {mvp
            ? "[The people behind the impact.]"
            : "[Meet the next generation of AI.]"}
        </h1>
        <p className="text-grey-80 mt-6 max-w-80 text-base/tight md:mt-0 xl:pb-1.25">
          {mvp
            ? "Meet experts who share knowledge, build community, and grow the Databricks ecosystem."
            : "Meet the students building, learning, and shaping the future of data and AI."}
        </p>
      </div>
    </section>
  );
}
