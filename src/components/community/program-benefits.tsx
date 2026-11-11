import { mvpProgram } from "@/lib/community/mvp-program";
import { InlineLinks } from "@/components/community/inline-links";
import { SectionKicker } from "@/components/products/section-kicker";

export function MVPBenefits() {
  const { benefitsIntro, benefits } = mvpProgram;
  return (
    <section
      id="program"
      aria-labelledby="mvp-benefits"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32 xl:pt-60 xl:pb-40"
    >
      <SectionKicker className="text-grey-50">
        {benefitsIntro.kicker}
      </SectionKicker>
      <h2
        id="mvp-benefits"
        className="mt-6 max-w-240 text-3xl/tight font-normal tracking-[-0.04em] md:text-4xl/tight xl:text-[2.75rem]/[1.25]"
      >
        {benefitsIntro.title}
        <br />
        <span className="text-grey-70">[{benefitsIntro.description}]</span>
      </h2>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {benefits.map(({ title, description }) => (
          <article key={title} className="border-grey-20 border-t pt-7">
            <h3 className="text-2xl/tight font-medium tracking-tight text-pretty lg:whitespace-pre-line xl:text-[1.75rem]/[1.25]">
              {title}
            </h3>
            <p className="mt-3 text-base/6 tracking-[-0.04em] text-pretty text-white/80 sm:max-w-64">
              <InlineLinks text={description} />
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
