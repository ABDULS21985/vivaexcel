"use client";

import { motion } from "framer-motion";
import { ShieldCheck, RotateCcw, Lock, Headphones } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface TrustBadgesProps {
  className?: string;
}

// =============================================================================
// Data
// =============================================================================

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Verified Reviews",
    description: "All reviews are from real customers",
  },
  {
    icon: RotateCcw,
    label: "Money-Back Guarantee",
    description: "30-day satisfaction guarantee",
  },
  {
    icon: Lock,
    label: "Secure Checkout",
    description: "SSL encrypted payment processing",
  },
  {
    icon: Headphones,
    label: "24/7 Support",
    description: "Always here to help you",
  },
] as const;

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function TrustBadges({ className = "" }: TrustBadgesProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
    >
      {TRUST_BADGES.map((badge) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={badge.label}
            variants={badgeVariants}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
              {badge.label}
            </h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-snug">
              {badge.description}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default TrustBadges;
