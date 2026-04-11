import CodeBlock from "@theme/CodeBlock";
import {
  type ReactElement,
  type ReactNode,
  isValidElement,
  Children,
} from "react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

type RecipePreProps = {
  children?: ReactNode;
};

export function RecipePre({ children }: RecipePreProps): ReactNode {
  const codeChild = Children.only(children);

  if (!isValidElement(codeChild)) {
    return <pre>{children}</pre>;
  }

  const el = codeChild as ReactElement<{
    className?: string;
    children?: ReactNode;
  }>;
  const className = el.props.className ?? "";
  const match = className.match(/language-(\w+)/);
  const language = match ? match[1] : undefined;
  const code = extractText(el.props.children).replace(/\n$/, "");

  return (
    <CodeBlock language={language} title={language || undefined}>
      {code}
    </CodeBlock>
  );
}

/** Bash snippet with the same theme CodeBlock + copy UX as MDX fenced blocks. */
export function RecipeCodeBlock({
  children,
  language = "bash",
}: {
  children: string;
  language?: string;
}): ReactNode {
  return (
    <div className="recipe-content-card min-w-0">
      <CodeBlock language={language}>{children}</CodeBlock>
    </div>
  );
}
