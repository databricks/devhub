type MarkdownNode = {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
};

type SiteUrlOptions = {
  siteUrl: string;
};

function replaceSiteUrlPlaceholder(value: string, siteUrl: string): string {
  return value.replaceAll("__DEVHUB_SITE_URL__", siteUrl);
}

function visit(node: MarkdownNode, siteUrl: string): void {
  if (
    (node.type === "text" ||
      node.type === "inlineCode" ||
      node.type === "code") &&
    typeof node.value === "string"
  ) {
    node.value = replaceSiteUrlPlaceholder(node.value, siteUrl);
  }

  for (const child of node.children ?? []) {
    visit(child, siteUrl);
  }
}

export default function remarkSiteUrl(options: SiteUrlOptions) {
  return (tree: MarkdownNode) => {
    visit(tree, options.siteUrl);
  };
}
