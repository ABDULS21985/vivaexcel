"use client";

import { motion } from "framer-motion";
import { Zap, Percent, Package, Crown } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface PromotionBadgeProps {
  type: "percentage" | "flash-sale" | "bundle" | "loyalty";
  value?: string | number;
  className?: string;
}

// =============================================================================
// Badge Configs
// =============================================================================

const badgeConfig = {
  percentage: {
    icon: Percent,
    bg: "bg-red-500",
    text: "text-white",
    shadow: "shadow-red-500/30",
    label: (value?: string | number) =>
      value ? `${value}% OFF` : "SALE",
  },
  "flash-sale": {
    icon: Zap,
    bg: "bg-gradient-to-r from-orange-500 to-amber-500",
    text: "text-white",
    shadow: "shadow-orange-500/30",
    label: () => "FLASH SALE",
  },
  bundle: {
    icon: Package,
    bg: "bg-purple-600",
    text: "text-white",
    shadow: "shadow-purple-600/30",
    label: (value?: string | number) =>
      value ? `SAVE ${value}%` : "BUNDLE DEAL",
  },
  loyalty: {
    icon: Crown,
    bg: "bg-gradient-to-r from-amber-500 to-yellow-500",
    text: "text-white",
    shadow: "shadow-amber-500/30",
    label: () => "MEMBER PRICE",
  },
};

// =============================================================================
// Component
// =============================================================================

export function PromotionBadge({
  type,
  value,
  className = "",
}: PromotionBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;
  const label = config.label(value);
  const isFlashSale = type === "flash-sale";

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      }}
      className={`absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg ${config.bg} ${config.text} ${config.shadow} ${className}`}
    >
      {isFlashSale ? (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-1"
        >
          <Icon className="h-3 w-3" />
          {label}
        </motion.span>
      ) : (
        <>
          <Icon className="h-3 w-3" />
          {label}
        </>
      )}
    </motion.span>
  );
}

export default PromotionBadge;
