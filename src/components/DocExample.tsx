import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import { PortalContainerProvider } from "@databricks/appkit-ui/react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { docExamples, type DocExampleKey } from "./doc-examples/registry";

type DocExampleProps = {
  name: string;
};

// Components whose previews need more vertical space than the auto-sizing can
// infer (dialogs/popovers/menus that open _above_ their trigger, components
// that pin content to a viewport edge). Upstream uses the same technique.
const HEIGHT_OVERRIDES: Partial<Record<DocExampleKey, number>> = {
  dialog: 600,
  drawer: 700,
  "hover-card": 400,
  "navigation-menu": 600,
  menubar: 500,
  popover: 450,
  sheet: 700,
  "dropdown-menu": 500,
  select: 450,
  "alert-dialog": 500,
  "context-menu": 500,
  sidebar: 700,
};

// Which Docusaurus theme is active right now. The DocExample iframe needs this
// to mirror `.dark` on its own <html> so appkit-ui's dark-mode styles apply.
function isParentDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function isValidExampleName(name: string): name is DocExampleKey {
  return Object.prototype.hasOwnProperty.call(docExamples, name);
}

export function DocExample({ name }: DocExampleProps): ReactNode {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  if (!isValidExampleName(name)) {
    return (
      <div className="my-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Missing DocExample for <code>{name}</code>. Re-run{" "}
        <code>npm run sync:appkit-docs</code> to sync examples from the upstream
        appkit repo.
      </div>
    );
  }

  const entry = docExamples[name];

  return (
    <section
      data-doc-example={name}
      className="doc-example my-6 overflow-hidden rounded-xl border border-black/10 bg-background shadow-sm dark:border-white/10"
    >
      <header className="flex items-center justify-between border-b border-black/5 bg-muted/40 px-4 py-2 dark:border-white/5">
        <div
          role="tablist"
          aria-label={`${name} example views`}
          className="inline-flex items-center gap-1 rounded-md bg-background/60 p-0.5 ring-1 ring-black/5 dark:ring-white/10"
        >
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Preview
          </TabButton>
          <TabButton active={tab === "code"} onClick={() => setTab("code")}>
            Code
          </TabButton>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {name}
        </span>
      </header>

      {tab === "preview" ? (
        <BrowserOnly
          fallback={
            <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              Loading preview…
            </div>
          }
        >
          {() => (
            <IframePreview
              exampleKey={name}
              Component={entry.Component}
              customHeight={HEIGHT_OVERRIDES[name]}
            />
          )}
        </BrowserOnly>
      ) : (
        <div className="doc-example-source [&_.theme-code-block]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent">
          <CodeBlock language="tsx">{entry.source}</CodeBlock>
        </div>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded px-3 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// Iframe-based preview. AppKit-UI ships a Tailwind v4 stylesheet with its own
// `:root` tokens; mounting it alongside Docusaurus/Infima in the same document
// causes both sides to fight. An iframe is the only way to isolate cleanly.
const PREVIEW_MIN_HEIGHT = 220;
const PREVIEW_MAX_HEIGHT = 800;
const PREVIEW_DEFAULT_HEIGHT = 320;

type IframePreviewProps = {
  exampleKey: DocExampleKey;
  Component: React.ComponentType;
  customHeight?: number;
};

function IframePreview({
  exampleKey,
  Component,
  customHeight,
}: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const stylesHref = useBaseUrl("/appkit-preview/latest/styles.css");

  const height = useAutoHeight(iframeRef, customHeight);
  useDarkModeSync(iframeRef);
  useSonnerStyleSync(iframeRef, exampleKey);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(iframeHtml(stylesHref));
    doc.close();

    // Mirror the current Docusaurus theme immediately so we don't flash light-
    // mode tokens before useDarkModeSync runs.
    if (isParentDark()) {
      doc.documentElement.classList.add("dark");
    }

    const setFromRoot = () => {
      const root = doc.getElementById("preview-root");
      if (root) setMountNode(root);
    };

    const link = doc.querySelector('link[rel="stylesheet"]');
    if (link) {
      link.addEventListener("load", setFromRoot, { once: true });
      link.addEventListener("error", setFromRoot, { once: true });
    } else {
      setFromRoot();
    }
  }, [stylesHref]);

  return (
    <iframe
      ref={iframeRef}
      title={`${exampleKey} preview`}
      style={{
        width: "100%",
        height: `${height}px`,
        minHeight: `${PREVIEW_MIN_HEIGHT}px`,
        maxHeight: `${PREVIEW_MAX_HEIGHT}px`,
        border: "none",
        display: "block",
        backgroundColor: "transparent",
        transition: "height 0.2s ease",
      }}
    >
      {mountNode &&
        createPortal(
          <PortalContainerProvider
            container={iframeRef.current?.contentDocument?.body ?? null}
          >
            <Toaster />
            <Component />
          </PortalContainerProvider>,
          mountNode,
        )}
    </iframe>
  );
}

function iframeHtml(stylesHref: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="${stylesHref}" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: auto;
        overflow: visible;
        background: transparent;
      }
      body {
        padding: 1.25rem;
        color: var(--foreground, inherit);
      }
      #preview-root {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: ${PREVIEW_MIN_HEIGHT - 40}px;
      }
    </style>
  </head>
  <body>
    <div id="preview-root"></div>
  </body>
</html>`;
}

function useAutoHeight(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  customHeight: number | undefined,
) {
  const [height, setHeight] = useState<number>(
    customHeight ?? PREVIEW_DEFAULT_HEIGHT,
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;

    if (customHeight) {
      setHeight(customHeight);
      return;
    }

    const doc = iframe.contentDocument;
    const update = () => {
      const scroll = doc.body.scrollHeight;
      const next = Math.min(
        Math.max(scroll + 20, PREVIEW_MIN_HEIGHT),
        PREVIEW_MAX_HEIGHT,
      );
      setHeight(next);
    };

    const initial = setTimeout(update, 100);
    const observer = new ResizeObserver(update);
    observer.observe(doc.body);

    return () => {
      clearTimeout(initial);
      observer.disconnect();
    };
  }, [iframeRef, customHeight]);

  return height;
}

function useDarkModeSync(iframeRef: RefObject<HTMLIFrameElement | null>) {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sync = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.classList.toggle("dark", isParentDark());
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => observer.disconnect();
  }, [iframeRef]);
}

// Sonner injects its keyframe + toast styles into the *parent* document on
// first render. When the Toaster is portaled into an iframe, those styles
// never reach it. Clone them over for the sonner preview only.
function useSonnerStyleSync(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  exampleKey: DocExampleKey,
) {
  useEffect(() => {
    if (exampleKey !== "sonner") return;
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cloneStyles = () => {
      const sonnerStyles = Array.from(
        document.querySelectorAll("style"),
      ).filter(
        (el) =>
          el.textContent?.includes("[data-sonner-toaster]") ||
          el.textContent?.includes("[data-sonner-toast]"),
      );

      if (sonnerStyles.length > 0) {
        for (const style of sonnerStyles) {
          doc.head.appendChild(style.cloneNode(true));
        }
        return;
      }

      if (attempts < 10) {
        attempts += 1;
        timer = setTimeout(cloneStyles, 100);
      }
    };

    timer = setTimeout(cloneStyles, 100);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [iframeRef, exampleKey]);
}
