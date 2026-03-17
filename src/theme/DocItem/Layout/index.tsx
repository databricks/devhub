import { useRef } from "react";
import clsx from "clsx";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { useWindowSize } from "@docusaurus/theme-common";
import ContentVisibility from "@theme/ContentVisibility";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import DocItemContent from "@theme/DocItem/Content";
import DocItemFooter from "@theme/DocItem/Footer";
import type { Props } from "@theme/DocItem/Layout";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";
import type { ReactNode } from "react";
import { AIExportMenu } from "@/components/ai-export-menu";

type DocToc = {
  hidden: boolean;
  mobile: ReactNode;
  desktop: ReactNode;
};

function useDocToc(): DocToc {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents ?? false;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : null;
  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : null;

  return { hidden, mobile, desktop };
}

export default function DocItemLayout({ children }: Props): ReactNode {
  const docToc = useDocToc();
  const { metadata } = useDoc();
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="row db-docs-layout">
      <div
        className={clsx("col db-docs-content-col", !docToc.hidden && "col--9")}
      >
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />

        <div className="db-docs-content-container">
          <article className="db-docs-article">
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docToc.mobile}

            <div className="mt-3 flex justify-end mb-3">
              <AIExportMenu
                contentRef={contentRef}
                title={metadata.title ?? ""}
                description={metadata.description ?? ""}
                permalink={metadata.permalink ?? ""}
              />
            </div>

            <div ref={contentRef}>
              <DocItemContent>{children}</DocItemContent>
            </div>
            <DocItemFooter />
          </article>
          <div className="db-docs-paginator">
            <DocItemPaginator />
          </div>
        </div>
      </div>

      {docToc.desktop && (
        <div className="col col--3 db-docs-toc-col">{docToc.desktop}</div>
      )}
    </div>
  );
}
