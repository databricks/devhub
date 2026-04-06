import type { ReactNode } from "react";

type DocExampleProps = {
  name: string;
};

export function DocExample({ name }: DocExampleProps): ReactNode {
  return (
    <div className="my-4 rounded-lg border border-black/10 bg-black/3 p-4 text-sm text-black/60 dark:border-white/10 dark:bg-white/3 dark:text-white/60">
      <p className="m-0">
        Example placeholder for <code>{name}</code> — see the{" "}
        <a
          href="https://ui.shadcn.com/docs/components"
          target="_blank"
          rel="noopener noreferrer"
        >
          component docs
        </a>{" "}
        for live demos.
      </p>
    </div>
  );
}
