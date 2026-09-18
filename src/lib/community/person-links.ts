import type { PublicPerson } from "./schema";

export function personLinks(
  person: Pick<PublicPerson, "links" | "additionalLinks">,
) {
  const primary = [
    ["linkedin", "LinkedIn"],
    ["github", "GitHub"],
    ["x", "X"],
    ["website", "Website"],
  ] as const;
  const links = [
    ...primary.flatMap(([kind, label]) => {
      const url = person.links[kind];
      return url ? [{ kind, label, url }] : [];
    }),
    ...person.additionalLinks.map((link) => {
      const host = new URL(link.url).hostname;
      return {
        ...link,
        kind:
          host === "youtu.be" ||
          host === "youtube.com" ||
          host.endsWith(".youtube.com")
            ? ("youtube" as const)
            : ("other" as const),
      };
    }),
  ];
  const order = ["linkedin", "github", "youtube", "x", "website", "other"];
  return links
    .filter(
      (link, index) =>
        links.findIndex((item) => item.url === link.url) === index,
    )
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}
