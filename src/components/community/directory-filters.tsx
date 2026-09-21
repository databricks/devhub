"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";

import {
  directoryHref,
  readDirectoryQuery,
  type DirectorySearchParams,
} from "@/lib/community/directory-query";
import type { PersonKind } from "@/lib/community/schema";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DirectoryFilter } from "@/components/community/directory-filter";

export function DirectoryFilters({
  kind,
  params,
  facets,
  onChange,
}: {
  kind: PersonKind;
  params: DirectorySearchParams;
  facets: { cities: string[]; countries: string[]; universities: string[] };
  onChange: (params: DirectorySearchParams, replace?: boolean) => void;
}) {
  const query = readDirectoryQuery(params, kind);
  const search = query.q || "";
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      action={directoryHref(kind, {})}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        onChange(params);
      }}
      role="search"
      aria-label={kind === "student" ? "Find student fellows" : "Find MVPs"}
    >
      <fieldset className="min-w-0">
        <FieldGroup className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-x-7.5 lg:grid-cols-[auto_auto_minmax(0,1fr)]">
          <span className="text-base text-black md:col-span-2 lg:col-span-1">
            Filter by:
          </span>
          <div className="grid grid-cols-2 gap-2.5 sm:w-82.5">
            {(kind === "student"
              ? [
                  {
                    name: "country" as const,
                    label: "Country",
                    options: facets.countries,
                    value: query.country,
                  },
                  {
                    name: "university" as const,
                    label: "University",
                    options: facets.universities,
                    value: query.university,
                  },
                ]
              : [
                  {
                    name: "city" as const,
                    label: "City",
                    options: facets.cities,
                    value: query.city,
                  },
                  {
                    name: "country" as const,
                    label: "Country",
                    options: facets.countries,
                    value: query.country,
                  },
                ]
            ).map((filter) => (
              <Field key={filter.name} className="min-w-0">
                <FieldLabel
                  htmlFor={kind + "-" + filter.name}
                  className="sr-only"
                >
                  {filter.label}
                </FieldLabel>
                <DirectoryFilter
                  id={kind + "-" + filter.name}
                  name={filter.name}
                  label={filter.label}
                  options={filter.options}
                  values={filter.value}
                  onChange={(values) =>
                    onChange({ ...params, [filter.name]: values })
                  }
                />
              </Field>
            ))}
          </div>
          <Field className="min-w-0 lg:ml-auto lg:max-w-109.25">
            <FieldLabel htmlFor={kind + "-search"} className="sr-only">
              Search by name or expertise
            </FieldLabel>
            <InputGroup className="border-grey-80 bg-db-oat-medium has-[[data-slot=input-group-control]:focus-visible]:border-grey-60 h-11 rounded-none text-black shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:bg-black/4">
              <InputGroupInput
                ref={input}
                type="search"
                id={kind + "-search"}
                name="q"
                value={search}
                onChange={(event) =>
                  onChange({ ...params, q: event.target.value }, true)
                }
                maxLength={200}
                placeholder="Search by name or expertise"
                className="placeholder:text-grey-60 text-base tracking-tight text-black md:text-base dark:text-black [&::-webkit-search-cancel-button]:appearance-none"
              />
              <InputGroupAddon>
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  aria-label="Search and apply filters"
                  className="text-grey-70 hover:bg-transparent hover:text-black dark:hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
                >
                  <Search aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
              {search ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-sm"
                    aria-label="Clear search"
                    className="text-grey-80 hover:bg-transparent hover:text-black dark:hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
                    onClick={() => {
                      onChange({ ...params, q: "" });
                      input.current?.focus();
                    }}
                  >
                    <X aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          </Field>
        </FieldGroup>
      </fieldset>
    </form>
  );
}
