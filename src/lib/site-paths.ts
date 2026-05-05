export function toSiteRelativePath(path: string, baseUrl: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = baseUrl.replace(/\/$/, "");
  if (
    basePath !== "" &&
    (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))
  ) {
    const withoutBasePath = normalizedPath.slice(basePath.length);
    return withoutBasePath === "" ? "/" : withoutBasePath;
  }
  return normalizedPath;
}

export function withSiteBaseUrl(path: string, baseUrl: string): string {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path) || path.startsWith("//")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = baseUrl.replace(/\/$/, "");
  if (basePath === "") return normalizedPath;
  if (
    normalizedPath === basePath ||
    normalizedPath.startsWith(`${basePath}/`)
  ) {
    return normalizedPath;
  }
  return `${basePath}${normalizedPath}`;
}

export function routePathWithBaseUrl(
  baseUrl: string,
  routePath: string,
): string {
  return withSiteBaseUrl(routePath, baseUrl);
}
