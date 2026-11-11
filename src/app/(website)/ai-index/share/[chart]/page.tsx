import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getShareCard,
  getSharePath,
  getShareSlugs,
} from "@/lib/ai-trends/share-cards";
import { getMetadata } from "@/lib/get-metadata";

import { RedirectToChart } from "./redirect-to-chart";

export const dynamicParams = false;

type SharePageProps = { params: Promise<{ chart: string }> };

export function generateStaticParams(): { chart: string }[] {
  return getShareSlugs().map((chart) => ({ chart }));
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { chart } = await params;
  const card = getShareCard(chart);
  if (!card) notFound();
  const metadata = getMetadata({
    title: card.title,
    description: card.description,
    pathname: getSharePath(card.slug),
    noIndex: true,
  });
  // Drop the default social image so the file-based opengraph/twitter images apply.
  const { images: _ogImages, ...openGraph } = metadata.openGraph ?? {};
  const { images: _twitterImages, ...twitter } = metadata.twitter ?? {};
  return { ...metadata, openGraph, twitter };
}

export default async function ShareChartPage({
  params,
}: SharePageProps): Promise<ReactNode> {
  const { chart } = await params;
  const card = getShareCard(chart);
  if (!card) notFound();
  const target = `/ai-index#${card.slug}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <h1 className="text-3xl font-normal">{card.title}</h1>
      <p className="max-w-xl text-white/60">{card.description}</p>
      <a href={target} className="text-orange underline">
        View on the Databricks AI Index
      </a>
      <RedirectToChart slug={card.slug} />
    </main>
  );
}
