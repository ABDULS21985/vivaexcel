"use client";

import { useEffect, useState } from "react";

// ============================================
// TYPES
// ============================================

interface DohaSkylineProps {
  className?: string;
  animate?: boolean;
  variant?: "full" | "minimal" | "silhouette";
  showReflection?: boolean;
  colorScheme?: "brand" | "night" | "sunset";
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
// DOHA SKYLINE COMPONENT
// ============================================

export function DohaSkyline({
  className = "",
  animate = true,
  variant = "full",
  showReflection = true,
  colorScheme = "brand",
}: DohaSkylineProps) {
  const [windowLights, setWindowLights] = useState<boolean[]>([]);

  // Initialize random window lights
  useEffect(() => {
    if (!animate) return;
    const lights = Array.from({ length: 50 }, () => Math.random() > 0.5);
    setWindowLights(lights);

    const interval = setInterval(() => {
      setWindowLights((prev) =>
        prev.map((light, i) => (Math.random() > 0.9 ? !light : light))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [animate]);

  const getColors = () => {
    switch (colorScheme) {
      case "night":
        return {
          sky1: "#0a0e1a",
          sky2: "#1a1f35",
          buildings: "#0f1525",
          buildingsLight: "#1a2040",
          accent: "#FFE63B",
          windows: "#FFE63B",
          reflection: "rgba(255,230,59,0.1)",
        };
      case "sunset":
        return {
          sky1: "#1E4DB7",
          sky2: "#F59A23",
          buildings: "#0A1628",
          buildingsLight: "#1E4DB7",
          accent: "#FFE63B",
          windows: "#FFE63B",
          reflection: "rgba(245,154,35,0.15)",
        };
      default:
        return {
          sky1: BRAND_COLORS.primary,
          sky2: BRAND_COLORS.secondary,
          buildings: BRAND_COLORS.secondary,
          buildingsLight: BRAND_COLORS.primary,
          accent: BRAND_COLORS.orange,
          windows: BRAND_COLORS.yellow,
          reflection: "rgba(30,77,183,0.1)",
        };
    }
  };

  const colors = getColors();

  return (
    <svg
      viewBox="0 0 1200 400"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.sky1} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.sky2} stopOpacity="0.95" />
        </linearGradient>

        {/* Building gradients */}
        <linearGradient id="buildingGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.buildingsLight} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.buildings} stopOpacity="1" />
        </linearGradient>

        <linearGradient id="buildingGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={colors.buildings} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.buildingsLight} stopOpacity="0.7" />
        </linearGradient>

        {/* Reflection gradient */}
        <linearGradient id="reflectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.reflection} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="windowGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Star glow */}
        <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky background */}
      <rect width="1200" height="280" fill="url(#skyGradient)" />

      {/* Stars (for night/brand variants) */}
      {colorScheme !== "sunset" && (
        <g filter="url(#starGlow)">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 1200}
              cy={Math.random() * 150}
              r={Math.random() * 1.5 + 0.5}
              fill="white"
              opacity={0.3 + Math.random() * 0.4}
            >
              {animate && (
                <animate
                  attributeName="opacity"
                  values={`${0.3 + Math.random() * 0.3};${0.6 + Math.random() * 0.4};${0.3 + Math.random() * 0.3}`}
                  dur={`${2 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}
        </g>
      )}

      {/* ICONIC DOHA BUILDINGS */}
      <g id="skyline">
        {/* Aspire Tower (The Torch) - Far left */}
        <g>
          <path
            d="M 50 280 L 50 120 Q 65 80 80 120 L 80 280 Z"
            fill="url(#buildingGradient1)"
          />
          <ellipse cx="65" cy="100" rx="20" ry="30" fill={colors.buildingsLight} opacity="0.5" />
          {/* Windows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="55"
              y={130 + i * 18}
              width="20"
              height="10"
              fill={windowLights[i] ? colors.windows : "transparent"}
              opacity={windowLights[i] ? 0.8 : 0.1}
              filter={windowLights[i] ? "url(#windowGlow)" : undefined}
            />
          ))}
        </g>

        {/* West Bay Tower 1 */}
        <g>
          <rect x="120" y="140" width="50" height="140" fill="url(#buildingGradient1)" />
          <polygon points="120,140 145,90 170,140" fill={colors.buildingsLight} opacity="0.8" />
          {/* Windows grid */}
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={125 + col * 15}
                y={150 + row * 22}
                width="10"
                height="15"
                fill={windowLights[8 + row * 3 + col] ? colors.windows : "transparent"}
                opacity={windowLights[8 + row * 3 + col] ? 0.7 : 0.1}
                filter={windowLights[8 + row * 3 + col] ? "url(#windowGlow)" : undefined}
              />
            ))
          )}
        </g>

        {/* Doha Tower (Burj Qatar) - Iconic bullet shape */}
        <g>
          <path
            d="M 230 280 L 230 100 Q 230 60 270 60 Q 310 60 310 100 L 310 280 Z"
            fill="url(#buildingGradient2)"
          />
          {/* Diamond pattern overlay */}
          <g opacity="0.3" stroke={colors.windows} strokeWidth="0.5" fill="none">
            {Array.from({ length: 10 }).map((_, i) => (
              <path
                key={i}
                d={`M 235 ${80 + i * 20} L 270 ${90 + i * 20} L 305 ${80 + i * 20}`}
              />
            ))}
          </g>
          {/* Top light */}
          <circle cx="270" cy="70" r="5" fill={colors.accent}>
            {animate && (
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

        {/* Palm Tower 1 */}
        <g>
          <rect x="340" y="160" width="35" height="120" fill="url(#buildingGradient1)" />
          <rect x="345" y="120" width="25" height="40" fill={colors.buildingsLight} opacity="0.8" />
          {/* Windows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect
              key={i}
              x="347"
              y={170 + i * 22}
              width="26"
              height="14"
              fill={windowLights[26 + i] ? colors.windows : "transparent"}
              opacity={windowLights[26 + i] ? 0.6 : 0.1}
            />
          ))}
        </g>

        {/* Tornado Tower */}
        <g>
          <path
            d="M 410 280 L 420 100 Q 440 80 460 100 L 470 280 Z"
            fill="url(#buildingGradient2)"
          />
          {/* Spiral pattern */}
          <g stroke={colors.windows} strokeWidth="1" fill="none" opacity="0.4">
            {Array.from({ length: 8 }).map((_, i) => (
              <path
                key={i}
                d={`M ${415 + i * 2} ${110 + i * 20} Q ${440} ${120 + i * 20} ${465 - i * 2} ${110 + i * 20}`}
              />
            ))}
          </g>
        </g>

        {/* Qatar National Bank Tower */}
        <g>
          <rect x="500" y="130" width="60" height="150" fill="url(#buildingGradient1)" />
          <rect x="510" y="110" width="40" height="20" fill={colors.buildingsLight} />
          {/* Windows grid */}
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <rect
                key={`qnb-${row}-${col}`}
                x={505 + col * 14}
                y={140 + row * 20}
                width="10"
                height="12"
                fill={windowLights[31 + row * 4 + col] ? colors.windows : "transparent"}
                opacity={windowLights[31 + row * 4 + col] ? 0.7 : 0.1}
              />
            ))
          )}
        </g>

        {/* The Torch Doha (Aspire replica) */}
        <g>
          <path
            d="M 590 280 L 595 150 Q 620 100 645 150 L 650 280 Z"
            fill="url(#buildingGradient2)"
          />
          <ellipse cx="620" cy="115" rx="15" ry="25" fill={colors.accent} opacity="0.6">
            {animate && (
              <animate
                attributeName="opacity"
                values="0.4;0.8;0.4"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </g>

        {/* Museum of Islamic Art (geometric dome) */}
        <g>
          <rect x="690" y="200" width="80" height="80" fill="url(#buildingGradient1)" />
          <path
            d="M 690 200 Q 730 140 770 200"
            fill={colors.buildingsLight}
            opacity="0.9"
          />
          {/* Geometric pattern on dome */}
          <g stroke={colors.windows} strokeWidth="0.5" fill="none" opacity="0.3">
            <path d="M 710 200 L 730 170 L 750 200" />
            <path d="M 700 200 L 730 160 L 760 200" />
          </g>
        </g>

        {/* Katara Towers (curved) */}
        <g>
          <path
            d="M 800 280 Q 800 100 830 100 Q 860 100 860 280"
            fill="url(#buildingGradient2)"
            opacity="0.9"
          />
          <path
            d="M 870 280 Q 870 120 895 120 Q 920 120 920 280"
            fill="url(#buildingGradient1)"
            opacity="0.85"
          />
        </g>

        {/* Al Bidda Tower */}
        <g>
          <rect x="950" y="150" width="40" height="130" fill="url(#buildingGradient1)" />
          <polygon points="950,150 970,100 990,150" fill={colors.buildingsLight} opacity="0.7" />
          {/* Windows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={i}
              x="955"
              y={160 + i * 20}
              width="30"
              height="12"
              fill={windowLights[i % windowLights.length] ? colors.windows : "transparent"}
              opacity={windowLights[i % windowLights.length] ? 0.5 : 0.1}
            />
          ))}
        </g>

        {/* Distant buildings (background layer) */}
        <g opacity="0.4">
          <rect x="180" y="220" width="30" height="60" fill={colors.buildings} />
          <rect x="380" y="230" width="25" height="50" fill={colors.buildings} />
          <rect x="580" y="240" width="20" height="40" fill={colors.buildings} />
          <rect x="780" y="225" width="28" height="55" fill={colors.buildings} />
        </g>

        {/* Additional accent buildings */}
        <g>
          <rect x="1020" y="180" width="50" height="100" fill="url(#buildingGradient2)" />
          <rect x="1090" y="200" width="40" height="80" fill="url(#buildingGradient1)" />
          <rect x="1140" y="220" width="35" height="60" fill={colors.buildings} opacity="0.6" />
        </g>
      </g>

      {/* Ground / Water line */}
      <rect x="0" y="280" width="1200" height="120" fill={colors.buildings} opacity="0.95" />

      {/* Reflection in water */}
      {showReflection && (
        <g opacity="0.15" transform="translate(0, 560) scale(1, -1)">
          <use href="#skyline" filter="url(#softBlur)" />
        </g>
      )}

      {/* Water ripple effect */}
      {showReflection && (
        <g>
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={290 + i * 20}
              x2="1200"
              y2={290 + i * 20}
              stroke={colors.windows}
              strokeWidth="0.5"
              opacity={0.1 - i * 0.015}
            >
              {animate && (
                <animate
                  attributeName="y1"
                  values={`${290 + i * 20};${293 + i * 20};${290 + i * 20}`}
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              )}
            </line>
          ))}
        </g>
      )}

      {/* Decorative crescent moon (Qatar/Islamic element) */}
      {colorScheme !== "sunset" && variant === "full" && (
        <g transform="translate(1050, 50)">
          <path
            d="M 0 0 A 20 20 0 1 1 0 40 A 15 15 0 1 0 0 0"
            fill={colors.windows}
            opacity="0.8"
          >
            {animate && (
              <animate
                attributeName="opacity"
                values="0.6;0.9;0.6"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </path>
          <circle cx="25" cy="15" r="3" fill={colors.windows} opacity="0.9" />
        </g>
      )}
    </svg>
  );
}

export default DohaSkyline;
