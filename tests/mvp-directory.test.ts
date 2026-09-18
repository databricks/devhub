import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getMvpDirectory,
  MVP_DIRECTORY_SOURCE,
  MVP_DIRECTORY_VERIFIED_AT,
} from "../src/lib/community/mvps";

describe("static MVP directory", () => {
  it("contains the official roster and spreadsheet additions in source order", () => {
    const people = getMvpDirectory();

    expect(MVP_DIRECTORY_SOURCE).toBe(
      "https://www.databricks.com/discover/mvps",
    );
    expect(MVP_DIRECTORY_VERIFIED_AT).toBe("2026-09-16");
    expect(people).toHaveLength(109);
    expect(people.at(0)?.name).toBe("Aarni Sillanpää");
    expect(people.at(-1)?.name).toBe("Zoë van Noppen");
    expect(new Set(people.map(({ id }) => id)).size).toBe(people.length);
    expect(new Set(people.map(({ slug }) => slug)).size).toBe(people.length);
    expect(new Set(people.map(({ name }) => name)).size).toBe(people.length);
  });

  it("includes the user-approved spreadsheet additions and title correction", () => {
    const people = getMvpDirectory();
    const names = people.map(({ name }) => name);

    expect(names).toContain("Abishek Subramanian");
    expect(names).toContain("Szymon Dybczak");
    expect(
      people.find(({ name }) => name === "Dr. Alan L. Dennis")?.headline,
    ).toBe("VP AI and Data Platform Innovation - Alliances");
  });

  it("keeps local public images and profile destinations independent of the backend", () => {
    const people = getMvpDirectory();

    expect(
      people.filter(({ photoUrl }) => !photoUrl).map(({ name }) => name),
    ).toEqual([]);

    for (const person of people) {
      if (person.photoUrl) {
        expect(person.photoUrl).toMatch(
          /^\/img\/community\/mvps\/mvp-[a-z0-9-]+\.jpg$/,
        );
        expect(
          existsSync(
            resolve(process.cwd(), "public", person.photoUrl.slice(1)),
          ),
          person.name,
        ).toBe(true);
      }
      for (const url of [
        ...Object.values(person.links),
        ...person.additionalLinks.map(({ url }) => url),
      ].filter(Boolean)) {
        expect(url, person.name).toMatch(/^https:\/\//);
      }
    }
  });
});
