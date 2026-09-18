import { describe, expect, it } from "vitest";

import {
  directoryPerson,
  filterDirectory,
} from "../src/lib/community/directory";
import {
  directoryHref,
  directoryPageNumber,
  readDirectoryQuery,
} from "../src/lib/community/directory-query";
import {
  directorySearchParams,
  publicPersonSchema,
} from "../src/lib/community/schema";

const profile = {
  id: "mvp-example",
  slug: "mvp-example",
  kind: "mvp",
  name: "Example MVP",
  headline: "",
  bio: "",
  country: "",
  city: "",
  organization: "",
  cohort: "",
  photoUrl: "",
  links: {},
  expertise: [],
  status: "published",
  featured: false,
};

describe("community public boundary", () => {
  it("round-trips multiselect URLs and normalizes invalid pagination", () => {
    const query = readDirectoryQuery(
      {
        country: [" France ,Japan,, ", "France"],
        city: ["Asao-ku, Kawasaki-shi", "Paris"],
        q: "A&B, C ",
        page: "-1",
      },
      "mvp",
    );
    expect(query).toMatchObject({
      country: ["France", "Japan"],
      city: ["Asao-ku, Kawasaki-shi", "Paris"],
      q: "A&B, C ",
      page: 1,
    });
    const href = directoryHref(
      "mvp",
      {
        country: query.country,
        city: query.city,
        q: query.q,
      },
      2,
    );
    const params = new URL(href, "https://example.com").searchParams;
    expect(href).toContain("country=France,Japan");
    expect(params.getAll("country")).toEqual(["France,Japan"]);
    expect(params.getAll("city")).toEqual(query.city);
    expect(params.get("q")).toBe("A&B, C ");
    expect(params.has("page")).toBe(false);
    expect(new URL(href, "https://example.com").pathname).toBe(
      "/mvps/directory/page/2",
    );
    expect(
      readDirectoryQuery({ country: params.get("country") || undefined }, "mvp")
        .country,
    ).toEqual(query.country);
    expect(
      readDirectoryQuery({ country: ["France", "Japan"] }, "mvp").country,
    ).toEqual(query.country);
    expect(
      directoryHref("mvp", { country: ["Belgium", "Brazil", "Canada"] }),
    ).toBe("/mvps/directory?country=Belgium,Brazil,Canada");
    expect(directoryHref("mvp", { country: ", ," })).toBe("/mvps/directory");
  });

  it("reads pagination from the path, keeps legacy URLs readable and rejects malformed page segments", () => {
    expect(
      readDirectoryQuery({ page: "3" }, "mvp", "/mvps/directory").page,
    ).toBe(3);
    expect(
      readDirectoryQuery(
        { page: "3", country: "Brazil" },
        "mvp",
        "/mvps/directory/page/2",
      ),
    ).toMatchObject({ page: 2, country: ["Brazil"] });
    expect(
      directoryHref(
        "mvp",
        { page: "3", q: "data", country: "Brazil,Canada" },
        2,
      ),
    ).toBe("/mvps/directory/page/2?q=data&country=Brazil,Canada");
    expect(directoryHref("mvp", { page: "3" })).toBe("/mvps/directory");
    expect(directoryPageNumber()).toBe(1);
    expect(directoryPageNumber("2")).toBe(2);
    for (const value of ["0", "-1", "01", "2.0", "2e1", "abc", "", "100001"]) {
      expect(directoryPageNumber(value), value).toBeNull();
    }
  });

  it("filters locally with OR within facets, AND across facets, and bounded pagination", () => {
    const members = [
      {
        name: "First",
        country: "France",
        city: "Paris",
        organization: "First University",
        bio: "Data engineer",
      },
      {
        name: "Second",
        country: "Japan",
        city: "Tokyo",
        organization: "Second University",
        expertise: ["Data"],
      },
      {
        name: "Third",
        country: "Germany",
        city: "Berlin",
        bio: "Data engineer",
      },
    ].map((fields, index) =>
      directoryPerson(
        publicPersonSchema.parse({ ...profile, ...fields, id: String(index) }),
      ),
    );
    const query = readDirectoryQuery(
      { country: ["France", "Japan"], q: " DATA " },
      "mvp",
    );
    expect(
      filterDirectory(members, query).items.map((person) => person.name),
    ).toEqual(["Second", "First"]);
    expect(
      filterDirectory(members, { ...query, city: ["Tokyo"] }).items.map(
        (person) => person.name,
      ),
    ).toEqual(["Second"]);
    expect(
      filterDirectory(members, { ...query, page: 999, pageSize: 1 }),
    ).toMatchObject({ page: 2, total: 2, totalPages: 2, items: [members[0]] });
    expect(
      filterDirectory(members, { ...query, q: "no matches" }),
    ).toMatchObject({ page: 1, total: 0, items: [] });
  });

  it("searches normalized words across fields, with AND semantics and literal technical terms", () => {
    const person = directoryPerson(
      publicPersonSchema.parse({
        ...profile,
        name: "José O’Connor",
        organization: "Data-Bricks University",
        country: "Brazil",
        city: "São Paulo",
        expertise: ["Apache Spark", "C++", "SQL"],
      }),
    );
    for (const q of [
      "j",
      "jo",
      "s",
      "sp",
      "j sp",
      "  JOSE   spark ",
      "spark oconnor",
      "brazil são",
      "sao paulo",
      "data bricks",
      "apa spar",
      "C++",
      "SQL",
    ]) {
      expect(
        filterDirectory([person], readDirectoryQuery({ q }, "mvp")).items,
        q,
      ).toEqual([person]);
    }
    for (const q of ["jose python", "C#", "ML", "QL", "park"]) {
      expect(
        filterDirectory([person], readDirectoryQuery({ q }, "mvp")).items,
        q,
      ).toEqual([]);
    }
  });

  it("tolerates one long-word typo, but not short-word errors or multiple edits", () => {
    const person = directoryPerson(
      publicPersonSchema.parse({
        ...profile,
        name: "Michael",
        expertise: ["SQL"],
      }),
    );
    for (const q of ["Micheal", "Michaal", "Michaell", "Mchael"]) {
      expect(
        filterDirectory([person], readDirectoryQuery({ q }, "mvp")).items,
        q,
      ).toEqual([person]);
    }
    for (const q of ["Michell", "Mikhaelx", "SGL"]) {
      expect(
        filterDirectory([person], readDirectoryQuery({ q }, "mvp")).items,
        q,
      ).toEqual([]);
    }
  });

  it("ranks exact names, fields, prefixes and typos without mutating the source order", () => {
    const members = [
      { name: "Micheal" },
      { name: "Biographer", bio: "Michael Michael Michael" },
      { name: "Michaelson" },
      { name: "Expert", expertise: ["Michael"] },
      { name: "Michael" },
      { name: "Michael Smith" },
    ].map((fields, index) =>
      directoryPerson(
        publicPersonSchema.parse({ ...profile, ...fields, id: String(index) }),
      ),
    );
    const query = readDirectoryQuery({ q: "Michael" }, "mvp");
    expect(
      filterDirectory(members, query).items.map(({ name }) => name),
    ).toEqual([
      "Michael",
      "Michael Smith",
      "Expert",
      "Biographer",
      "Michaelson",
      "Micheal",
    ]);
    expect(filterDirectory(members, { ...query, q: " " }).items).toEqual(
      members,
    );
    expect(members[0].name).toBe("Micheal");
  });

  it("removes private and undeclared fields from backend responses", () => {
    const parsed = publicPersonSchema.parse({
      ...profile,
      email: "private@example.com",
      userId: "account-id",
      internalNotes: "private",
    });
    expect(parsed).toEqual({ ...profile, highlights: [], additionalLinks: [] });
  });

  it("preserves named additional links without exposing undeclared fields", () => {
    const parsed = publicPersonSchema.parse({
      ...profile,
      additionalLinks: [
        {
          label: "YouTube",
          url: "https://www.youtube.com/@example",
          privateNote: "internal",
        },
      ],
    });
    expect(parsed.additionalLinks).toEqual([
      { label: "YouTube", url: "https://www.youtube.com/@example" },
    ]);
    for (const link of [
      { label: "", url: "https://example.com" },
      { label: "Example", url: "" },
      { label: "Example", url: "javascript:alert(1)" },
      { label: "Example", url: "https://user:secret@example.com" },
      { label: "Example", url: "http://example.com" },
    ]) {
      expect(
        publicPersonSchema.safeParse({ ...profile, additionalLinks: [link] })
          .success,
      ).toBe(false);
    }
  });

  it("rejects unpublished records and executable links", () => {
    expect(
      publicPersonSchema.safeParse({ ...profile, status: "draft" }).success,
    ).toBe(false);
    expect(
      publicPersonSchema.safeParse({
        ...profile,
        links: { website: "javascript:alert(1)" },
      }).success,
    ).toBe(false);
    expect(
      publicPersonSchema.safeParse({
        ...profile,
        photoUrl: "//untrusted.example/photo",
      }).success,
    ).toBe(false);
  });

  it("encodes filters as values and constrains pagination", () => {
    const query = directorySearchParams({
      kind: "mvp",
      q: "A&B",
      country: "United States",
    });
    expect(query.get("q")).toBe("A&B");
    expect(query.get("pageSize")).toBe("24");
    expect(query.has("B")).toBe(false);
    expect(() =>
      directorySearchParams({ kind: "mvp", pageSize: 10000 }),
    ).toThrow();
  });
});
