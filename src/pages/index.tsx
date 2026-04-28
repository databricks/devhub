import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import { DecisionMakerCta } from "@/components/home/decision-maker-cta";
import { HeroSection } from "@/components/home/hero-section";
import { TemplatePreview } from "@/components/home/template-preview";
import { WizardFlow } from "@/components/home/wizard-flow";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/$/, "");
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
            url: siteUrl,
            logo: `${siteUrl}/img/databricks-logo.svg`,
            sameAs: ["https://www.linkedin.com/company/databricks"],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Databricks Developer",
            url: siteUrl,
          })}
        </script>
      </Head>
      <main>
        <HeroSection />
        <WizardFlow />
        <TemplatePreview />
        <DecisionMakerCta />
      </main>
    </Layout>
  );
}
