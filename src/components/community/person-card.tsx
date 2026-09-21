import Link from "next/link";
import { Globe } from "lucide-react";

import type { DirectoryPerson } from "@/lib/community/directory";
import { personLinks } from "@/lib/community/person-links";
import type { PublicPerson } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import { MorePersonLinks } from "@/components/community/more-person-links";
import { Icons } from "@/components/icons";

function PersonLinks({
  person,
  className,
  compact = false,
}: {
  person: Pick<PublicPerson, "name" | "links" | "additionalLinks">;
  className?: string;
  compact?: boolean;
}) {
  const links = personLinks(person);
  const iconCount = links.filter((link) => link.kind !== "other").length;
  const visibleCount = compact
    ? Math.min(iconCount, links.length > 3 || links.length > iconCount ? 2 : 3)
    : iconCount;
  const compactCount = compact
    ? Math.min(iconCount, links.length > 2 || links.length > iconCount ? 1 : 2)
    : iconCount;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3",
        !compact && "flex-wrap",
        className,
      )}
    >
      {links.slice(0, visibleCount).map(({ kind, url, label }, index) => {
        const Icon =
          kind === "github"
            ? Icons.github
            : kind === "youtube"
              ? Icons.youtube
              : Globe;
        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${person.name} on ${kind === "website" ? "their website" : kind === "youtube" ? "YouTube" : label}`}
            className={cn(
              "hover:text-db-lava focus-visible:outline-db-lava inline-flex min-h-8 min-w-6 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
              index >= compactCount && "hidden xl:inline-flex",
            )}
          >
            {kind === "linkedin" ? (
              <span
                aria-hidden="true"
                className="size-5 bg-current mask-[url('/img/community/linkedin.svg')] mask-contain mask-center mask-no-repeat"
              />
            ) : kind === "x" ? (
              <span
                aria-hidden="true"
                className="size-5 bg-current mask-[url('/img/community/x.svg')] mask-contain mask-center mask-no-repeat"
              />
            ) : (
              <Icon className="size-5" aria-hidden="true" />
            )}
          </a>
        );
      })}
      {links.length > compactCount && (
        <MorePersonLinks
          name={person.name}
          links={links.slice(compactCount)}
          wideVisibleCount={visibleCount - compactCount}
        />
      )}
    </div>
  );
}

function PersonPhoto({
  person,
  className,
  eager = false,
}: {
  person: Pick<PublicPerson, "name" | "photoUrl">;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={cn(
        "aspect-square w-full overflow-hidden bg-black/5",
        className,
      )}
    >
      {person.photoUrl ? (
        <img
          src={person.photoUrl}
          alt={person.name}
          width={352}
          height={352}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover object-top grayscale"
        />
      ) : (
        <img
          src="/img/community/default-avatar.svg"
          alt=""
          width={256}
          height={255}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function PersonCard({ person }: { person: DirectoryPerson }) {
  const href =
    person.kind === "student"
      ? `/student-fellows/fellows/${person.slug}`
      : person.links.website ||
        person.links.linkedin ||
        person.links.github ||
        person.links.x ||
        person.additionalLinks[0]?.url;
  const external = person.kind === "mvp";
  const content = (
    <>
      <PersonPhoto person={person} />
      {href ? (
        <span className="bg-orange absolute top-0 right-0 grid size-11 place-items-center text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <img
            src="/img/templates/arrow-right-up.svg"
            width={24}
            height={24}
            alt=""
            className="size-6"
          />
        </span>
      ) : null}
      <h2 className="mt-3 text-xl/tight font-normal tracking-tight">
        {person.name}
      </h2>
      {person.organization || person.headline ? (
        <p
          className="mt-0.5 truncate text-base/5 tracking-tight text-black/50"
          title={person.organization || person.headline}
        >
          {person.organization || person.headline}
        </p>
      ) : null}
    </>
  );
  return (
    <article className="min-w-0">
      {href ? (
        <Link
          href={href}
          prefetch={false}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="group focus-visible:outline-db-lava relative block text-black no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/15 pt-3">
        {person.country ? (
          <p className="flex min-w-0 items-center gap-1.5 text-sm/none tracking-tight text-black/50 uppercase">
            <span className="bg-orange size-1.5 shrink-0" aria-hidden="true" />
            <span className="truncate" title={person.country}>
              [{person.country}]
            </span>
          </p>
        ) : (
          <span />
        )}
        <PersonLinks person={person} compact className="-my-1.5" />
      </div>
    </article>
  );
}
