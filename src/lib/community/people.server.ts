import "server-only";

import { cache } from "react";
import { z } from "zod";

import { directoryPerson } from "./directory";
import {
  directorySearchParams,
  peoplePageSchema,
  type DirectoryQuery,
  type PeoplePage,
  type PersonKind,
  type PublicPerson,
} from "./schema";

export class CommunityApiError extends Error {
  constructor() {
    super(
      "The community directory is temporarily unavailable. Please try again.",
    );
    this.name = "CommunityApiError";
  }
}

function backendOrigin(): string {
  const configured = process.env.DEVHUB_BACKEND_URL?.trim();
  const value =
    configured ||
    (process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:3001"
      : undefined);
  if (!value) throw new CommunityApiError();
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new CommunityApiError();
  }
  return url.origin;
}

async function request(path: string, revalidate = 0): Promise<Response> {
  try {
    return await fetch(new URL(path, backendOrigin()), {
      headers: { Accept: "application/json" },
      ...(revalidate
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new CommunityApiError();
  }
}

async function parseResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!response.ok) throw new CommunityApiError();
  try {
    return schema.parse(await response.json());
  } catch {
    throw new CommunityApiError();
  }
}

function resolvePhoto(person: PublicPerson): PublicPerson {
  return {
    ...person,
    photoUrl: person.photoUrl
      ? new URL(person.photoUrl, backendOrigin()).href
      : "",
  };
}

export async function getPeople(
  query: DirectoryQuery,
  revalidate = 0,
): Promise<PeoplePage> {
  const response = await request(
    `/api/v1/people?${directorySearchParams(query)}`,
    revalidate,
  );
  const page = await parseResponse(response, peoplePageSchema);
  return { ...page, items: page.items.map(resolvePhoto) };
}

export const getDirectory = cache(async (kind: PersonKind) => {
  const first = await getPeople({ kind, page: 1, pageSize: 100 }, 3600);
  // Bound the browser payload; larger directories need server-side search.
  if (first.page !== 1 || first.total > 5000 || first.totalPages > 50)
    throw new CommunityApiError();
  const people = [...first.items];
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await getPeople({ kind, page, pageSize: 100 }, 3600);
    if (
      next.total !== first.total ||
      next.page !== page ||
      next.totalPages !== first.totalPages
    )
      throw new CommunityApiError();
    people.push(...next.items);
  }
  if (
    people.length !== first.total ||
    new Set(people.map((person) => person.id)).size !== first.total ||
    people.some((person) => person.kind !== kind)
  )
    throw new CommunityApiError();
  return people.map(directoryPerson);
});
