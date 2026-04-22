import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import { DecisionMakerCta } from "@/components/home/decision-maker-cta";
import { HeroSection } from "@/components/home/hero-section";
import { PillarStrip } from "@/components/home/pillar-strip";
import { TemplatePreview } from "@/components/home/template-preview";
import { WizardFlow } from "@/components/home/wizard-flow";

export default function Home(): ReactNode {
  return (
    <Layout
      title="Databricks Developer"
      description="Build intelligent data and AI applications in minutes, not months."
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Databricks",
            url: "https://dev.databricks.com",
            logo: "https://dev.databricks.com/img/databricks-logo.svg",
            sameAs: ["https://www.linkedin.com/company/databricks"],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Databricks Developer",
            url: "https://dev.databricks.com",
          })}
        </script>
      </Head>
      <main>
        <HeroSection />
        <WizardFlow />
        {/* <PillarStrip /> */}
        <TemplatePreview />
        <DecisionMakerCta />
      </main>
    </Layout>
  );
}
