import type { PublicPerson } from "./schema";

export function normalizeDirectorySearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim();
}

export function directoryPerson(person: PublicPerson) {
  const terms = new Map<string, number>();
  for (const [text, weight] of [
    [person.name, 8],
    [person.expertise.join(" "), 6],
    [person.headline, 4],
    [person.organization, 4],
    [person.country, 3],
    [person.city, 3],
    [person.bio, 1],
  ] satisfies [string, number][]) {
    for (const term of normalizeDirectorySearch(text)
      .split(" ")
      .filter(Boolean)) {
      terms.set(term, Math.max(terms.get(term) || 0, weight));
    }
  }
  return {
    id: person.id,
    slug: person.slug,
    kind: person.kind,
    name: person.name,
    headline: person.headline,
    organization: person.organization,
    country: person.country,
    city: person.city,
    photoUrl: person.photoUrl,
    links: person.links,
    additionalLinks: person.additionalLinks,
    searchName: normalizeDirectorySearch(person.name),
    searchTerms: [...terms],
  };
}

export type DirectoryPerson = ReturnType<typeof directoryPerson>;

function isSingleTypo(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return false;
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    if (left[i] === right[i]) continue;
    if (left.length > right.length) return left.slice(i + 1) === right.slice(i);
    if (left.length < right.length) return left.slice(i) === right.slice(i + 1);
    return (
      left.slice(i + 1) === right.slice(i + 1) ||
      (left[i] === right[i + 1] &&
        left[i + 1] === right[i] &&
        left.slice(i + 2) === right.slice(i + 2))
    );
  }
  return true;
}

function searchScore(person: DirectoryPerson, terms: string[], search: string) {
  let score = search && person.searchName === search ? 100 : 0;
  let typos = 0;
  for (const term of terms) {
    let best = 0;
    for (const [word, weight] of person.searchTerms) {
      const quality =
        word === term
          ? 3
          : word.startsWith(term)
            ? 2
            : term.length >= 5 && word.length >= 5 && isSingleTypo(term, word)
              ? 1
              : 0;
      if (quality) best = Math.max(best, quality * 10 + weight);
    }
    if (!best) return null;
    if (best < 20) typos++;
    score += best;
  }
  return { score, typos };
}

export function filterDirectory(
  people: DirectoryPerson[],
  query: {
    q?: string;
    country: string[];
    city: string[];
    university?: string[];
    page: number;
    pageSize: number;
  },
) {
  const search = normalizeDirectorySearch(query.q || "");
  const terms = [...new Set(search.split(" ").filter(Boolean))];
  const matches = people
    .filter(
      (person) =>
        (!query.country.length || query.country.includes(person.country)) &&
        (!query.city.length || query.city.includes(person.city)) &&
        (!query.university?.length ||
          query.university.includes(person.organization)),
    )
    .flatMap((person) => {
      const rank = searchScore(person, terms, search);
      return rank ? [{ person, ...rank }] : [];
    })
    .sort((a, b) => a.typos - b.typos || b.score - a.score)
    .map(({ person }) => person);
  const totalPages = Math.ceil(matches.length / query.pageSize);
  const page = Math.min(query.page, Math.max(1, totalPages));
  return {
    items: matches.slice((page - 1) * query.pageSize, page * query.pageSize),
    total: matches.length,
    totalPages,
    page,
  };
}
