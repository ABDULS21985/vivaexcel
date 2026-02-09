// =============================================================================
// Reduced Motion Hook
// =============================================================================
// Detects the `prefers-reduced-motion: reduce` media query for accessibility.
// SSR safe — defaults to false on the server and hydrates on the client.

"use client";

import { useState, useEffect, useRef } from "react";

/** Media query string for detecting reduced motion preference */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Detects whether the user has requested reduced motion via their OS settings.
 *
 * This hook listens to the `prefers-reduced-motion: reduce` media query and
 * updates reactively when the preference changes. It is SSR safe and defaults
 * to `false` on the server.
 *
 * @returns `true` if the user prefers reduced motion, `false` otherwise
 *
 * @example
 * ```tsx
 * function AnimatedCard({ children }: { children: React.ReactNode }) {
 *   const reducedMotion = useReducedMotion();
 *
 *   return (
 *     <div
 *       style={{
 *         transition: reducedMotion ? "none" : "transform 0.3s ease",
 *       }}
 *     >
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    mediaQueryRef.current = mql;

    // Set initial value on mount
    setPrefersReducedMotion(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
