import type {
  ProductFeature,
  ProductPageContent,
} from "@/lib/products/product-page";
import { SectionKicker } from "@/components/products/section-kicker";

type ProductFeaturesProps = {
  content: ProductPageContent;
};

const featureVisualSrc = {
  branching: "/img/products/features/branching.png",
  autoscaling: "/img/products/features/autoscaling.png",
  "lakehouse-sync": "/img/products/features/lakehouse-sync.svg",
  "multi-model": "/img/products/features/multi-model.png",
  "built-in": "/img/products/features/built-in.png",
  "secure-data": "/img/products/features/secure-data.png",
  serverless: "/img/products/features/serverless.svg",
  auth: "/img/products/features/auth.svg",
  integrations: "/img/products/features/integrations.svg",
} satisfies Partial<Record<ProductFeature["visual"], string>>;

function FeatureRow({ feature }: { feature: ProductFeature }) {
  const src = featureVisualSrc[feature.visual];

  return (
    <article className="mx-auto grid w-full max-w-184 grid-cols-1 gap-6 md:gap-12 lg:max-w-none lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:max-w-none xl:grid-cols-2 2xl:max-w-384 2xl:grid-cols-[minmax(0,42rem)_minmax(0,46rem)] 2xl:gap-32">
      <div className="flex h-full flex-col">
        <SectionKicker index={feature.index}>{feature.eyebrow}</SectionKicker>
        <div className="mt-5 flex flex-1 flex-col justify-between gap-6 md:mt-6 md:gap-8 lg:mt-7 lg:gap-12 lg:pl-8">
          <h3 className="3xl:text-[2.5rem] max-w-152 text-[1.75rem] leading-tight font-normal tracking-[-0.04em] text-balance text-black md:max-w-none md:text-[2rem] lg:max-w-152 lg:text-4xl">
            {feature.title}{" "}
            <span className="text-black/35">[{feature.description}]</span>
          </h3>
          <div>
            <p className="max-w-152 text-base tracking-normal text-black">
              {feature.body}
            </p>
            <ul className="mt-5 grid max-w-152 grid-cols-1 grid-rows-3 divide-y divide-black/10 border-y border-black/10 md:mt-6 md:max-w-none lg:mt-7 lg:max-w-152">
              {feature.details.map((detail) => (
                <li
                  className="flex min-w-0 items-center gap-2.5 py-3 text-base tracking-normal text-black"
                  key={detail}
                >
                  <span
                    className="bg-orange size-2 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-db-oat-light relative aspect-square w-full overflow-hidden border border-black lg:aspect-auto lg:h-full">
        {src ? (
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="block h-full w-full object-cover lg:object-contain lg:object-center"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
    </article>
  );
}

export function Features({ content }: ProductFeaturesProps) {
  return (
    <section className="bg-[#f9f7f4] pt-14 pb-18 text-black md:pt-18 md:pb-28 lg:pt-26 lg:pb-50 xl:pt-40">
      <div className="3xl:max-w-400 mx-auto w-full max-w-7xl px-5 md:px-8">
        <SectionKicker className="text-grey-40">
          {content.featuresIntro.eyebrow}
        </SectionKicker>
        <h2 className="mt-4 font-sans text-[2rem]/tight tracking-[-0.04em] text-balance whitespace-pre-line md:mt-4.5 md:text-[2.5rem] lg:mt-5 lg:max-w-4xl lg:text-[3.75rem] 2xl:max-w-full">
          {content.featuresIntro.title}
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-16 md:mt-24 md:gap-28 lg:mt-32 lg:gap-50">
          {content.features.map((feature) => (
            <FeatureRow feature={feature} key={feature.index} />
          ))}
        </div>
      </div>
    </section>
  );
}
