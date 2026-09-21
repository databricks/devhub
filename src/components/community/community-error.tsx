"use client";

import { Button } from "@/components/ui/button";

export function CommunityError({ reset }: { reset: () => void }) {
  return (
    <main className="bg-db-paper px-5 py-24 text-center text-black">
      <h1 className="text-2xl font-medium">
        The community directory is temporarily unavailable.
      </h1>
      <p className="mt-3 text-base">Please try again in a moment.</p>
      <Button
        variant="orange"
        size="xl"
        className="mt-6 font-mono uppercase"
        onClick={reset}
      >
        Try again
      </Button>
    </main>
  );
}
