"use client";

import { useEffect, useState, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface BadgeProps {
  className?: string;
  text?: string;
  variant?: "demo" | "workshop" | "meeting" | "live" | "new";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

interface BoothMarkerProps {
  className?: string;
  boothNumber?: string;
  animate?: boolean;
  variant?: "default" | "minimal" | "detailed";
}

interface CountdownProps {
  className?: string;
  targetDate: Date;
  variant?: "default" | "minimal" | "detailed";
  animate?: boolean;
}

// ============================================
// BRAND COLORS
// ============================================

const BRAND_COLORS = {
  primary: "#1E4DB7",
  yellow: "#FFE63B",
  orange: "#F59A23",
  secondary: "#0A1628",
  red: "#E53935",
  green: "#4CAF50",
};

// ============================================
// BADGE CONFIGURATIONS
// ============================================

const BADGE_CONFIGS = {
  demo: {
    bgColor: BRAND_COLORS.orange,
    textColor: "white",
    icon: "play",
    label: "Live Demo",
  },
  workshop: {
    bgColor: BRAND_COLORS.primary,
    textColor: "white",
    icon: "tools",
    label: "Workshop",
  },
  meeting: {
    bgColor: BRAND_COLORS.secondary,
    textColor: "white",
    icon: "calendar",
    label: "Meeting",
  },
  live: {
    bgColor: BRAND_COLORS.red,
    textColor: "white",
    icon: "dot",
    label: "LIVE",
  },
  new: {
    bgColor: BRAND_COLORS.green,
    textColor: "white",
    icon: "star",
    label: "NEW",
  },
};

// ============================================
// EVENT BADGE COMPONENT
// ============================================

export function EventBadge({
  className = "",
  text,
  variant = "demo",
  size = "md",
  animate = true,
}: BadgeProps) {
  const config = BADGE_CONFIGS[variant];
  const displayText = text || config.label;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const renderIcon = () => {
    const s = iconSize[size];
    switch (config.icon) {
      case "play":
        return (
          <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2 L14 8 L4 14 Z" />
          </svg>
        );
      case "tools":
        return (
          <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4 L6 4 L6 2 L10 2 L10 4 L14 4 L14 14 L2 14 Z M4 6 L4 12 L12 12 L12 6 Z" />
          </svg>
        );
      case "calendar":
        return (
          <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3 L14 3 L14 14 L2 14 Z M2 6 L14 6 M5 1 L5 4 M11 1 L11 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        );
      case "dot":
        return (
          <span className="relative flex h-2 w-2">
            {animate && (
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{
                  backgroundColor: "currentColor",
                  animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: "currentColor" }}
            />
          </span>
        );
      case "star":
        return (
          <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1 L10 6 L15 6 L11 9 L13 14 L8 11 L3 14 L5 9 L1 6 L6 6 Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {renderIcon()}
      <span>{displayText}</span>
      {animate && variant === "live" && (
        <style jsx>{`
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}</style>
      )}
    </span>
  );
}

// ============================================
// SVG EVENT BADGE (for graphics)
// ============================================

export function EventBadgeSVG({
  className = "",
  text,
  variant = "demo",
  animate = true,
}: BadgeProps) {
  const config = BADGE_CONFIGS[variant];
  const displayText = text || config.label;

  return (
    <svg
      viewBox="0 0 120 36"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id={`badge-shadow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
        <linearGradient id={`badge-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.bgColor} />
          <stop offset="100%" stopColor={variant === "demo" ? BRAND_COLORS.yellow : config.bgColor} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Badge background */}
      <rect
        x="2"
        y="2"
        width="116"
        height="32"
        rx="16"
        fill={`url(#badge-grad-${variant})`}
        filter={`url(#badge-shadow-${variant})`}
      />

      {/* Icon area */}
      {config.icon === "dot" && (
        <g>
          <circle cx="20" cy="18" r="4" fill="white">
            {animate && (
              <>
                <animate
                  attributeName="r"
                  values="4;6;4"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
          {animate && (
            <circle cx="20" cy="18" r="4" fill="none" stroke="white" strokeWidth="1" opacity="0">
              <animate attributeName="r" values="4;10;4" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      )}

      {config.icon === "play" && (
        <polygon points="16,12 26,18 16,24" fill="white" />
      )}

      {/* Text */}
      <text
        x={config.icon === "dot" || config.icon === "play" ? "36" : "60"}
        y="23"
        textAnchor={config.icon === "dot" || config.icon === "play" ? "start" : "middle"}
        fill="white"
        fontSize="12"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {displayText}
      </text>
    </svg>
  );
}

// ============================================
// BOOTH LOCATION MARKER
// ============================================

export function BoothMarker({
  className = "",
  boothNumber = "A5-35",
  animate = true,
  variant = "default",
}: BoothMarkerProps) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="booth-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} />
          <stop offset="100%" stopColor={BRAND_COLORS.yellow} />
        </linearGradient>
        <filter id="booth-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="booth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background card */}
      <rect
        x="10"
        y="10"
        width="180"
        height="80"
        rx="12"
        fill={BRAND_COLORS.secondary}
        filter="url(#booth-shadow)"
      />

      {/* Gradient accent border */}
      <rect
        x="10"
        y="10"
        width="180"
        height="80"
        rx="12"
        fill="none"
        stroke="url(#booth-grad)"
        strokeWidth="2"
      />

      {/* Location pin icon */}
      <g transform="translate(30, 25)">
        <path
          d="M15 0 C7 0 0 7 0 15 C0 26 15 35 15 35 C15 35 30 26 30 15 C30 7 23 0 15 0 Z"
          fill="url(#booth-grad)"
          filter={animate ? "url(#booth-glow)" : undefined}
        >
          {animate && (
            <animate
              attributeName="transform"
              values="translate(0,0);translate(0,-3);translate(0,0)"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <circle cx="15" cy="13" r="5" fill="white" />
      </g>

      {/* "BOOTH" label */}
      <text
        x="75"
        y="35"
        fill={BRAND_COLORS.orange}
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="2"
      >
        BOOTH
      </text>

      {/* Booth number */}
      <text
        x="75"
        y="65"
        fill="white"
        fontSize="28"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {boothNumber}
      </text>

      {/* Pulse effect around pin */}
      {animate && (
        <circle cx="45" cy="38" r="20" fill="none" stroke={BRAND_COLORS.yellow} strokeWidth="1" opacity="0">
          <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* "Find Us" text for detailed variant */}
      {variant === "detailed" && (
        <text
          x="100"
          y="85"
          textAnchor="middle"
          fill={BRAND_COLORS.orange}
          fontSize="8"
          fontWeight="500"
          fontFamily="system-ui, sans-serif"
          letterSpacing="1"
        >
          WEB SUMMIT QATAR 2026
        </text>
      )}
    </svg>
  );
}

// ============================================
// COUNTDOWN TIMER VISUAL
// ============================================

export function CountdownTimer({
  className = "",
  targetDate,
  variant = "default",
  animate = true,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, [targetDate]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const timeUnits = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HRS" },
    { value: timeLeft.minutes, label: "MIN" },
    { value: timeLeft.seconds, label: "SEC" },
  ];

  return (
    <svg
      viewBox="0 0 400 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="countdown-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} />
          <stop offset="100%" stopColor={BRAND_COLORS.yellow} />
        </linearGradient>
        <filter id="countdown-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect
        x="5"
        y="5"
        width="390"
        height="110"
        rx="16"
        fill={BRAND_COLORS.secondary}
        opacity="0.95"
      />

      {/* Border */}
      <rect
        x="5"
        y="5"
        width="390"
        height="110"
        rx="16"
        fill="none"
        stroke="url(#countdown-grad)"
        strokeWidth="2"
      />

      {/* Title */}
      <text
        x="200"
        y="30"
        textAnchor="middle"
        fill={BRAND_COLORS.orange}
        fontSize="12"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="3"
      >
        COUNTDOWN TO WEB SUMMIT QATAR
      </text>

      {/* Time units */}
      {timeUnits.map((unit, index) => {
        const x = 50 + index * 90;

        return (
          <g key={unit.label} transform={`translate(${x}, 45)`}>
            {/* Unit background */}
            <rect
              x="0"
              y="0"
              width="70"
              height="55"
              rx="8"
              fill={BRAND_COLORS.primary}
              opacity="0.3"
            />

            {/* Value */}
            <text
              x="35"
              y="38"
              textAnchor="middle"
              fill="white"
              fontSize="28"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              filter={animate && unit.label === "SEC" ? "url(#countdown-glow)" : undefined}
            >
              {String(unit.value).padStart(2, "0")}
            </text>

            {/* Label */}
            <text
              x="35"
              y="68"
              textAnchor="middle"
              fill={BRAND_COLORS.orange}
              fontSize="10"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
              letterSpacing="1"
            >
              {unit.label}
            </text>

            {/* Separator colon (except for last item) */}
            {index < timeUnits.length - 1 && (
              <text
                x="80"
                y="35"
                fill={BRAND_COLORS.yellow}
                fontSize="24"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                :
              </text>
            )}
          </g>
        );
      })}

      {/* Pulse animation on seconds */}
      {animate && (
        <rect
          x="320"
          y="45"
          width="70"
          height="55"
          rx="8"
          fill="none"
          stroke={BRAND_COLORS.yellow}
          strokeWidth="1"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      )}
    </svg>
  );
}

// ============================================
// COUNTDOWN TIMER (React Component version)
// ============================================

export function CountdownTimerComponent({
  className = "",
  targetDate,
  animate = true,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, [targetDate]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-4 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`
                relative flex items-center justify-center
                w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                rounded-xl bg-white/10 backdrop-blur-sm
                border border-white/20
                ${animate && unit.label === "Seconds" ? "animate-pulse" : ""}
              `}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <span className="mt-2 text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider">
              {unit.label}
            </span>
          </div>
          {index < timeUnits.length - 1 && (
            <span className="text-2xl sm:text-3xl font-bold text-accent-orange self-start mt-4 sm:mt-5">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// WEBSUMMIT QATAR LOGO BADGE
// ============================================

export function WebSummitQatarBadge({
  className = "",
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ws-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} />
          <stop offset="100%" stopColor={BRAND_COLORS.yellow} />
        </linearGradient>
      </defs>

      {/* Badge background */}
      <rect
        x="2"
        y="2"
        width="196"
        height="56"
        rx="28"
        fill={BRAND_COLORS.secondary}
      />

      {/* Gradient border */}
      <rect
        x="2"
        y="2"
        width="196"
        height="56"
        rx="28"
        fill="none"
        stroke="url(#ws-badge-grad)"
        strokeWidth="2"
      />

      {/* Qatar flag element (maroon and white) */}
      <g transform="translate(15, 15)">
        <rect width="30" height="30" rx="4" fill="#8A1538" />
        <path d="M10 0 L10 30 L0 30 L0 0 Z" fill="white" />
        <path d="M10 0 L15 5 L10 10 L15 15 L10 20 L15 25 L10 30" fill="white" stroke="#8A1538" strokeWidth="0.5" />
      </g>

      {/* Text */}
      <text
        x="55"
        y="28"
        fill={BRAND_COLORS.orange}
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="1"
      >
        WEB SUMMIT
      </text>
      <text
        x="55"
        y="44"
        fill="white"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        QATAR 2026
      </text>

      {/* Live indicator */}
      <g transform="translate(155, 20)">
        <circle cx="10" cy="10" r="6" fill={BRAND_COLORS.red}>
          {animate && (
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        {animate && (
          <circle cx="10" cy="10" r="6" fill="none" stroke={BRAND_COLORS.red} strokeWidth="1" opacity="0">
            <animate attributeName="r" values="6;12;6" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    </svg>
  );
}

// ============================================
// COMBINED EXPORT
// ============================================

export const EventDecorations = {
  Badge: EventBadge,
  BadgeSVG: EventBadgeSVG,
  BoothMarker,
  CountdownTimer,
  CountdownTimerComponent,
  WebSummitQatarBadge,
};

export default EventDecorations;
