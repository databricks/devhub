"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export function RedirectToChart({ slug }: { slug: string }): ReactNode {
  useEffect(() => {
    window.location.replace(`/ai-index#${slug}`);
  }, [slug]);

  return null;
}
