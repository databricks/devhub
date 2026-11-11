import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import type { ProductPageContent } from "@/lib/products/product-page";
import {
  getProductPageByRouteSlug,
  getProductRouteSlugs,
} from "@/lib/products/product-pages";
import { BrandStrip } from "@/components/ui/brand-strip";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import { Features } from "@/components/products/features";
import { Hero } from "@/components/products/hero";
import { TestimonialsSlider } from "@/components/products/testimonials-slider";
import { UseCases } from "@/components/products/use-cases";

type ProductPageParams = Promise<{ slug: string }>;

export const dynamicParams = false;

function getProductJsonLd(content: ProductPageContent): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.title,
    description: content.description,
    url: absoluteSiteUrl(content.canonicalPath),
    brand: {
      "@type": "Brand",
      name: "Databricks",
    },
  }).replace(/</g, "\\u003c");
}

export default async function ProductPage({
  params,
}: {
  params: ProductPageParams;
}): Promise<ReactNode> {
  const { slug } = await params;
  const product = getProductPageByRouteSlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <div className={`product-${product.slug}-layout`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getProductJsonLd(product) }}
      />
      <main>
        <Hero content={product} />
        <BrandStrip />
        <Features content={product} />
        <BrandStrip />
        <UseCases content={product} />
        <TestimonialsSlider content={product} />
      </main>
      <div className="bg-db-navy flow-root">
        <CTA className="mx-auto mt-18 max-w-432 pt-1.5 pb-16 md:mt-24 lg:mt-32 lg:pb-22 xl:mt-38" />
        <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
      </div>
    </div>
  );
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getProductRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: ProductPageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductPageByRouteSlug(slug);
  if (!product) {
    return {};
  }

  return getMetadata({
    title: product.title,
    description: product.description,
    imagePath: product.hero.image.src,
    markdownPath: `${product.canonicalPath}.md`,
    pathname: product.canonicalPath,
  });
}
