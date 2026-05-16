import type { ReactNode } from "react";

type Block =
  | { kind: "h1" | "h2" | "h3"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "p"; text: string };

function isListLine(line: string): "ul" | "ol" | null {
  if (/^\s*[*\-]\s+/.test(line)) return "ul";
  if (/^\s*\d+\.\s+/.test(line)) return "ol";
  return null;
}

function stripListMarker(line: string): string {
  return line.replace(/^\s*(?:[*\-]|\d+\.)\s+/, "");
}

/**
 * Parse the limited subset of markdown used in perspectives answers:
 * paragraphs, headings (#/##/###), and unordered/ordered lists. The full
 * Docusaurus MDX pipeline is overkill for this single page and pulls in heavy
 * loader plumbing for content not authored as MDX.
 */
function parseBlocks(source: string): Block[] {
  const cleaned = source.replace(/\r\n/g, "\n").trim();
  if (cleaned === "") return [];

  const rawBlocks = cleaned.split(/\n{2,}/);
  const blocks: Block[] = [];

  for (const raw of rawBlocks) {
    const trimmed = raw.trim();
    if (trimmed === "") continue;

    if (trimmed.startsWith("### ")) {
      blocks.push({ kind: "h3", text: trimmed.slice(4).trim() });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ kind: "h2", text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({ kind: "h1", text: trimmed.slice(2).trim() });
      continue;
    }

    const lines = trimmed.split("\n");
    const firstListKind = isListLine(lines[0]);
    if (firstListKind && lines.every((line) => isListLine(line))) {
      blocks.push({
        kind: firstListKind,
        items: lines.map(stripListMarker),
      });
      continue;
    }

    blocks.push({ kind: "p", text: lines.join(" ") });
  }

  return blocks;
}

/**
 * Render bold/italic/code inline tokens. Anything else is passed through as
 * plain text. Matches `**bold**`, `*italic*`, and `` `code` `` non-greedily.
 */
function renderInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      tokens.push(
        <code
          key={key++}
          className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.92em] dark:bg-white/10"
        >
          {match[1]}
        </code>,
      );
    } else if (match[2] !== undefined) {
      tokens.push(
        <strong
          key={key++}
          className="font-semibold text-db-navy dark:text-white"
        >
          {match[2]}
        </strong>,
      );
    } else if (match[3] !== undefined) {
      tokens.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export function MarkdownBody({ source }: { source: string }): ReactNode {
  const blocks = parseBlocks(source);

  return (
    <div className="space-y-5 text-base leading-7 text-db-navy/85 dark:text-white/80">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "h1":
            return (
              <h2
                key={index}
                className="mt-10 mb-2 text-2xl font-medium tracking-tight text-db-navy first:mt-0 dark:text-white"
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h2":
            return (
              <h3
                key={index}
                className="mt-8 mb-2 text-lg font-medium tracking-tight text-db-navy dark:text-white"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "h3":
            return (
              <h4
                key={index}
                className="mt-6 mb-2 text-base font-semibold tracking-tight text-db-navy dark:text-white"
              >
                {renderInline(block.text)}
              </h4>
            );
          case "ul":
            return (
              <ul key={index} className="list-disc space-y-1.5 pl-6">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index} className="list-decimal space-y-1.5 pl-6">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "p":
          default:
            return <p key={index}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}
