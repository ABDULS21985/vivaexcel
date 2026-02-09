"use client";

import { useEffect, useState } from "react";

// ============================================
// TYPES
// ============================================

interface AnimatedIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
  color?: string;
  secondaryColor?: string;
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
// ANIMATED GLOBE ICON
// ============================================

export function AnimatedGlobeIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      {/* Globe circle */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="url(#globe-grad)"
        strokeWidth="2"
      />

      {/* Horizontal lines (latitudes) */}
      <ellipse cx="24" cy="24" rx="20" ry="8" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <ellipse cx="24" cy="24" rx="20" ry="16" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />

      {/* Vertical line (meridian) */}
      <ellipse
        cx="24"
        cy="24"
        rx="10"
        ry="20"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      >
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 24 24"
            to="360 24 24"
            dur="20s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>

      {/* Second meridian */}
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="20"
        fill="none"
        stroke={secondaryColor}
        strokeWidth="1"
        opacity="0.3"
      >
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="45 24 24"
            to="405 24 24"
            dur="25s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>

      {/* Orbiting dot */}
      {animate && (
        <circle cx="24" cy="4" r="3" fill={secondaryColor}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 24 24"
            to="360 24 24"
            dur="8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}

// ============================================
// ANIMATED SHIELD ICON
// ============================================

export function AnimatedShieldIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <filter id="shield-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield shape */}
      <path
        d="M24 4 L42 10 L42 22 C42 32 34 40 24 44 C14 40 6 32 6 22 L6 10 Z"
        fill="none"
        stroke="url(#shield-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        {animate && (
          <animate
            attributeName="stroke-width"
            values="2;3;2"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Inner shield */}
      <path
        d="M24 10 L36 14 L36 22 C36 29 30 35 24 38 C18 35 12 29 12 22 L12 14 Z"
        fill={color}
        opacity="0.15"
      />

      {/* Checkmark */}
      <path
        d="M17 24 L22 29 L31 18"
        fill="none"
        stroke={secondaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={animate ? "url(#shield-glow)" : undefined}
      >
        {animate && (
          <>
            <animate
              attributeName="stroke-dasharray"
              values="0,30;30,0"
              dur="1.5s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </path>

      {/* Pulse rings */}
      {animate && (
        <>
          <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="1" opacity="0">
            <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ============================================
// ANIMATED NETWORK ICON
// ============================================

export function AnimatedNetworkIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="network-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      <g stroke={color} strokeWidth="1.5" opacity="0.6">
        <line x1="24" y1="24" x2="12" y2="12">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="36" y2="12">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" begin="0.2s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="12" y2="36">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" begin="0.4s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="36" y2="36">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" begin="0.6s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="24" y2="6">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" begin="0.8s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="24" y2="42">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" begin="1s" fill="freeze" />
          )}
        </line>
      </g>

      {/* Center node */}
      <circle cx="24" cy="24" r="6" fill="url(#network-grad)">
        {animate && (
          <animate attributeName="r" values="6;7;6" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Outer nodes */}
      {[
        { cx: 12, cy: 12, delay: 0 },
        { cx: 36, cy: 12, delay: 0.1 },
        { cx: 12, cy: 36, delay: 0.2 },
        { cx: 36, cy: 36, delay: 0.3 },
        { cx: 24, cy: 6, delay: 0.4 },
        { cx: 24, cy: 42, delay: 0.5 },
      ].map((node, i) => (
        <circle key={i} cx={node.cx} cy={node.cy} r="4" fill={secondaryColor}>
          {animate && (
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="2s"
              begin={`${node.delay}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}

      {/* Data transfer pulses */}
      {animate && (
        <>
          <circle r="2" fill={BRAND_COLORS.yellow}>
            <animateMotion dur="2s" repeatCount="indefinite" path="M24,24 L12,12" />
            <animate attributeName="opacity" values="1;0;0;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="2" fill={BRAND_COLORS.yellow}>
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M24,24 L36,36" />
            <animate attributeName="opacity" values="1;0;0;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ============================================
// ANIMATED BLOCKCHAIN ICON
// ============================================

export function AnimatedBlockchainIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="block-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      {/* Chain links (lines) */}
      <g stroke={color} strokeWidth="2" opacity="0.5">
        <line x1="16" y1="16" x2="24" y2="24">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,15;15,0" dur="0.5s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="32" y2="16">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,15;15,0" dur="0.5s" begin="0.3s" fill="freeze" />
          )}
        </line>
        <line x1="24" y1="24" x2="24" y2="36">
          {animate && (
            <animate attributeName="stroke-dasharray" values="0,15;15,0" dur="0.5s" begin="0.6s" fill="freeze" />
          )}
        </line>
      </g>

      {/* Block 1 (top left) */}
      <g>
        <rect
          x="6"
          y="6"
          width="16"
          height="16"
          rx="3"
          fill={color}
          opacity="0.2"
        />
        <rect
          x="6"
          y="6"
          width="16"
          height="16"
          rx="3"
          fill="none"
          stroke="url(#block-grad)"
          strokeWidth="2"
        >
          {animate && (
            <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite" />
          )}
        </rect>
        {/* Block detail lines */}
        <line x1="10" y1="11" x2="18" y2="11" stroke={secondaryColor} strokeWidth="1.5" opacity="0.6" />
        <line x1="10" y1="15" x2="16" y2="15" stroke={secondaryColor} strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Block 2 (top right) */}
      <g>
        <rect
          x="26"
          y="6"
          width="16"
          height="16"
          rx="3"
          fill={secondaryColor}
          opacity="0.2"
        />
        <rect
          x="26"
          y="6"
          width="16"
          height="16"
          rx="3"
          fill="none"
          stroke="url(#block-grad)"
          strokeWidth="2"
        />
        <line x1="30" y1="11" x2="38" y2="11" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <line x1="30" y1="15" x2="36" y2="15" stroke={color} strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Block 3 (bottom) */}
      <g>
        <rect
          x="16"
          y="30"
          width="16"
          height="16"
          rx="3"
          fill={color}
          opacity="0.2"
        />
        <rect
          x="16"
          y="30"
          width="16"
          height="16"
          rx="3"
          fill="none"
          stroke="url(#block-grad)"
          strokeWidth="2"
        />
        <line x1="20" y1="35" x2="28" y2="35" stroke={secondaryColor} strokeWidth="1.5" opacity="0.6" />
        <line x1="20" y1="39" x2="26" y2="39" stroke={secondaryColor} strokeWidth="1.5" opacity="0.4" />

        {/* New block animation */}
        {animate && (
          <rect
            x="16"
            y="30"
            width="16"
            height="16"
            rx="3"
            fill={BRAND_COLORS.yellow}
            opacity="0"
          >
            <animate
              attributeName="opacity"
              values="0;0.3;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>
        )}
      </g>
    </svg>
  );
}

// ============================================
// ANIMATED AI/BRAIN ICON
// ============================================

export function AnimatedAIIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Brain outline */}
      <path
        d="M24 6 C16 6, 10 12, 10 20 C10 24, 12 27, 14 29 C12 31, 10 34, 10 38 C10 42, 14 44, 18 44 L30 44 C34 44, 38 42, 38 38 C38 34, 36 31, 34 29 C36 27, 38 24, 38 20 C38 12, 32 6, 24 6"
        fill="none"
        stroke="url(#ai-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Neural connections */}
      <g stroke={secondaryColor} strokeWidth="1" opacity="0.6">
        <path d="M18 16 Q 24 12, 30 16" fill="none" />
        <path d="M15 24 Q 24 20, 33 24" fill="none" />
        <path d="M16 32 Q 24 28, 32 32" fill="none" />
        <path d="M20 38 Q 24 36, 28 38" fill="none" />
      </g>

      {/* Neural nodes */}
      {[
        { cx: 18, cy: 16 },
        { cx: 30, cy: 16 },
        { cx: 15, cy: 24 },
        { cx: 24, cy: 20 },
        { cx: 33, cy: 24 },
        { cx: 16, cy: 32 },
        { cx: 24, cy: 28 },
        { cx: 32, cy: 32 },
        { cx: 20, cy: 38 },
        { cx: 28, cy: 38 },
      ].map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r="2"
          fill={i % 2 === 0 ? color : secondaryColor}
          filter={animate ? "url(#ai-glow)" : undefined}
        >
          {animate && (
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur={`${1.5 + i * 0.1}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}

      {/* Thinking pulse */}
      {animate && (
        <circle cx="24" cy="24" r="15" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
          <animate attributeName="r" values="15;22;15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

// ============================================
// ANIMATED ROCKET/LAUNCH ICON
// ============================================

export function AnimatedRocketIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rocket-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="flame-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.yellow} />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} />
        </linearGradient>
      </defs>

      {/* Rocket body */}
      <path
        d="M24 6 C24 6, 18 14, 18 26 L18 34 L24 38 L30 34 L30 26 C30 14, 24 6, 24 6"
        fill="url(#rocket-grad)"
      />

      {/* Window */}
      <circle cx="24" cy="20" r="4" fill={BRAND_COLORS.yellow} opacity="0.8">
        {animate && (
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Fins */}
      <path d="M18 28 L10 36 L18 34 Z" fill={secondaryColor} />
      <path d="M30 28 L38 36 L30 34 Z" fill={secondaryColor} />

      {/* Flame */}
      <path
        d="M20 38 L24 46 L28 38"
        fill="url(#flame-grad)"
      >
        {animate && (
          <animate
            attributeName="d"
            values="M20 38 L24 46 L28 38;M21 38 L24 44 L27 38;M20 38 L24 46 L28 38"
            dur="0.3s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Exhaust particles */}
      {animate && (
        <>
          <circle cx="22" cy="42" r="1.5" fill={BRAND_COLORS.yellow} opacity="0.8">
            <animate attributeName="cy" values="42;48;42" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="26" cy="44" r="1" fill={BRAND_COLORS.orange} opacity="0.6">
            <animate attributeName="cy" values="44;50;44" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.6s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Motion lines */}
      {animate && (
        <g stroke={color} strokeWidth="1" opacity="0.3">
          <line x1="8" y1="20" x2="14" y2="20">
            <animate attributeName="x1" values="8;6;8" dur="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="34" y1="16" x2="40" y2="16">
            <animate attributeName="x2" values="40;42;40" dur="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="6" y1="28" x2="12" y2="28">
            <animate attributeName="x1" values="6;4;6" dur="0.35s" repeatCount="indefinite" />
          </line>
        </g>
      )}
    </svg>
  );
}

// ============================================
// ANIMATED HANDSHAKE/PARTNERSHIP ICON
// ============================================

export function AnimatedPartnershipIcon({
  className = "",
  size = 48,
  animate = true,
  color = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.orange,
}: AnimatedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="handshake-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      {/* Left hand */}
      <path
        d="M6 28 L6 20 L14 20 L20 26 L20 32 L14 32 L6 28"
        fill={color}
        opacity="0.8"
      >
        {animate && (
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
        )}
      </path>

      {/* Right hand */}
      <path
        d="M42 28 L42 20 L34 20 L28 26 L28 32 L34 32 L42 28"
        fill={secondaryColor}
        opacity="0.8"
      >
        {animate && (
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
        )}
      </path>

      {/* Clasped hands (center) */}
      <path
        d="M20 26 L24 22 L28 26 L28 32 L24 36 L20 32 Z"
        fill="url(#handshake-grad)"
      />

      {/* Connection sparkles */}
      {animate && (
        <>
          <circle cx="24" cy="20" r="2" fill={BRAND_COLORS.yellow}>
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="20;16;20" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="18" r="1.5" fill={BRAND_COLORS.yellow}>
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="18" r="1.5" fill={BRAND_COLORS.yellow}>
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Pulse ring */}
      {animate && (
        <circle cx="24" cy="28" r="10" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
          <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

// ============================================
// COMBINED EXPORT
// ============================================

export const AnimatedIcons = {
  Globe: AnimatedGlobeIcon,
  Shield: AnimatedShieldIcon,
  Network: AnimatedNetworkIcon,
  Blockchain: AnimatedBlockchainIcon,
  AI: AnimatedAIIcon,
  Rocket: AnimatedRocketIcon,
  Partnership: AnimatedPartnershipIcon,
};

export default AnimatedIcons;
