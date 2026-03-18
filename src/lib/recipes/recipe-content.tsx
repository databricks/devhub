import type { ComponentType } from "react";

export type RecipeContentComponent = ComponentType;

declare const require: {
  context: (
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
  ) => {
    keys: () => string[];
    (id: string): { default: RecipeContentComponent };
  };
};

const recipeContentContext = require.context(
  "@site/content/recipes",
  false,
  /\.md$/,
);

export const recipeContentById: Record<string, RecipeContentComponent> =
  Object.fromEntries(
    recipeContentContext.keys().map((modulePath) => {
      const slug = modulePath.replace("./", "").replace(/\.md$/, "");
      const component = recipeContentContext(modulePath).default;
      return [slug, component];
    }),
  );
