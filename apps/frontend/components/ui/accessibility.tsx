"use client";

import { useCallback, useRef, useEffect, useState } from "react";

// =============================================================================
// SrOnly — Screen-reader-only text component
// =============================================================================

export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="sr-only"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// useAnnouncer — ARIA live region announcements
// =============================================================================

/**
 * Creates an ARIA live region and provides an `announce` function.
 * Messages are announced to screen readers via an aria-live="polite" region.
 */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((text: string) => {
    // Clear previous message first so screen reader re-announces
    setMessage("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMessage(text);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const AnnouncerRegion = useCallback(
    () => (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {message}
      </div>
    ),
    [message],
  );

  return { announce, AnnouncerRegion };
}
