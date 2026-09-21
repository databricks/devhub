import { DIRECTORY_PAGE_SIZE } from "@/lib/community/directory-query";
import { getMvpDirectory } from "@/lib/community/mvps";

export { default, generateMetadata } from "../../page";

export function generateStaticParams() {
  const pageCount = Math.ceil(getMvpDirectory().length / DIRECTORY_PAGE_SIZE);
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}
