'use client';

import {
  Framework,
  FRAMEWORK_LABELS,
  FRAMEWORK_COLORS,
} from '../../types/web-template';

interface FrameworkBadgeProps {
  framework: Framework;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FrameworkBadge({
  framework,
  size = 'md',
  showLabel = true,
}: FrameworkBadgeProps) {
  const label = FRAMEWORK_LABELS[framework] || framework;
  const color = FRAMEWORK_COLORS[framework] || '#6B7280';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const dotSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className={`rounded-full ${dotSizes[size]}`}
        style={{ backgroundColor: color }}
      />
      {showLabel && label}
    </span>
  );
}
