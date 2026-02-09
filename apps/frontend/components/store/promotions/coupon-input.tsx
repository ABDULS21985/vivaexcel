"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface CouponApplyResult {
  valid: boolean;
  discount: number;
  reason?: string;
}

interface CouponInputProps {
  onApply: (code: string) => Promise<CouponApplyResult>;
  onRemove: () => void;
  appliedCoupon?: AppliedCoupon;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
};

const slideInVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// Helpers
// =============================================================================

function formatDiscount(discount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(discount);
}

// =============================================================================
// Component
// =============================================================================

export function CouponInput({
  onApply,
  onRemove,
  appliedCoupon,
  className = "",
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);

  const handleApply = useCallback(async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setIsLoading(true);
    setError(null);
    setShowSuccess(false);

    try {
      const result = await onApply(trimmedCode);

      if (result.valid) {
        setShowSuccess(true);
        setCode("");
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setError(result.reason || "Invalid coupon code");
        setTriggerShake(true);
        setTimeout(() => setTriggerShake(false), 600);
      }
    } catch {
      setError("Failed to validate coupon. Please try again.");
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  }, [code, onApply]);

  const handleRemove = useCallback(() => {
    setCode("");
    setError(null);
    setShowSuccess(false);
    onRemove();
  }, [onRemove]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApply();
      }
    },
    [handleApply],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCode(e.target.value.toUpperCase());
      if (error) setError(null);
    },
    [error],
  );

  // Applied coupon display
  if (appliedCoupon) {
    return (
      <div className={className}>
        <AnimatePresence>
          <motion.div
            variants={slideInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-xl"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                  {appliedCoupon.code}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  -{formatDiscount(appliedCoupon.discount)} discount applied
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={handleRemove}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Input form
  return (
    <div className={className}>
      <motion.div
        animate={triggerShake ? "shake" : undefined}
        variants={shakeVariants}
      >
        <div
          className={`flex items-center gap-2 p-1.5 rounded-xl border transition-colors duration-200 ${
            error
              ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10"
              : showSuccess
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 pl-2">
            <Tag className="h-4 w-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            <input
              type="text"
              value={code}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter coupon code"
              disabled={isLoading}
              className="flex-1 text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 bg-transparent outline-none uppercase tracking-wide disabled:opacity-50"
              aria-label="Coupon code"
            />
          </div>
          <motion.button
            type="button"
            onClick={handleApply}
            disabled={isLoading || !code.trim()}
            whileHover={{ scale: isLoading || !code.trim() ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || !code.trim() ? 1 : 0.98 }}
            className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 mt-2 px-1"
          >
            <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-600 dark:text-red-400">
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CouponInput;
