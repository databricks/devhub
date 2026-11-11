import { parseInlineLinks } from "@/lib/community/mvp-program";

export function InlineLinks({ text }: { text: string }) {
  return parseInlineLinks(text).map((part, index) =>
    part.kind === "link" ? (
      <a
        key={index}
        href={part.href}
        className="text-orange underline-offset-4 hover:underline"
      >
        {part.text}
      </a>
    ) : (
      part.text
    ),
  );
}
