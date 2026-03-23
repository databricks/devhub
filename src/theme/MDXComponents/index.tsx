import MDXComponents from "@theme-original/MDXComponents";
import type { MDXComponentsObject } from "@theme/MDXComponents";
import CodeBlock from "@theme/CodeBlock";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

function H1({ className, ...props }: ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      className={cn(
        "mt-2 mb-4 scroll-m-24 text-3xl font-black tracking-tight text-db-navy md:text-4xl dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "mt-10 mb-3 scroll-m-24 border-b border-db-border pb-2.5 text-2xl font-bold tracking-tight text-db-navy first:mt-8 dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "mt-8 mb-2.5 scroll-m-24 text-xl font-semibold tracking-tight text-db-navy dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function H4({ className, ...props }: ComponentPropsWithoutRef<"h4">) {
  return (
    <h4
      className={cn(
        "mt-6 mb-2 scroll-m-24 text-lg font-semibold tracking-tight text-db-navy dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function H5({ className, ...props }: ComponentPropsWithoutRef<"h5">) {
  return (
    <h5
      className={cn(
        "mt-5 mb-1.5 scroll-m-24 text-base font-semibold tracking-tight text-db-navy dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function H6({ className, ...props }: ComponentPropsWithoutRef<"h6">) {
  return (
    <h6
      className={cn(
        "mt-4 mb-1.5 scroll-m-24 text-sm font-semibold tracking-tight text-db-navy/90 dark:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

function P({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn(
        "my-5 text-[1.04rem] leading-8 text-db-navy/85 dark:text-white/85",
        className,
      )}
      {...props}
    />
  );
}

function A({ className, ...props }: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className={cn(
        "font-medium text-db-lava underline decoration-db-lava/35 underline-offset-4 transition-colors hover:text-db-lava-dark dark:text-db-lava-light dark:hover:text-db-lava-lightest",
        className,
      )}
      {...props}
    />
  );
}

function Ul({ className, ...props }: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      className={cn(
        "my-5 ml-7 list-disc space-y-2.5 text-[1.02rem] text-db-navy/85 dark:text-white/85",
        className,
      )}
      {...props}
    />
  );
}

function Ol({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      className={cn(
        "my-5 ml-7 list-decimal space-y-2.5 text-[1.02rem] text-db-navy/85 dark:text-white/85",
        className,
      )}
      {...props}
    />
  );
}

function Li({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return (
    <li
      className={cn("pl-1 leading-8 marker:text-db-lava", className)}
      {...props}
    />
  );
}

function Blockquote({
  className,
  ...props
}: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "my-6 rounded-r-lg border-l-4 border-db-lava bg-db-bg px-4 py-3 italic text-db-navy/80 dark:bg-db-navy/30 dark:text-white/80",
        className,
      )}
      {...props}
    />
  );
}

function Hr({ className, ...props }: ComponentPropsWithoutRef<"hr">) {
  return <hr className={cn("my-8 border-db-border", className)} {...props} />;
}

function Img({ className, ...props }: ComponentPropsWithoutRef<"img">) {
  return (
    <img
      className={cn(
        "my-6 rounded-xl border border-db-border bg-db-card p-1 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function InlineCode({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const languageMatch = className?.match(/language-(\w+)/);

  if (languageMatch) {
    const code =
      typeof children === "string" ? children.replace(/\n$/, "") : children;
    return <CodeBlock language={languageMatch[1]}>{code}</CodeBlock>;
  }

  return (
    <code
      className={cn(
        "rounded-md border border-db-border bg-db-bg px-1.5 py-0.5 font-mono text-[0.88em] text-db-navy dark:bg-db-navy/35 dark:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <table
      className={cn(
        "my-6 w-full border-collapse overflow-hidden rounded-xl border border-db-border text-sm",
        className,
      )}
      {...props}
    />
  );
}

function Thead({ className, ...props }: ComponentPropsWithoutRef<"thead">) {
  return (
    <thead
      className={cn(
        "bg-db-bg text-sm font-semibold text-db-navy dark:bg-db-navy/35 dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function Tbody({ className, ...props }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody className={cn("bg-db-card", className)} {...props} />;
}

function Tr({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "border-t border-db-border even:bg-db-bg/35 dark:even:bg-db-navy/20",
        className,
      )}
      {...props}
    />
  );
}

function Th({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-left align-top text-xs uppercase tracking-wide text-db-navy/80 dark:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

function Td({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 align-top text-db-navy/85 dark:text-white/85",
        className,
      )}
      {...props}
    />
  );
}

function Details({ className, ...props }: ComponentPropsWithoutRef<"details">) {
  return (
    <details
      className={cn(
        "my-6 rounded-xl border border-db-border bg-db-card px-4 py-3 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function Summary({ className, ...props }: ComponentPropsWithoutRef<"summary">) {
  return (
    <summary
      className={cn(
        "cursor-pointer text-base font-semibold text-db-navy marker:text-db-lava dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function Kbd({ className, ...props }: ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "mx-0.5 inline-flex min-h-[1.5rem] items-center rounded-md border border-db-border bg-db-bg px-1.5 font-mono text-xs text-db-navy shadow-sm dark:bg-db-navy/35 dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function Mark({ className, ...props }: ComponentPropsWithoutRef<"mark">) {
  return (
    <mark
      className={cn(
        "rounded-sm bg-db-lava/20 px-1 text-db-navy dark:bg-db-lava/35 dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function Strong({ className, ...props }: ComponentPropsWithoutRef<"strong">) {
  return (
    <strong
      className={cn("font-extrabold text-db-navy dark:text-white", className)}
      {...props}
    />
  );
}

function Em({ className, ...props }: ComponentPropsWithoutRef<"em">) {
  return (
    <em
      className={cn(
        "font-medium text-db-navy/90 italic decoration-db-lava/45 dark:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

function Del({ className, ...props }: ComponentPropsWithoutRef<"del">) {
  return (
    <del
      className={cn(
        "text-db-navy/60 decoration-db-navy/50 dark:text-white/60 dark:decoration-white/50",
        className,
      )}
      {...props}
    />
  );
}

function Sup({ className, ...props }: ComponentPropsWithoutRef<"sup">) {
  return (
    <sup className={cn("align-super text-[0.7em]", className)} {...props} />
  );
}

function Sub({ className, ...props }: ComponentPropsWithoutRef<"sub">) {
  return <sub className={cn("align-sub text-[0.7em]", className)} {...props} />;
}

const components: MDXComponentsObject = {
  ...MDXComponents,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  blockquote: Blockquote,
  hr: Hr,
  img: Img,
  code: InlineCode,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  details: Details,
  summary: Summary,
  kbd: Kbd,
  mark: Mark,
  strong: Strong,
  em: Em,
  del: Del,
  sup: Sup,
  sub: Sub,
};

export default components;
