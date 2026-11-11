import { Fragment, type ReactNode } from "react";

const INLINE_TOKEN = /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function RichText({ text }: { text: string }): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    const [, linkLabel, linkUrl, bold] = match;
    nodes.push(
      linkLabel && linkUrl ? (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-db-lava underline-offset-2 hover:underline"
        >
          {linkLabel}
        </a>
      ) : (
        <strong key={index} className="font-semibold">
          {bold}
        </strong>
      ),
    );
    cursor = index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <Fragment>{nodes}</Fragment>;
}
