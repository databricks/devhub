"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";

import { copyChartImage } from "@/lib/ai-trends/share-image";

function XIcon(): ReactNode {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ChevronIcon(): ReactNode {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function LinkedInIcon(): ReactNode {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function CopyIcon(): ReactNode {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function ShareControl({
  chartIds,
  shareSlug,
  title,
}: {
  chartIds: string[];
  shareSlug: string;
  title: string;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const first =
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function handleMenuKeyDown(e: ReactKeyboardEvent) {
    if (!menuRef.current) return;
    const items = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  function getShareUrl(): string {
    return `${window.location.origin}/ai-index/share/${shareSlug}`;
  }

  function showFeedback(message: string) {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2000);
  }

  function shareOnX() {
    const text = `${title} — Databricks AI Index`;
    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, "_blank", "noopener");
  }

  function shareOnLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, "_blank", "noopener");
  }

  function handleCopyImage() {
    setOpen(false);
    copyChartImage(chartIds, title).then(
      () => showFeedback("Copied!"),
      () => showFeedback("Copy not supported"),
    );
  }

  function handleCopyLink() {
    setOpen(false);
    navigator.clipboard.writeText(getShareUrl()).then(
      () => showFeedback("Copied!"),
      () => showFeedback("Copy not supported"),
    );
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={shareOnX}
        aria-label="Share on X"
        className="flex items-center gap-1.5 rounded-l-full border border-black/10 bg-white px-2.5 py-1 text-xs text-black/60 transition-colors hover:border-black/20 hover:text-black"
      >
        <XIcon />
        <span>Share</span>
      </button>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More share options"
        className="flex items-center rounded-r-full border border-l-0 border-black/10 bg-white px-2 py-1.5 text-black/50 transition-colors hover:border-black/20 hover:text-black"
      >
        <ChevronIcon />
      </button>
      {feedback ? (
        <span
          role="status"
          className="absolute top-full right-0 z-50 mt-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs whitespace-nowrap text-black/70 shadow-md"
        >
          {feedback}
        </span>
      ) : null}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          onKeyDown={handleMenuKeyDown}
          className="absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-lg border border-black/10 bg-white py-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              shareOnLinkedIn();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black/70 transition-colors hover:bg-black/5"
          >
            <LinkedInIcon />
            LinkedIn
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyImage}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black/70 transition-colors hover:bg-black/5"
          >
            <CopyIcon />
            Copy image
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black/70 transition-colors hover:bg-black/5"
          >
            <CopyIcon />
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
