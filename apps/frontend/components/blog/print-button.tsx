"use client";

import { Printer } from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";

interface PrintButtonProps {
  className?: string;
  /** Optional variant: "icon" renders just the icon, "full" renders icon + label */
  variant?: "icon" | "full";
}

/**
 * Print button for blog articles.
 * Triggers the browser's native print dialog with `window.print()`.
 * Hidden in print media (via the global print stylesheet).
 */
export function PrintButton({ className, variant = "icon" }: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (variant === "full") {
    return (
      <button
        onClick={handlePrint}
        type="button"
        className={cn(
          "print-visible inline-flex items-center gap-2 px-4 py-2",
          "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",
          "border border-neutral-200 dark:border-neutral-700",
          "rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300",
          "transition-all duration-200",
          className
        )}
        title="Print this article"
        aria-label="Print this article"
      >
        <Printer className="h-4 w-4" />
        <span>Print</span>
      </button>
    );
  }

  return (
    <button
      onClick={handlePrint}
      type="button"
      className={cn(
        "print-visible w-10 h-10 rounded-xl flex items-center justify-center",
        "bg-neutral-100 border border-neutral-200",
        "text-neutral-600 hover:text-white",
        "hover:bg-[#1E4DB7] hover:border-[#1E4DB7]",
        "transition-all duration-300",
        className
      )}
      title="Print this article"
      aria-label="Print this article"
    >
      <Printer className="h-4 w-4" />
    </button>
  );
}
