import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  getAllDocPostSlugs,
  getDocPagination,
  getDocPostBySlug,
  getDocPostMetaBySlug,
} from "@/lib/docs-content";
import { getMetadata } from "@/lib/get-metadata";
import { AIExportMenu } from "@/components/ai-export-menu";
import { DocsAside } from "@/components/docs/docs-aside";
import { DocsFooter } from "@/components/docs/docs-footer";

type DocsPageParams = Promise<{ slug?: string[] }>;

export const dynamicParams = false;

export default async function DocsPage({
  params,
}: {
  params: DocsPageParams;
}): Promise<ReactNode> {
  const { slug } = await params;
  if (!slug?.length) {
    redirect("/docs/start-here");
  }

  const currentSlug = slug.join("/");
  const post = await getDocPostBySlug(currentSlug);
  if (!post) {
    notFound();
  }

  const currentPath = `/docs/${post.slug}`;
  const pagination = getDocPagination(post.slug);
  const toc = post.tableOfContents.map((item) => ({
    id: item.id,
    level: item.depth,
    value: item.value,
  }));

  return (
    <article className="grid grid-cols-1 gap-x-8 xl:grid-cols-[minmax(0,44rem)_12rem]">
      <div className="min-w-0 pt-8 md:pt-9">
        <p className="m-0 flex min-w-0 items-center truncate font-mono text-xs leading-none text-white uppercase">
          {post.sidebarLabel}
        </p>

        <div className="prose prose-docs relative mt-14 max-w-none">
          <div className="not-prose relative mb-5 md:absolute md:top-2 md:right-0 md:z-10">
            <AIExportMenu
              appearance="article"
              align="end"
              contentClassName="w-60 min-w-60"
              description={post.description}
              kind="doc"
              label="Copy as"
              permalink={currentPath}
              rawMarkdownUrl={`/raw-docs/${post.slug}.md`}
              title={post.title}
            />
          </div>
          {post.content}
        </div>

        <DocsFooter
          className="mt-16 md:mt-24"
          next={pagination.next}
          previous={pagination.previous}
        />
      </div>

      <DocsAside
        className="inset-x-0 bottom-0 -mx-1 hidden overflow-auto px-1 py-8 leading-none xl:flex"
        suggestEditsUrl={post.suggestEditsUrl}
        sticky
        toc={toc}
      />
    </article>
  );
}

export function generateStaticParams(): Array<{ slug: string[] }> {
  return getAllDocPostSlugs().map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: DocsPageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const currentSlug = slug?.join("/") ?? "start-here";
  const post = getDocPostMetaBySlug(currentSlug);
  if (!post) {
    return {};
  }

  return getMetadata({
    title: post.title,
    description: post.description,
    markdownPath: `/docs/${post.slug}.md`,
    pathname: `/docs/${post.slug}`,
    type: "article",
  });
}
