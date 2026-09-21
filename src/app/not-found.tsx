import type { Metadata } from "next";

import { getDocsSearchItems } from "@/lib/docs-content";
import { Header } from "@/components/header/header";
import { NotFoundContent } from "@/components/not-found-content";

export const metadata: Metadata = { title: "Page Not Found" };

export default function WebsiteNotFound() {
  return (
    <>
      <Header searchItems={getDocsSearchItems()} />
      <NotFoundContent />
    </>
  );
}
