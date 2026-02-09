"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRightLeft,
  MessageSquareText,
  BarChart3,
  ImageIcon,
  PenTool,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import type { Presentation } from "@/types/presentation";

// =============================================================================
// Types
// =============================================================================

interface PresentationFeaturesProps {
  presentation: Presentation;
  className?: string;
}

interface FeatureItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

function getFeatureItems(presentation: Presentation): FeatureItem[] {
  return [
    {
      key: "animations",
      label: "Animations",
      icon: <Sparkles className="h-4 w-4" />,
      available: presentation.hasAnimations,
    },
    {
      key: "transitions",
      label: "Slide Transitions",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      available: presentation.hasTransitions,
    },
    {
      key: "speakerNotes",
      label: "Speaker Notes",
      icon: <MessageSquareText className="h-4 w-4" />,
      available: presentation.hasSpeakerNotes,
    },
    {
      key: "charts",
      label: "Charts & Graphs",
      icon: <BarChart3 className="h-4 w-4" />,
      available: presentation.hasCharts,
    },
    {
      key: "images",
      label: "Image Placeholders",
      icon: <ImageIcon className="h-4 w-4" />,
      available: presentation.hasImages,
    },
    {
      key: "editable",
      label: "Fully Editable",
      icon: <PenTool className="h-4 w-4" />,
      available: presentation.isFullyEditable,
    },
    {
      key: "documentation",
      label: "Documentation",
      icon: <BookOpen className="h-4 w-4" />,
      available: presentation.includesDocumentation,
    },
  ];
}

// =============================================================================
// Component
// =============================================================================

export function PresentationFeatures({
  presentation,
  className = "",
}: PresentationFeaturesProps) {
  const features = getFeatureItems(presentation);

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
        Features
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
              feature.available
                ? "bg-emerald-50 dark:bg-emerald-900/10"
                : "bg-neutral-50 dark:bg-neutral-800/30"
            }`}
          >
            <div
              className={`flex-shrink-0 ${
                feature.available
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {feature.icon}
            </div>
            <span
              className={`text-sm font-medium flex-1 ${
                feature.available
                  ? "text-neutral-700 dark:text-neutral-300"
                  : "text-neutral-400 dark:text-neutral-500 line-through"
              }`}
            >
              {feature.label}
            </span>
            {feature.available ? (
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PresentationFeatures;
