import { getMetadata } from "@/lib/get-metadata";
import { BrandStrip } from "@/components/ui/brand-strip";
import { CommunityCTA } from "@/components/community/community-cta";
import { MVPBenefits } from "@/components/community/program-benefits";
import { ProgramHero } from "@/components/community/program-hero";
import { MVPRequirements } from "@/components/community/program-requirements";
import Footer from "@/components/footer";

export const metadata = getMetadata({
  title: "Databricks MVPs",
  description:
    "How Databricks recognizes and supports experts in the Data + AI community. Explore program benefits, meet the MVPs, and nominate a peer.",
  imagePath: "/img/community/mvp-og-image.jpg",
  pathname: "/mvps",
});

export default function MVPPage() {
  return (
    <main className="bg-black text-white">
      <ProgramHero kind="mvp" />
      <MVPBenefits />
      <BrandStrip className="h-12" />
      <div className="bg-db-paper text-black">
        <MVPRequirements />
        <CommunityCTA variant="mvp" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
