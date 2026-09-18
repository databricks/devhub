import { SectionKicker } from "@/components/products/section-kicker";

const membership = [
  {
    label: "Share knowledge",
    title: "Create and share technical content.",
    items: [
      "Write thought-leadership blogs and technical guides",
      "Publish video demonstrations and tutorials",
      "Post product breakdowns and tips on social media",
    ],
  },
  {
    label: "Build community",
    title: "Help create an active, welcoming, and connected community.",
    items: [
      "Speak at industry conferences and data meetups",
      "Answer questions and share experiences on Reddit",
      "Engage actively in the official Databricks Community forum",
    ],
  },
  {
    label: "Grow the ecosystem",
    title: "Help grow the Databricks developer community.",
    items: [
      "Organize local or virtual Databricks meetups",
      "Develop courses and webinars to educate users",
      "Expand the global developer footprint",
    ],
  },
  {
    label: "Shape the future",
    title: "Support and help shape the Databricks and the MVP program.",
    items: [
      "Champion new products and feature releases",
      "Provide candid feedback on what is and isn't working",
      "Collaborate with fellow MVPs to refine and publish content",
    ],
  },
];

export function MVPRequirements() {
  return (
    <section
      aria-labelledby="membership-requirements"
      className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32 xl:pt-40"
    >
      <SectionKicker className="text-grey-40">
        Membership Requirements
      </SectionKicker>
      <h2
        id="membership-requirements"
        className="mt-6 max-w-3xl text-3xl/tight font-normal tracking-[-0.04em] text-pretty md:text-4xl/tight xl:text-[2.75rem]/[1.25]"
      >
        How Databricks MVPs contribute to the community.{" "}
        <span className="text-grey-40">
          MVPs share knowledge and grow the ecosystem.
        </span>
      </h2>
      <div className="mt-14 flex flex-col gap-14 lg:mt-20 lg:gap-16">
        {membership.map(({ label, title, items }, index) => (
          <article
            key={label}
            className="grid gap-6 lg:grid-cols-[256px_1fr] lg:gap-16"
          >
            <div className="pt-4">
              <SectionKicker index={`0${index + 1}`}>{label}</SectionKicker>
            </div>
            <div className="relative grid gap-6 border-t border-black/10 pt-4 xl:min-h-41.75 xl:grid-cols-[320px_1fr] xl:gap-16 xl:border-0">
              <img
                src="/img/community/membership-rule.svg"
                alt=""
                aria-hidden="true"
                width={897}
                height={41}
                className="pointer-events-none absolute top-0 left-0 hidden h-10 w-full xl:block"
              />
              <h3 className="text-xl/normal font-normal tracking-tight text-pretty">
                {title}
              </h3>
              <ul className="flex flex-col gap-3 text-base/6 tracking-tight text-black/80 xl:pt-13.5">
                {items.map((item) => (
                  <li className="flex items-start gap-2.5" key={item}>
                    <span
                      className="bg-orange mt-2 size-2 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-pretty">
                      {item ===
                      "Engage actively in the official Databricks Community forum" ? (
                        <>
                          Engage actively in the official{" "}
                          <a
                            href="https://community.databricks.com/"
                            className="text-orange underline-offset-4 hover:underline"
                          >
                            Databricks Community forum
                          </a>
                        </>
                      ) : (
                        item
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
