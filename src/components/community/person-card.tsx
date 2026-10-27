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

export function PersonPhotoFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute size-0"
    >
      <defs>
        <filter
          id="community-portrait-crt-lines"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.025 0.8"
            numOctaves="2"
            seed="11"
            stitchTiles="stitch"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.65"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter
          id="community-portrait-crt-grain"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            seed="7"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="3" intercept="-1" />
            <feFuncG type="linear" slope="3" intercept="-1" />
            <feFuncB type="linear" slope="3" intercept="-1" />
          </feComponentTransfer>
          <feColorMatrix type="luminanceToAlpha" />
        </filter>
      </defs>
    </svg>
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
        "relative isolate aspect-square w-full overflow-hidden bg-black/5",
        className,
      )}
    >
      {person.photoUrl ? (
        <>
          <img
            src={person.photoUrl}
            alt={person.name}
            width={352}
            height={352}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black/5"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_1.4px,var(--grey-8)_1.65px,var(--black)_2.95px,transparent_3.4px)] mask-[radial-gradient(ellipse_80%_75%_at_50%_45%,black_55%,transparent_100%)] opacity-12 mix-blend-darken filter-[url(#community-portrait-crt-lines)] transition-opacity duration-300 group-hover:opacity-16 group-focus-visible:opacity-16"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-9 filter-[url(#community-portrait-crt-grain)]"
          />
          <span
            aria-hidden="true"
            className="via-db-paper/15 pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-transparent opacity-0 motion-safe:group-hover:animate-[portrait-crt-sweep_700ms_ease-out_both] motion-safe:group-focus-visible:animate-[portrait-crt-sweep_700ms_ease-out_both]"
          />
        </>
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
