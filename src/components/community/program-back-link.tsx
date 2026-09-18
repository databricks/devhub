import Image from "next/image";
import Link from "next/link";

import type { PersonKind } from "@/lib/community/schema";
import { Button } from "@/components/ui/button";

export function ProgramBackLink({ kind }: { kind: PersonKind }) {
  return (
    <Button
      asChild
      variant="orange"
      className="h-12 w-full gap-5 rounded-none font-mono text-lg font-medium tracking-tight text-white uppercase no-underline shadow-none hover:text-white hover:no-underline focus-visible:ring-white focus-visible:ring-offset-0 focus-visible:ring-inset md:h-14 md:gap-8 md:text-2xl xl:text-[2rem]"
    >
      <Link href={kind === "mvp" ? "/mvps" : "/student-fellows"}>
        <Image
          src="/img/community/arrow-right.svg"
          alt=""
          width={32}
          height={32}
          className="size-5 shrink-0 md:size-6 xl:size-8"
          aria-hidden="true"
          data-icon="inline-start"
        />
        Back to program
        <Image
          src="/img/community/arrow-right.svg"
          alt=""
          width={32}
          height={32}
          className="size-5 shrink-0 rotate-180 md:size-6 xl:size-8"
          aria-hidden="true"
          data-icon="inline-end"
        />
      </Link>
    </Button>
  );
}
