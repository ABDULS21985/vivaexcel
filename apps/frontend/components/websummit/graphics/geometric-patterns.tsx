"use client";

import { useEffect, useRef, useState } from "react";

// ============================================
// TYPES
// ============================================

interface PatternProps {
  className?: string;
  animate?: boolean;
  opacity?: number;
  color?: string;
}

// ============================================
// BRAND COLORS
// ============================================

const BRAND_COLORS = {
  primary: "#1E4DB7",
  yellow: "#FFE63B",
  orange: "#F59A23",
  secondary: "#0A1628",
};

// ============================================
// GRID PATTERN
// ============================================

export function GridPattern({
  className = "",
  animate = false,
  opacity = 0.1,
  color = BRAND_COLORS.primary,
}: PatternProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity={opacity}
          />
        </pattern>
        {animate && (
          <linearGradient id="grid-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
            <animate
              attributeName="x1"
              values="-100%;100%"
              dur="8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0%;200%"
              dur="8s"
              repeatCount="indefinite"
            />
          </linearGradient>
        )}
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      {animate && (
        <rect width="100%" height="100%" fill="url(#grid-sweep)" opacity="0.5" />
      )}
    </svg>
  );
}

// ============================================
// DOT MATRIX PATTERN
// ============================================

export function DotMatrixPattern({
  className = "",
  animate = false,
  opacity = 0.1,
  color = BRAND_COLORS.primary,
}: PatternProps & { dotSize?: number; spacing?: number }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="dot-pattern"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="15" cy="15" r="1.5" fill={color} opacity={opacity}>
            {animate && (
              <animate
                attributeName="r"
                values="1.5;2;1.5"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </pattern>

        {/* Radial fade for depth effect */}
        <radialGradient id="dot-fade" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      <rect
        width="100%"
        height="100%"
        fill="url(#dot-fade)"
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}

// ============================================
// FLOWING LINES PATTERN
// ============================================

export function FlowingLinesPattern({
  className = "",
  animate = true,
  opacity = 0.15,
  color = BRAND_COLORS.primary,
}: PatternProps) {
  const pathRef = useRef<SVGPathElement>(null);

  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flow-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="flow-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
          <stop offset="50%" stopColor={BRAND_COLORS.orange} stopOpacity={opacity * 0.7} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="flow-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BRAND_COLORS.yellow} stopOpacity="0" />
          <stop offset="50%" stopColor={BRAND_COLORS.yellow} stopOpacity={opacity * 0.5} />
          <stop offset="100%" stopColor={BRAND_COLORS.yellow} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Wave lines */}
      <g fill="none" strokeWidth="1.5">
        <path
          ref={pathRef}
          d="M -100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200"
          stroke="url(#flow-gradient-1)"
        >
          {animate && (
            <animate
              attributeName="d"
              values="M -100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200;
                      M -100 200 Q 200 300, 400 200 T 800 200 T 1200 200 T 1600 200;
                      M -100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </path>

        <path
          d="M -100 350 Q 300 250, 500 350 T 900 350 T 1300 350 T 1700 350"
          stroke="url(#flow-gradient-2)"
        >
          {animate && (
            <animate
              attributeName="d"
              values="M -100 350 Q 300 250, 500 350 T 900 350 T 1300 350 T 1700 350;
                      M -100 350 Q 300 450, 500 350 T 900 350 T 1300 350 T 1700 350;
                      M -100 350 Q 300 250, 500 350 T 900 350 T 1300 350 T 1700 350"
              dur="10s"
              repeatCount="indefinite"
            />
          )}
        </path>

        <path
          d="M -100 500 Q 250 400, 450 500 T 850 500 T 1250 500 T 1650 500"
          stroke="url(#flow-gradient-3)"
        >
          {animate && (
            <animate
              attributeName="d"
              values="M -100 500 Q 250 400, 450 500 T 850 500 T 1250 500 T 1650 500;
                      M -100 500 Q 250 600, 450 500 T 850 500 T 1250 500 T 1650 500;
                      M -100 500 Q 250 400, 450 500 T 850 500 T 1250 500 T 1650 500"
              dur="12s"
              repeatCount="indefinite"
            />
          )}
        </path>

        <path
          d="M -100 650 Q 350 550, 550 650 T 950 650 T 1350 650 T 1750 650"
          stroke="url(#flow-gradient-1)"
          opacity="0.5"
        >
          {animate && (
            <animate
              attributeName="d"
              values="M -100 650 Q 350 550, 550 650 T 950 650 T 1350 650 T 1750 650;
                      M -100 650 Q 350 750, 550 650 T 950 650 T 1350 650 T 1750 650;
                      M -100 650 Q 350 550, 550 650 T 950 650 T 1350 650 T 1750 650"
              dur="9s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>
    </svg>
  );
}

// ============================================
// HEXAGON PATTERN
// ============================================

export function HexagonPattern({
  className = "",
  animate = false,
  opacity = 0.08,
  color = BRAND_COLORS.primary,
}: PatternProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="hex-pattern"
          width="56"
          height="100"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1.5)"
        >
          <path
            d="M28 0 L56 14 L56 42 L28 56 L0 42 L0 14 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity={opacity}
          />
          <path
            d="M28 56 L56 70 L56 98 L28 112 L0 98 L0 70 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity={opacity}
            transform="translate(28, 0)"
          />
        </pattern>

        {animate && (
          <linearGradient id="hex-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
            <stop offset="50%" stopColor={BRAND_COLORS.orange} stopOpacity="0.1" />
            <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
            <animate
              attributeName="x1"
              values="-100%;100%"
              dur="10s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0%;200%"
              dur="10s"
              repeatCount="indefinite"
            />
          </linearGradient>
        )}
      </defs>

      <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      {animate && (
        <rect width="100%" height="100%" fill="url(#hex-glow)" />
      )}
    </svg>
  );
}

// ============================================
// CIRCUIT BOARD PATTERN
// ============================================

export function CircuitPattern({
  className = "",
  animate = true,
  opacity = 0.1,
  color = BRAND_COLORS.primary,
}: PatternProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="circuit-pattern"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          {/* Horizontal lines */}
          <line x1="0" y1="25" x2="40" y2="25" stroke={color} strokeWidth="1" opacity={opacity} />
          <line x1="60" y1="25" x2="100" y2="25" stroke={color} strokeWidth="1" opacity={opacity} />
          <line x1="0" y1="75" x2="30" y2="75" stroke={color} strokeWidth="1" opacity={opacity} />
          <line x1="70" y1="75" x2="100" y2="75" stroke={color} strokeWidth="1" opacity={opacity} />

          {/* Vertical lines */}
          <line x1="25" y1="0" x2="25" y2="20" stroke={color} strokeWidth="1" opacity={opacity} />
          <line x1="25" y1="30" x2="25" y2="70" stroke={color} strokeWidth="1" opacity={opacity} />
          <line x1="75" y1="30" x2="75" y2="100" stroke={color} strokeWidth="1" opacity={opacity} />

          {/* Corner paths */}
          <path d="M 40 25 L 50 25 L 50 50 L 75 50 L 75 30" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
          <path d="M 30 75 L 50 75 L 50 50" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />

          {/* Nodes */}
          <circle cx="25" cy="25" r="3" fill={color} opacity={opacity * 1.5} />
          <circle cx="75" cy="25" r="2" fill={color} opacity={opacity * 1.5} />
          <circle cx="50" cy="50" r="4" fill={color} opacity={opacity * 1.5} />
          <circle cx="25" cy="75" r="2" fill={color} opacity={opacity * 1.5} />
          <circle cx="75" cy="75" r="3" fill={color} opacity={opacity * 1.5} />
        </pattern>

        {/* Animated pulse effect */}
        {animate && (
          <>
            <radialGradient id="circuit-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={BRAND_COLORS.orange} stopOpacity="0.15">
                <animate
                  attributeName="stop-opacity"
                  values="0.15;0.05;0.15"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
              <animate
                attributeName="r"
                values="30%;60%;30%"
                dur="3s"
                repeatCount="indefinite"
              />
            </radialGradient>
          </>
        )}
      </defs>

      <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      {animate && (
        <rect width="100%" height="100%" fill="url(#circuit-pulse)" />
      )}
    </svg>
  );
}

// ============================================
// ISLAMIC GEOMETRIC PATTERN (Qatar-themed)
// ============================================

export function IslamicPattern({
  className = "",
  animate = false,
  opacity = 0.06,
  color = BRAND_COLORS.primary,
}: PatternProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="islamic-pattern"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          {/* Eight-pointed star (classic Islamic motif) */}
          <g transform="translate(40, 40)">
            {/* Outer star points */}
            <polygon
              points="0,-35 7,-12 30,-12 12,3 18,26 0,13 -18,26 -12,3 -30,-12 -7,-12"
              fill="none"
              stroke={color}
              strokeWidth="0.75"
              opacity={opacity}
            />
            {/* Inner square rotated */}
            <rect
              x="-15"
              y="-15"
              width="30"
              height="30"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity={opacity * 0.7}
              transform="rotate(45)"
            />
            {/* Center circle */}
            <circle
              r="8"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity={opacity * 0.5}
            />
          </g>

          {/* Connecting lines to adjacent patterns */}
          <line x1="0" y1="40" x2="5" y2="40" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
          <line x1="75" y1="40" x2="80" y2="40" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
          <line x1="40" y1="0" x2="40" y2="5" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
          <line x1="40" y1="75" x2="40" y2="80" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
        </pattern>

        {animate && (
          <linearGradient id="islamic-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND_COLORS.yellow} stopOpacity="0" />
            <stop offset="50%" stopColor={BRAND_COLORS.yellow} stopOpacity="0.08" />
            <stop offset="100%" stopColor={BRAND_COLORS.yellow} stopOpacity="0" />
            <animate
              attributeName="x1"
              values="-50%;150%"
              dur="6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0%;200%"
              dur="6s"
              repeatCount="indefinite"
            />
          </linearGradient>
        )}
      </defs>

      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      {animate && (
        <rect width="100%" height="100%" fill="url(#islamic-shimmer)" />
      )}
    </svg>
  );
}

// ============================================
// DIAGONAL STRIPES PATTERN
// ============================================

export function DiagonalStripesPattern({
  className = "",
  animate = false,
  opacity = 0.05,
  color = BRAND_COLORS.primary,
}: PatternProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="diagonal-stripes"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="20"
            stroke={color}
            strokeWidth="2"
            opacity={opacity}
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#diagonal-stripes)" />
    </svg>
  );
}

// ============================================
// COMBINED EXPORT
// ============================================

export const GeometricPatterns = {
  Grid: GridPattern,
  DotMatrix: DotMatrixPattern,
  FlowingLines: FlowingLinesPattern,
  Hexagon: HexagonPattern,
  Circuit: CircuitPattern,
  Islamic: IslamicPattern,
  DiagonalStripes: DiagonalStripesPattern,
};

export default GeometricPatterns;
