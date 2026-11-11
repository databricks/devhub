import Image, { generateStaticParams } from "../opengraph-image";

// Next suffixes the opengraph-image URL with a route hash, so "Copy image"
// fetches the same card from this fixed path instead.
export const dynamic = "force-static";
export const dynamicParams = false;

// fallow-ignore-next-line unused-export
export { generateStaticParams };

export function GET(
  _request: Request,
  { params }: { params: Promise<{ chart: string }> },
): Promise<Response> {
  return Image({ params });
}
