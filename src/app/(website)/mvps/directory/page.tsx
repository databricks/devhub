import { notFound } from "next/navigation";

import {
  directoryHref,
  directoryPageNumber,
  directoryTitle,
} from "@/lib/community/directory-query";
import { getMetadata } from "@/lib/get-metadata";
import { CommunityCTA } from "@/components/community/community-cta";
import { DirectoryHero } from "@/components/community/directory-hero";
import { PeopleDirectory } from "@/components/community/people-directory";
import { ProgramBackLink } from "@/components/community/program-back-link";
import Footer from "@/components/footer";

type PageProps = { params: Promise<{ page?: string }> };

export async function generateMetadata({ params }: PageProps) {
  const page = directoryPageNumber((await params).page);
  if (!page) notFound();
  return getMetadata({
    title: directoryTitle("mvp", page),
    description:
      "Meet experts who share knowledge, build community, and grow the Databricks ecosystem.",
    imagePath: "/img/community/mvp-og-image.jpg",
    pathname: directoryHref("mvp", {}, page),
  });
}

export default async function MVPDirectoryPage({ params }: PageProps) {
  const page = directoryPageNumber((await params).page);
  if (!page) notFound();
  return (
    <main className="bg-black text-white">
      <DirectoryHero kind="mvp" />
      <ProgramBackLink kind="mvp" />
      <div className="bg-db-paper text-black [color-scheme:light]">
        <PeopleDirectory kind="mvp" page={page} />
        <CommunityCTA variant="mvp" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
