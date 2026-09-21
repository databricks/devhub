import { SectionKicker } from "@/components/products/section-kicker";

const mvpBenefits = [
  [
    "Join the MVP\nCommunity",
    "Connect with other Databricks MVPs through a dedicated private community.",
  ],
  [
    "Connect With\nExperts",
    "Connect directly with Databricks and open source product managers and engineers.",
  ],
  [
    "Get Early\nAccess",
    "Try out new features and products before they are released and early roadmap access.",
  ],
  [
    "Receive monthly\ncredits",
    "Get monthly credits to develop content and create demos.",
  ],
  [
    "Attend Data + AI\nSummit",
    "Attend the annual Databricks Data + AI Summit with complimentary passes.",
  ],
  [
    "Share Your\nExpertise",
    "Get opportunities to share your expertise at events, like Data + AI Summit.",
  ],
  [
    "Showcase Your\nMVP Status",
    "Showcase your MVP status with an official badge across your social profiles and website.",
  ],
  [
    "Earn Community\nRecognition",
    "Get featured across Databricks’ website and social media channels.",
  ],
];

export function MVPBenefits() {
  return (
    <section
      id="program"
      aria-labelledby="mvp-benefits"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32 xl:pt-60 xl:pb-40"
    >
      <SectionKicker className="text-grey-50">Program Benefits</SectionKicker>
      <h2
        id="mvp-benefits"
        className="mt-6 max-w-240 text-3xl/tight font-normal tracking-[-0.04em] md:text-4xl/tight xl:text-[2.75rem]/[1.25]"
      >
        See what MVPs get from the program.
        <br />
        <span className="text-grey-70">
          [Connect, contribute, and grow your impact.]
        </span>
      </h2>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {mvpBenefits.map(([title, description]) => (
          <article key={title} className="border-grey-20 border-t pt-7">
            <h3 className="text-2xl/tight font-medium tracking-tight text-pretty lg:whitespace-pre-line xl:text-[1.75rem]/[1.25]">
              {title}
            </h3>
            <p className="mt-3 text-base/6 tracking-[-0.04em] text-pretty text-white/80 sm:max-w-64">
              {title === "Share Your\nExpertise" ? (
                <>
                  Get opportunities to share your expertise at events, like{" "}
                  <a
                    href="https://www.databricks.com/dataaisummit"
                    className="text-orange underline-offset-4 hover:underline"
                  >
                    Data + AI Summit
                  </a>
                  .
                </>
              ) : (
                description
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
