"use client";

import { useEffect, useId, useState } from "react";

import { CodeBlockControls } from "@/components/content/code-block-controls";

export function MermaidDiagram({ chart }: { chart: string }) {
  const generatedId = useId();
  const diagramId = `mermaid-${generatedId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setSvg(null);
    setFailed(false);

    void import("mermaid")
      .then(async ({ default: mermaid }) => {
        // Mermaid sizes each label box by measuring the text. If it measures
        // before the Inter web font has loaded, it uses a narrower fallback
        // font, sizes the box too small, and the browser clips the last
        // characters. Waiting for the page fonts guarantees the measuring
        // font matches the rendered font.
        if (typeof document !== "undefined" && document.fonts?.ready) {
          try {
            await document.fonts.ready;
          } catch {
            // Font loading is best-effort; render anyway.
          }
        }
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          htmlLabels: false,
          flowchart: { htmlLabels: false },
        });
        return mermaid.render(diagramId, chart);
      })
      .then((result) => {
        if (isCancelled) {
          return;
        }

        setSvg(result.svg);
      })
      .catch(() => {
        if (!isCancelled) {
          setFailed(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [chart, diagramId]);

  if (failed) {
    return (
      <div className="theme-code-block code-block language-mermaid">
        <div className="codeBlockContent">
          <pre>
            <code className="language-mermaid">{chart}</code>
          </pre>
          <CodeBlockControls text={chart} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-full overflow-x-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
      data-mermaid-diagram=""
    >
      {svg ? (
        <div className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="border-grey-20 h-24 w-full max-w-lg animate-pulse border bg-black/20" />
      )}
    </div>
  );
}
