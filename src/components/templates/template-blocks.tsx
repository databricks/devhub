import CodeBlock from "@theme/CodeBlock";
import { evaluateSync } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import { type ComponentType, type ReactNode, useMemo } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import type { TemplateContentBlock } from "@/lib/template-content";

type TemplateRecipeComponentMap = Record<string, ComponentType>;

type TemplateBlockRendererProps = {
  blocks: TemplateContentBlock[];
  recipeComponents: TemplateRecipeComponentMap;
};

type MarkdownBlockProps = {
  content: string;
};

function TemplateMarkdownBlock({ content }: MarkdownBlockProps): ReactNode {
  const components = useMDXComponents();

  const Content = useMemo(() => {
    return evaluateSync(content, {
      ...jsxRuntime,
      useMDXComponents: () => components,
    }).default;
  }, [components, content]);

  return <Content />;
}

type CodeBlockProps = {
  language: string;
  content: string;
};

function TemplateCodeBlock({ language, content }: CodeBlockProps): ReactNode {
  return (
    <CodeBlock language={language} title={language || undefined}>
      {content.replace(/\n$/, "")}
    </CodeBlock>
  );
}

export function TemplateBlockRenderer({
  blocks,
  recipeComponents,
}: TemplateBlockRendererProps): ReactNode {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "markdown":
            return <TemplateMarkdownBlock key={key} content={block.content} />;
          case "code":
            return (
              <TemplateCodeBlock
                key={key}
                language={block.language}
                content={block.content}
              />
            );
          case "recipe": {
            const RecipeComponent = recipeComponents[block.recipeId];
            if (!RecipeComponent) {
              throw new Error(
                `Missing recipe component for template block: ${block.recipeId}`,
              );
            }
            return <RecipeComponent key={key} />;
          }
          default:
            return null;
        }
      })}
    </>
  );
}
