"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface TechStackBadgesProps {
  technologies: string[];
  maxVisible?: number;
  className?: string;
}

// =============================================================================
// Tech Color Map
// =============================================================================

const TECH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  aws: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
  azure: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  gcp: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  "google cloud": { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  docker: { bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-800" },
  kubernetes: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  k8s: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  terraform: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  python: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800" },
  java: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  react: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
  node: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  nodejs: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  postgresql: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
  mongodb: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  redis: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  kafka: { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-700 dark:text-neutral-300", border: "border-neutral-200 dark:border-neutral-700" },
  elasticsearch: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400", border: "border-teal-200 dark:border-teal-800" },
  nginx: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  jenkins: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  ansible: { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-700 dark:text-neutral-300", border: "border-neutral-200 dark:border-neutral-700" },
};

function getTechStyle(tech: string) {
  const key = tech.toLowerCase().trim();
  return (
    TECH_COLORS[key] || {
      bg: "bg-neutral-50 dark:bg-neutral-800/50",
      text: "text-neutral-700 dark:text-neutral-300",
      border: "border-neutral-200 dark:border-neutral-700",
    }
  );
}

// =============================================================================
// Component
// =============================================================================

export function TechStackBadges({
  technologies,
  maxVisible = 5,
  className = "",
}: TechStackBadgesProps) {
  const [showAll, setShowAll] = useState(false);

  if (!technologies || technologies.length === 0) return null;

  const visibleTechs = showAll
    ? technologies
    : technologies.slice(0, maxVisible);
  const hiddenCount = technologies.length - maxVisible;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Technology Stack
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTechs.map((tech) => {
          const style = getTechStyle(tech);
          return (
            <span
              key={tech}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border ${style.bg} ${style.text} ${style.border}`}
            >
              {tech}
            </span>
          );
        })}

        {!showAll && hiddenCount > 0 && (
          <motion.button
            onClick={() => setShowAll(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1E4DB7] dark:text-blue-400 bg-[#1E4DB7]/5 dark:bg-blue-400/10 rounded-lg border border-[#1E4DB7]/20 dark:border-blue-400/20 hover:bg-[#1E4DB7]/10 transition-colors"
          >
            +{hiddenCount} more
            <ChevronDown className="h-3 w-3" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showAll && hiddenCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onClick={() => setShowAll(false)}
            className="mt-2 text-xs text-[#1E4DB7] dark:text-blue-400 font-medium hover:underline"
          >
            Show less
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TechStackBadges;
