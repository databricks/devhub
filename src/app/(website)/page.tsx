import type { ReactNode } from "react";

import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import Features from "@/components/home/features";
import Hero from "@/components/home/hero";
import Templates from "@/components/home/templates";

export const metadata = getMetadata({
  title: "Databricks Developer",
  titleMode: "absolute",
  description: "Build and deploy data apps and AI agents on Databricks.",
  pathname: "/",
});

export default function HomePage(): ReactNode {
  const siteUrl = absoluteSiteUrl("/");

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Databricks",
            url: siteUrl,
            logo: absoluteSiteUrl("/img/databricks-logo.svg"),
            sameAs: ["https://www.linkedin.com/company/databricks"],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Databricks Developer",
            url: siteUrl,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Databricks Developer",
            description:
              "Build and deploy data apps and AI agents on Databricks.",
            url: siteUrl,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <Templates />
      <Features />
      <div className="bg-db-paper text-black">
        <CTA
          className="mx-auto max-w-432 pb-16 lg:pb-22"
          label="Start building"
          title="Ready to ship your next agentic app in minutes?"
          description="Start from Databricks templates, connect your data, and deploy with the tools your team already uses."
          actions={null}
        />
        <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
