"use client";

import { Award } from "lucide-react";
import { cn } from "@ktblog/ui/components";

interface SellerBadgeProps {
  level: number;
  title: string;
  compact?: boolean;
}

export function SellerBadge({
  level,
  title,
  compact = false,
}: SellerBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
      )}
    >
      <Award className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
      {compact ? `Lv${level}` : `${title} (Lv ${level})`}
    </div>
  );
}
