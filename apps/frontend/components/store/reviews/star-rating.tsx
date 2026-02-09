"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const SIZE_MAP = {
  sm: { star: "h-4 w-4", text: "text-sm", gap: "gap-0.5" },
  md: { star: "h-5 w-5", text: "text-base", gap: "gap-1" },
  lg: { star: "h-7 w-7", text: "text-lg", gap: "gap-1.5" },
} as const;

// CSS keyframes for sparkle particles injected once
const SPARKLE_KEYFRAMES_ID = "star-rating-sparkle-keyframes";

function ensureSparkleKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPARKLE_KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = SPARKLE_KEYFRAMES_ID;
  style.textContent = `
    @keyframes star-sparkle-burst {
      0% {
        opacity: 1;
        transform: translate(var(--sparkle-x, 0), var(--sparkle-y, 0)) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(calc(var(--sparkle-x, 0) * 3), calc(var(--sparkle-y, 0) * 3)) scale(0);
      }
    }
    .star-sparkle-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #fbbf24;
      pointer-events: none;
      animation: star-sparkle-burst 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

// =============================================================================
// Sparkle Emitter
// =============================================================================

function emitSparkles(container: HTMLElement) {
  ensureSparkleKeyframes();
  const count = 4 + Math.floor(Math.random() * 3); // 4-6 particles
  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 8 + Math.random() * 6;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    const dot = document.createElement("span");
    dot.className = "star-sparkle-particle";
    dot.style.left = `${centerX - 2}px`;
    dot.style.top = `${centerY - 2}px`;
    dot.style.setProperty("--sparkle-x", `${dx}px`);
    dot.style.setProperty("--sparkle-y", `${dy}px`);
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 550);
  }
}

// =============================================================================
// Component
// =============================================================================

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  showValue = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const groupRef = useRef<HTMLDivElement>(null);
  const isInteractive = !readOnly && !!onChange;
  const displayValue = hoverValue ?? value;
  const sizeConfig = SIZE_MAP[size];

  // Reset selected star animation after it plays
  useEffect(() => {
    if (selectedStar !== null) {
      const timer = setTimeout(() => setSelectedStar(null), 350);
      return () => clearTimeout(timer);
    }
  }, [selectedStar]);

  const handleMouseEnter = useCallback(
    (star: number) => {
      if (isInteractive) setHoverValue(star);
    },
    [isInteractive],
  );

  const handleMouseLeave = useCallback(() => {
    if (isInteractive) setHoverValue(null);
  }, [isInteractive]);

  const handleClick = useCallback(
    (star: number, buttonEl: HTMLButtonElement | null) => {
      if (isInteractive && onChange) {
        onChange(star);
        setSelectedStar(star);
        if (buttonEl) emitSparkles(buttonEl);
      }
    },
    [isInteractive, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isInteractive || !onChange) return;
      let newValue = value;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        newValue = Math.min(5, value + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        newValue = Math.max(1, value - 1);
      }
      if (newValue !== value) {
        onChange(newValue);
        setSelectedStar(newValue);
        const ref = starRefs.current[newValue - 1];
        if (ref) {
          ref.focus();
          emitSparkles(ref);
        }
      }
    },
    [isInteractive, onChange, value],
  );

  // -------------------------------------------------------------------------
  // Read-only star with half-star precision via clip-path
  // -------------------------------------------------------------------------
  const renderReadOnlyStar = (index: number) => {
    const fillFraction = Math.min(1, Math.max(0, value - index));

    return (
      <span key={index} className="relative inline-block">
        {/* Empty star background */}
        <Star
          className={`${sizeConfig.star} text-zinc-300 dark:text-zinc-600`}
          fill="currentColor"
          strokeWidth={0}
        />
        {/* Filled overlay with clip-path for partial fill */}
        {fillFraction > 0 && (
          <span
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 ${((1 - fillFraction) * 100).toFixed(1)}% 0 0)`,
            }}
          >
            <Star
              className={`${sizeConfig.star} text-amber-400 fill-amber-400`}
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        )}
      </span>
    );
  };

  // -------------------------------------------------------------------------
  // Interactive star with hover + click + sparkles
  // -------------------------------------------------------------------------
  const renderInteractiveStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= displayValue;
    const isSelected = selectedStar === starNumber;

    return (
      <motion.button
        key={index}
        ref={(el) => {
          starRefs.current[index] = el;
        }}
        type="button"
        role="radio"
        aria-checked={starNumber === value}
        aria-label={`Rate ${starNumber} out of 5 stars`}
        tabIndex={starNumber === value || (value === 0 && starNumber === 1) ? 0 : -1}
        onMouseEnter={() => handleMouseEnter(starNumber)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(starNumber, starRefs.current[index])}
        onKeyDown={handleKeyDown}
        animate={
          isSelected
            ? { scale: [1, 1.35, 1], transition: { type: "spring", stiffness: 500, damping: 12 } }
            : { scale: 1 }
        }
        whileHover={{ scale: 1.15, transition: { type: "spring", stiffness: 400, damping: 10 } }}
        whileTap={{ scale: 0.9 }}
        className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-sm"
        style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Empty star */}
        <Star
          className={`${sizeConfig.star} text-zinc-300 dark:text-zinc-600`}
          fill="currentColor"
          strokeWidth={0}
        />
        {/* Filled overlay */}
        {isFilled && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Star
              className={`${sizeConfig.star} text-amber-400 fill-amber-400`}
              fill="currentColor"
              strokeWidth={0}
              style={{
                filter: hoverValue !== null ? "drop-shadow(0 0 3px rgba(251,191,36,0.5))" : undefined,
              }}
            />
          </span>
        )}
      </motion.button>
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      ref={groupRef}
      className={`inline-flex items-center ${sizeConfig.gap}`}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={
        isInteractive
          ? "Rate out of 5 stars"
          : `Rating: ${value} out of 5 stars`
      }
    >
      {Array.from({ length: 5 }, (_, i) =>
        isInteractive ? renderInteractiveStar(i) : renderReadOnlyStar(i),
      )}
      {showValue && (
        <AnimatePresence mode="wait">
          <motion.span
            key={displayValue.toFixed(1)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`ml-1.5 font-semibold text-neutral-700 dark:text-neutral-300 ${sizeConfig.text}`}
          >
            {displayValue.toFixed(1)}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}

export default StarRating;
