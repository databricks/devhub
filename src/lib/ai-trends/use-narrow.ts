import { useSyncExternalStore } from "react";

const NARROW_QUERY = "(max-width: 639px)";

/** True on phone-width screens, where charts switch to a compact layout. */
export function useIsNarrow(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(NARROW_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}
