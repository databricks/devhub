import CodeBlock from "@theme/CodeBlock";
import { evaluateSync } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import * as jsxRuntime from "react/jsx-runtime";
import { type ComponentType, type ReactNode, useMemo } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import {
  buildTemplateRawMarkdown,
  parseTemplateMarkdown,
  type TemplateContentBlock,
} from "@/lib/template-markdown";
import {
  useAllRawRecipeMarkdown,
  useRawCookbookMarkdown,
} from "@/lib/use-raw-content-markdown";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import FoundationModelsApi from "@site/content/recipes/foundation-models-api.md";
import EmbeddingsGeneration from "@site/content/recipes/embeddings-generation.md";
import LakebasePgvector from "@site/content/recipes/lakebase-pgvector.md";
import AiChatModelServing from "@site/content/recipes/ai-chat-model-serving.md";
import LakebaseChatPersistence from "@site/content/recipes/lakebase-chat-persistence.md";
import RagChatIntegration from "@site/content/recipes/rag-chat-integration.md";

const template = templates.find((t) => t.id === "rag-chat-app-template");

const recipeComponents: Record<string, ComponentType> = {
  "databricks-local-bootstrap": DatabricksLocalBootstrap,
  "lakebase-data-persistence": LakebaseDataPersistence,
  "foundation-models-api": FoundationModelsApi,
  "embeddings-generation": EmbeddingsGeneration,
  "lakebase-pgvector": LakebasePgvector,
  "ai-chat-model-serving": AiChatModelServing,
  "lakebase-chat-persistence": LakebaseChatPersistence,
  "rag-chat-integration": RagChatIntegration,
};

function TemplateMarkdownBlock({ content }: { content: string }): ReactNode {
  const components = useMDXComponents();

  const Content = useMemo(() => {
    return evaluateSync(content, {
      ...jsxRuntime,
      useMDXComponents: () => components,
    }).default;
  }, [components, content]);

  return <Content />;
}

type TemplateRecipeComponentMap = Record<string, ComponentType>;

function TemplateBlockRenderer({
  blocks,
  recipeComponents: recipeComponentMap,
}: {
  blocks: TemplateContentBlock[];
  recipeComponents: TemplateRecipeComponentMap;
}): ReactNode {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "markdown":
            return <TemplateMarkdownBlock key={key} content={block.content} />;
          case "code":
            return (
              <CodeBlock
                key={key}
                language={block.language}
                title={block.language || undefined}
              >
                {block.content.replace(/\n$/, "")}
              </CodeBlock>
            );
          case "recipe": {
            const RecipeComponent = recipeComponentMap[block.recipeId];
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

export default function RagChatAppTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  const cookbookMarkdown = useRawCookbookMarkdown("rag-chat-app-template");
  const blocks = useMemo(
    () => (cookbookMarkdown ? parseTemplateMarkdown(cookbookMarkdown) : []),
    [cookbookMarkdown],
  );

  if (!template) {
    throw new Error("Template rag-chat-app-template not found");
  }
  const rawMarkdown = buildTemplateRawMarkdown(template, rawBySlug, blocks);
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <TemplateBlockRenderer
        blocks={blocks}
        recipeComponents={recipeComponents}
      />
    </TemplateDetail>
  );
}
