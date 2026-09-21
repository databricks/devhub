import { notFound } from "next/navigation";

import { DIRECTORY_PAGE_SIZE } from "@/lib/community/directory-query";
import { getMvpDirectory } from "@/lib/community/mvps";
import { getDirectory } from "@/lib/community/people.server";
import type { PersonKind } from "@/lib/community/schema";

import { DirectoryResults } from "./directory-results";

export async function PeopleDirectory({
  kind,
  page = 1,
}: {
  kind: PersonKind;
  page?: number;
}) {
  const members = kind === "mvp" ? getMvpDirectory() : await getDirectory(kind);
  if (page > Math.max(1, Math.ceil(members.length / DIRECTORY_PAGE_SIZE)))
    notFound();
  return <DirectoryResults kind={kind} members={members} initialPage={page} />;
}
