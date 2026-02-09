"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

/* ===========================================
   DARK MODE TOGGLE
   Polished theme switcher with animated
   Sun/Moon icons. Uses next-themes under
   the hood and respects system preference.
   =========================================== */

export function DarkModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render placeholder until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-1 dark:bg-surface-2 border border-border"
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  function cycleTheme() {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-1 dark:bg-surface-2 border border-border hover:border-primary/30 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`Current theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      {/* Sun icon — visible in light mode */}
      <Sun
        className={`absolute w-5 h-5 transition-all duration-300 ${
          isDark
            ? "opacity-0 scale-50 rotate-90"
            : theme === "system"
              ? "opacity-0 scale-50 -rotate-90"
              : "opacity-100 scale-100 rotate-0"
        } text-warning`}
      />

      {/* Moon icon — visible in dark mode */}
      <Moon
        className={`absolute w-5 h-5 transition-all duration-300 ${
          !isDark
            ? "opacity-0 scale-50 rotate-90"
            : theme === "system"
              ? "opacity-0 scale-50 -rotate-90"
              : "opacity-100 scale-100 rotate-0"
        } text-primary`}
      />

      {/* Monitor icon — visible in system mode */}
      <Monitor
        className={`absolute w-5 h-5 transition-all duration-300 ${
          theme === "system"
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-90"
        } text-muted-foreground`}
      />
    </button>
  );
}
