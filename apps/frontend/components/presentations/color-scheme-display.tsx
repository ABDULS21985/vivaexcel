"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X } from "lucide-react";
import type { ColorScheme } from "@/types/presentation";

// =============================================================================
// Types
// =============================================================================

interface ColorSchemeDisplayProps {
  colorSchemes: ColorScheme[];
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ColorSchemeDisplay({
  colorSchemes,
  className = "",
}: ColorSchemeDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedColor, setExpandedColor] = useState<string | null>(null);

  if (!colorSchemes.length) return null;

  const currentScheme = colorSchemes[activeTab];

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Color Schemes
        </h3>
      </div>

      {/* Tab Selector */}
      {colorSchemes.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {colorSchemes.map((scheme, idx) => (
            <button
              key={scheme.name}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === idx
                  ? "bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-blue-400 border border-[#1E4DB7]/20"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
              }`}
            >
              {/* Mini color preview */}
              <div className="flex -space-x-1">
                {scheme.colors.slice(0, 3).map((color, cIdx) => (
                  <div
                    key={cIdx}
                    className="w-3 h-3 rounded-full border border-white dark:border-neutral-900"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {scheme.name}
            </button>
          ))}
        </div>
      )}

      {/* Color Swatches */}
      {currentScheme && (
        <motion.div
          key={currentScheme.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* Scheme Name */}
          {colorSchemes.length <= 1 && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {currentScheme.name}
            </p>
          )}

          {/* Swatches Row */}
          <div className="flex gap-2 flex-wrap">
            {currentScheme.colors.map((color, cIdx) => (
              <motion.button
                key={`${color}-${cIdx}`}
                onClick={() =>
                  setExpandedColor(
                    expandedColor === color ? null : color,
                  )
                }
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <div
                  className="w-10 h-10 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 cursor-pointer transition-shadow hover:shadow-md"
                  style={{ backgroundColor: color }}
                />
                {/* Color code label on hover */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                    {color}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Full Gradient Bar */}
          <div
            className="h-3 rounded-full overflow-hidden flex mt-4"
            style={{
              background: `linear-gradient(to right, ${currentScheme.colors.join(", ")})`,
            }}
          />
        </motion.div>
      )}

      {/* Expanded Color Preview Modal */}
      <AnimatePresence>
        {expandedColor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setExpandedColor(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-48 h-48 rounded-3xl shadow-2xl border-4 border-white dark:border-neutral-800"
                style={{ backgroundColor: expandedColor }}
              />
              <div className="mt-4 text-center">
                <p className="text-lg font-mono font-bold text-white">
                  {expandedColor}
                </p>
              </div>
              <button
                onClick={() => setExpandedColor(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ColorSchemeDisplay;
