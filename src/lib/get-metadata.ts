import type { Metadata } from "next";

import { resolveSiteUrl } from "@/lib/site-url";

const DEFAULT_SOCIAL_IMAGE = "/img/databricks-social-card.jpg";
const SITE_NAME = "Databricks Developer";

export function getPageTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

type OpenGraphKind = "article" | "website";

type MetadataOptions = {
  description: string;
  imagePath?: string;
  markdownPath?: string;
  noIndex?: boolean;
  pathname: string;
  rssPath?: string;
  title: string;
  titleMode?: "absolute" | "template";
  type?: OpenGraphKind;
};

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const siteUrl = resolveSiteUrl();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl}${path === "/" ? "" : path}`;
}

export function getMetadata({
  description,
  imagePath = DEFAULT_SOCIAL_IMAGE,
  markdownPath,
  noIndex = false,
  pathname,
  rssPath,
  title,
  titleMode = "template",
  type = "website",
}: MetadataOptions): Metadata {
  const canonicalUrl = absoluteSiteUrl(pathname);
  const imageUrl = absoluteSiteUrl(imagePath);

  // Next's title `template` only applies to the document <title>, not to
  // openGraph/twitter titles. Mirror it here so social cards match the page
  // title (e.g. "Start here | Databricks Developer").
  const socialTitle = titleMode === "absolute" ? title : getPageTitle(title);
  const alternateTypes: NonNullable<Metadata["alternates"]>["types"] = {};

  if (markdownPath) {
    alternateTypes["text/markdown"] = markdownPath;
  }
  if (rssPath) {
    alternateTypes["application/rss+xml"] = rssPath;
  }

  const openGraph =
    type === "article"
      ? {
          title: socialTitle,
          description,
          siteName: SITE_NAME,
          type: "article" as const,
          url: canonicalUrl,
          images: [imageUrl],
        }
      : {
          title: socialTitle,
          description,
          siteName: SITE_NAME,
          type: "website" as const,
          url: canonicalUrl,
          images: [imageUrl],
        };

  return {
    title: titleMode === "absolute" ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
      types:
        Object.keys(alternateTypes).length > 0 ? alternateTypes : undefined,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          follow: false,
          index: false,
        }
      : undefined,
  };
}
