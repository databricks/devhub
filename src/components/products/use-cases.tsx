import type { ProductPageContent } from "@/lib/products/product-page";
import { SectionKicker } from "@/components/products/section-kicker";

type UseCasesProps = {
  content: ProductPageContent;
};

export function UseCases({ content }: UseCasesProps) {
  return (
    <section className="bg-db-navy py-18 text-white md:py-28 lg:pt-40 lg:pb-60">
      <div className="mx-auto w-full max-w-304 px-5 md:px-8 xl:px-0">
        <SectionKicker className="text-grey-70">
          {content.useCasesIntro.eyebrow}
        </SectionKicker>
        <h2 className="mt-6 max-w-240 font-sans text-4xl leading-tight font-normal tracking-[-0.04em] md:text-[2.5rem] lg:text-[2.75rem]">
          {content.useCasesIntro.title}{" "}
          <span className="text-white/60">
            [{content.useCasesIntro.description}]
          </span>
        </h2>
        <div className="mt-20 grid gap-x-9 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(4,17.5rem)] xl:gap-x-8 xl:gap-y-12.5">
          {content.useCases.map((item) => (
            <article className="border-t border-white/22 pt-7" key={item.title}>
              <h3 className="max-w-70 text-xl leading-tight font-medium tracking-tight text-balance md:text-2xl lg:text-[1.75rem]">
                {item.title}
              </h3>
              <p className="mt-2.5 max-w-64 text-base tracking-normal text-pretty text-white/80">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
