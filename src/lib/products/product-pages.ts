import { agentBricksProduct } from "@/lib/products/agent-bricks";
import { databricksAppsProduct } from "@/lib/products/databricks-apps";
import { lakebaseProduct } from "@/lib/products/lakebase";
import type { ProductPageContent } from "@/lib/products/product-page";

const productPages = [
  { routeSlug: "agent-bricks", product: agentBricksProduct },
  { routeSlug: "lakebase", product: lakebaseProduct },
  { routeSlug: "databricks-apps", product: databricksAppsProduct },
] as const satisfies ReadonlyArray<{
  routeSlug: string;
  product: ProductPageContent;
}>;

export function getProductRouteSlugs(): string[] {
  return productPages.map((entry) => entry.routeSlug);
}

export function getProductPages(): ProductPageContent[] {
  return productPages.map((entry) => entry.product);
}

export function getProductPageByRouteSlug(
  slug: string,
): ProductPageContent | undefined {
  return productPages.find((entry) => entry.routeSlug === slug)?.product;
}
