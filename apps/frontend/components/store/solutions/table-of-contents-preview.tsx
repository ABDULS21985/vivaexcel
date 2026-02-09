"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, BookOpen } from "lucide-react";
import type { TOCItem } from "@/types/solution-document";

// =============================================================================
// Types
// =============================================================================

interface TableOfContentsPreviewProps {
  items: TOCItem[];
  maxVisibleItems?: number;
  className?: string;
}

interface TOCNodeProps {
  item: TOCItem;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
}

// =============================================================================
// TOC Node Component
// =============================================================================

function TOCNode({ item, level, isExpanded, onToggle }: TOCNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const indent = level * 16;

  return (
    <div>
      <button
        onClick={hasChildren ? onToggle : undefined}
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
          hasChildren ? "cursor-pointer" : "cursor-default"
        }`}
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        {hasChildren ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
          </motion.div>
        ) : (
          <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          </div>
        )}

        <span
          className={`flex-1 text-left truncate ${
            level === 0
              ? "font-semibold text-neutral-900 dark:text-white"
              : level === 1
                ? "font-medium text-neutral-700 dark:text-neutral-300"
                : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          {item.title}
        </span>

        {item.pageNumber !== undefined && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums flex-shrink-0">
            p.{item.pageNumber}
          </span>
        )}
      </button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children!.map((child, idx) => (
              <TOCNodeWrapper key={idx} item={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TOCNodeWrapper({ item, level }: { item: TOCItem; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  return (
    <TOCNode
      item={item}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TableOfContentsPreview({
  items,
  maxVisibleItems = 8,
  className = "",
}: TableOfContentsPreviewProps) {
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  const visibleItems = showAll ? items : items.slice(0, maxVisibleItems);
  const hasMore = items.length > maxVisibleItems;

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Table of Contents
        </h3>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          ({items.length} sections)
        </span>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800">
        <div className="space-y-0.5">
          {visibleItems.map((item, idx) => (
            <TOCNodeWrapper key={idx} item={item} level={0} />
          ))}
        </div>

        {hasMore && (
          <motion.button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-full justify-center py-2 rounded-lg hover:bg-[#1E4DB7]/5"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
            />
            {showAll
              ? "Show less"
              : `Show full TOC (${items.length - maxVisibleItems} more)`}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default TableOfContentsPreview;
