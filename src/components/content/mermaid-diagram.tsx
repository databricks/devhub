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
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          // Render labels as native SVG text, not HTML in <foreignObject>.
          // The site's prose CSS (line-height, paragraph margins, wrapping)
          // leaks into foreignObject labels and makes them overflow the box
          // Mermaid sized, so the browser clips the text. SVG text is sized by
          // its own glyph metrics and can't be clipped this way.
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
