import { useState, type ReactNode } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CodeBlock from "@theme/CodeBlock";
import { cn } from "@/lib/utils";
import { docExamples, type DocExampleKey } from "./doc-examples/registry";

type DocExampleProps = {
  name: string;
};

const PREVIEW_MIN_HEIGHTS: Partial<Record<DocExampleKey, string>> = {
  calendar: "min-h-[380px]",
  "input-otp": "min-h-[120px]",
  pagination: "min-h-[80px]",
  sidebar: "h-[500px] min-h-[500px] max-h-[500px]",
  resizable: "min-h-[240px]",
  carousel: "min-h-[260px]",
  table: "min-h-[320px]",
  menubar: "min-h-[80px]",
  "navigation-menu": "min-h-[80px]",
};

const OVERFLOW_HIDDEN_KEYS = new Set<DocExampleKey>([
  "sidebar",
  "resizable",
  "drawer",
  "sheet",
]);

// Components that need flush (no padding) preview layout to fill the preview.
const FULL_BLEED_PREVIEW = new Set<DocExampleKey>(["sidebar"]);

function isValidExampleName(name: string): name is DocExampleKey {
  return Object.prototype.hasOwnProperty.call(docExamples, name);
}

export function DocExample({ name }: DocExampleProps): ReactNode {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  if (!isValidExampleName(name)) {
    return (
      <div className="my-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Missing DocExample for <code>{name}</code>. Add an entry to{" "}
        <code>src/components/doc-examples/registry.ts</code>.
      </div>
    );
  }

  const entry = docExamples[name];
  const minHeight = PREVIEW_MIN_HEIGHTS[name] ?? "min-h-[220px]";
  const overflow = OVERFLOW_HIDDEN_KEYS.has(name)
    ? "overflow-hidden"
    : "overflow-visible";
  const padding = FULL_BLEED_PREVIEW.has(name) ? "p-0" : "p-6 sm:p-10";
  const ExampleComponent = entry.Component;

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
        <div
          className={cn(
            "doc-example-preview relative flex items-center justify-center bg-gradient-to-b from-background to-muted/30",
            padding,
            minHeight,
            overflow,
          )}
          style={{
            // Creates a containing block so components that use `position: fixed`
            // (Sidebar, Sheet, Drawer, Dialog overlays) are scoped to the preview.
            transform: "translateZ(0)",
            contain: "layout paint",
          }}
        >
          <BrowserOnly
            fallback={
              <div className="text-sm text-muted-foreground">
                Loading preview…
              </div>
            }
          >
            {() => <ExampleComponent />}
          </BrowserOnly>
        </div>
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
