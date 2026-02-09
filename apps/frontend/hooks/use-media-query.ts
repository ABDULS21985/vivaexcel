// =============================================================================
// Media Query Hook
// =============================================================================
// Generic hook for matching any CSS media query string.
// SSR safe — defaults to false on the server and hydrates on the client.

"use client";

import { useState, useEffect } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 *
 * This hook is SSR safe and defaults to `false` during server rendering.
 * On the client it initializes to the current match state and updates
 * reactively when the media query result changes (e.g., on window resize
 * or device orientation change).
 *
 * @param query - A valid CSS media query string (e.g., `"(min-width: 768px)"`)
 * @returns `true` if the media query matches, `false` otherwise
 *
 * @example
 * ```tsx
 * function ResponsiveLayout({ children }: { children: React.ReactNode }) {
 *   const isDesktop = useMediaQuery("(min-width: 1024px)");
 *   const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
 *   const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 *
 *   if (isDesktop) return <DesktopLayout>{children}</DesktopLayout>;
 *   if (isTablet) return <TabletLayout>{children}</TabletLayout>;
 *   return <MobileLayout>{children}</MobileLayout>;
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);

    // Set initial value on mount
    setMatches(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
