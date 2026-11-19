import type { ReactNode } from "react";

import { getReplitTemplateIds } from "@/lib/content-markdown";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import {
  buildTemplateItems,
  filterZerobusTemplateItems,
} from "@/lib/templates/template-items";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import { Hero } from "@/components/templates/hero";
import { TemplateItemsSection } from "@/components/templates/template-items-section";
import { ZerobusTemplatesSection } from "@/components/templates/zerobus-templates-section";

const pageUrl = absoluteSiteUrl("/templates");

export const metadata = getMetadata({
  title: "Templates",
  description: "Templates to jumpstart your next Databricks app",
  markdownPath: "/templates.md",
  pathname: "/templates",
});

function getIncludeDrafts(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
}

export default function TemplatesPage(): ReactNode {
  const templateItems = buildTemplateItems(getIncludeDrafts());
  const replitTemplateIds = getReplitTemplateIds();

  return (
    <main className="bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Databricks Templates",
            description: "Templates to jumpstart your next Databricks app.",
            url: pageUrl,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <div className="bg-[#f9f7f4] text-black">
        <div className="bg-orange h-12" aria-hidden="true" />
        <ZerobusTemplatesSection
          items={filterZerobusTemplateItems(templateItems)}
        />
        <TemplateItemsSection
          items={templateItems}
          replitTemplateIds={replitTemplateIds}
        />
        <CTA
          label="Start building"
          title="Ready to ship your next agentic app in minutes?"
          className="mx-auto mt-24 max-w-432 pt-1.5 pb-16 md:mt-36 lg:mt-44 lg:pb-22 xl:mt-60"
        />
        <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
