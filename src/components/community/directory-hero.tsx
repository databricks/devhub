import type { PersonKind } from "@/lib/community/schema";

export function DirectoryHero({ kind }: { kind: PersonKind }) {
  const mvp = kind === "mvp";
  return (
    <section className="bg-black pt-16 pb-20 text-white md:pt-24 md:pb-28 xl:pt-40 xl:pb-29">
      <div className="relative mx-auto max-w-400 px-5 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-end md:gap-8 md:px-8 lg:block">
        <h1 className="max-w-240 font-sans text-4xl/none font-normal tracking-normal text-pretty md:text-[2.75rem]/none lg:text-6xl/none xl:indent-20 xl:text-7xl/none 2xl:max-w-336 2xl:indent-40 2xl:text-8xl/none">
          <span className="text-db-lava">
            {mvp ? "Meet the MVPs." : "Student Fellows."}
          </span>{" "}
          {mvp
            ? "[The people behind the impact.]"
            : "[Meet the next generation of AI.]"}
        </h1>
        <p className="text-grey-80 mt-6 max-w-80 text-base/tight text-pretty md:mt-0 lg:absolute lg:right-8 lg:bottom-2 lg:max-w-95 xl:max-w-64">
          {mvp
            ? "Meet experts who share knowledge, build community, and grow the Databricks ecosystem."
            : "Meet the students building, learning, and shaping the future of data and AI."}
        </p>
      </div>
    </section>
  );
}
