"use client";

import { useState } from "react";

import { normalizeDirectorySearch } from "@/lib/community/directory";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DirectoryFilter({
  id,
  name,
  label,
  options,
  values,
  onChange,
}: {
  id: string;
  name: "city" | "country" | "university";
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const choices = [...new Set([...options, ...values])];
  const visible = choices.filter((option) =>
    normalizeDirectorySearch(option).includes(normalizeDirectorySearch(search)),
  );
  const placeholder =
    name === "country"
      ? "Search countries"
      : name === "university"
        ? "Search universities"
        : "Search cities";
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch("");
      }}
    >
      {values.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={label}
          disabled={choices.length === 0}
          className="bg-db-oat-medium hover:bg-db-oat-medium hover:border-grey-60 dark:bg-db-oat-medium dark:hover:bg-db-oat-medium text-grey-40 hover:text-grey-20 border-grey-80 dark:border-grey-80 data-[state=open]:border-grey-60 data-[state=open]:text-grey-20 h-11 w-full justify-start gap-1.5 rounded-none px-2 text-base font-normal shadow-none disabled:opacity-100 sm:px-3"
        >
          {label}
          {values.length > 0 && (
            <Badge
              className="bg-orange h-5 min-w-5 rounded-none border-0 px-1 text-sm font-normal text-white"
              aria-label={`${values.length} selected`}
            >
              {values.length}
            </Badge>
          )}
          <img
            src="/img/community/select-arrow.svg"
            alt=""
            width={9}
            height={8}
            className={cn("ml-auto h-2 w-2.25", !open && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={13}
        collisionPadding={16}
        aria-label={`${label} filter`}
        className="bg-db-oat-medium flex max-h-(--radix-popover-content-available-height) w-64 max-w-[calc(100vw-32px)] flex-col gap-0 rounded-none border-black/20 p-0 text-black shadow-none"
      >
        <Field className="p-3 pb-0.5">
          <FieldLabel htmlFor={`${id}-search`} className="sr-only">
            {placeholder}
          </FieldLabel>
          <InputGroup className="bg-db-paper dark:bg-db-paper border-grey-80 has-[[data-slot=input-group-control]:focus-visible]:border-grey-60 h-10 rounded-none shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-0">
            <InputGroupInput
              id={`${id}-search`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={placeholder}
              className="text-base tracking-tight placeholder:text-black/40 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-0 md:text-base"
            />
            <InputGroupAddon>
              <img
                src="/img/community/filter-search.svg"
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <FieldSet className="before:from-db-oat-medium before:to-db-oat-medium/0 after:from-db-oat-medium after:to-db-oat-medium/0 relative min-h-0 gap-0 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-5 before:bg-linear-to-b after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-3 after:bg-linear-to-t">
          <FieldLegend className="sr-only">{label}</FieldLegend>
          <FieldGroup className="max-h-57 min-h-0 scroll-pt-5 scroll-pb-3 [scrollbar-width:thin] [scrollbar-color:var(--color-grey-60)_transparent] gap-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-2.5">
            {visible.map((option) => (
              <Label
                key={option}
                htmlFor={`${id}-${option}`}
                className="min-h-10 w-full shrink-0 cursor-pointer gap-2.5 py-2 text-base leading-snug font-normal"
              >
                <Checkbox
                  id={`${id}-${option}`}
                  checked={values.includes(option)}
                  onCheckedChange={(checked) =>
                    onChange(
                      checked === true
                        ? [...values, option]
                        : values.filter((value) => value !== option),
                    )
                  }
                  indicatorIcon={
                    <img
                      src="/img/community/filter-check.svg"
                      alt=""
                      width={16}
                      height={15}
                      className="h-3.75 w-4"
                    />
                  }
                  className="data-[state=checked]:bg-orange data-[state=checked]:border-orange dark:data-[state=checked]:bg-orange size-5 rounded-none border-black/40 bg-transparent shadow-none dark:bg-transparent"
                />
                <span className="min-w-0 wrap-anywhere">{option}</span>
              </Label>
            ))}
            {!visible.length && (
              <p className="py-4 text-sm text-black/60" role="status">
                No matches found
              </p>
            )}
          </FieldGroup>
        </FieldSet>
        <Button
          type="button"
          variant="ghost"
          disabled={!values.length}
          onClick={() => onChange([])}
          className="h-9.75 shrink-0 justify-start rounded-none border-t border-black/20 px-4 text-base font-normal tracking-tight text-black/40 hover:bg-black/5 hover:text-black/60 disabled:opacity-100 dark:hover:bg-black/5"
        >
          Clear all
        </Button>
      </PopoverContent>
    </Popover>
  );
}
