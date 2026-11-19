import type { ReactNode } from "react";

import { TemplateCard } from "@/components/templates/template-card";
import type { TemplateItem } from "@/components/templates/template-card";

type ZerobusTemplatesSectionProps = {
  items: TemplateItem[];
};

export function ZerobusTemplatesSection({
  items,
}: ZerobusTemplatesSectionProps): ReactNode {
  if (items.length === 0) return null;

  return (
    <section
      id="zerobus-templates"
      className="scroll-mt-24 pt-12 text-black md:pt-16"
    >
      <div className="mx-auto w-full max-w-400 px-5 md:px-8">
        <h2 className="m-0 text-3xl leading-tight font-normal tracking-[-0.04em] md:text-5xl/[1.125] lg:text-[3.5rem]">
          Zerobus Ingest templates
        </h2>
        <div className="mt-12 grid min-w-0 gap-y-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16 xl:gap-x-16">
          {items.map((item, index) => (
            <TemplateCard key={item.data.id} item={item} index={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
