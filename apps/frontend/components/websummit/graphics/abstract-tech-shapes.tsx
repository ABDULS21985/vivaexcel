"use client";

import { useEffect, useRef, useState } from "react";

// ============================================
// TYPES
// ============================================

interface AbstractTechShapesProps {
  className?: string;
  animate?: boolean;
  variant?: "default" | "minimal" | "dense";
  colorScheme?: "brand" | "monochrome" | "warm";
}

// ============================================
// CONSTANTS - Brand Colors
// ============================================

const BRAND_COLORS = {
  primary: "#1E4DB7",
  yellow: "#FFE63B",
  orange: "#F59A23",
  secondary: "#0A1628",
};

// ============================================
// ABSTRACT TECH SHAPES COMPONENT
// ============================================

export function AbstractTechShapes({
  className = "",
  animate = true,
  variant = "default",
  colorScheme = "brand",
}: AbstractTechShapesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!animate) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [animate]);

  const getColors = () => {
    switch (colorScheme) {
      case "monochrome":
        return {
          primary: "rgba(255,255,255,0.3)",
          secondary: "rgba(255,255,255,0.15)",
          accent: "rgba(255,255,255,0.08)",
        };
      case "warm":
        return {
          primary: BRAND_COLORS.orange,
          secondary: BRAND_COLORS.yellow,
          accent: BRAND_COLORS.primary,
        };
      default:
        return {
          primary: BRAND_COLORS.primary,
          secondary: BRAND_COLORS.orange,
          accent: BRAND_COLORS.yellow,
        };
    }
  };

  const colors = getColors();
  const shapeCount = variant === "minimal" ? 3 : variant === "dense" ? 8 : 5;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 600"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="techGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="techGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.6" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="techGradient3" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.7" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.2" />
        </linearGradient>

        {/* Filters */}
        <filter id="techGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softBlur">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        {/* Clip paths for complex shapes */}
        <clipPath id="hexClip">
          <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" />
        </clipPath>
      </defs>

      {/* Background grid lines */}
      <g opacity="0.1" stroke={colors.primary} strokeWidth="0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 50}
            x2="800"
            y2={i * 50}
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="600"
          />
        ))}
      </g>

      {/* Floating hexagons */}
      <g
        style={{
          transform: animate
            ? `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
            : undefined,
          transition: "transform 0.3s ease-out",
        }}
      >
        <polygon
          points="150,80 200,105 200,155 150,180 100,155 100,105"
          fill="url(#techGradient1)"
          filter="url(#techGlow)"
          opacity="0.6"
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 150 130"
              to="360 150 130"
              dur="30s"
              repeatCount="indefinite"
            />
          )}
        </polygon>
      </g>

      {/* Connecting circuit lines */}
      <g stroke={colors.primary} strokeWidth="1.5" fill="none" opacity="0.4">
        <path d="M 150 130 Q 300 50, 450 150">
          {animate && (
            <animate
              attributeName="stroke-dasharray"
              values="0,500;500,0"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path d="M 450 150 L 550 150 L 550 300 L 650 300">
          {animate && (
            <animate
              attributeName="stroke-dasharray"
              values="0,400;400,0"
              dur="2.5s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path d="M 150 130 L 150 280 Q 200 350, 350 350">
          {animate && (
            <animate
              attributeName="stroke-dasharray"
              values="0,450;450,0"
              dur="3.5s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Data nodes / circles */}
      <g>
        {[
          { cx: 150, cy: 130, r: 8, delay: 0 },
          { cx: 450, cy: 150, r: 10, delay: 0.5 },
          { cx: 650, cy: 300, r: 12, delay: 1 },
          { cx: 350, cy: 350, r: 8, delay: 1.5 },
          { cx: 550, cy: 150, r: 6, delay: 0.8 },
        ]
          .slice(0, shapeCount)
          .map((node, i) => (
            <g key={i}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill={colors.secondary}
                opacity="0.8"
              >
                {animate && (
                  <animate
                    attributeName="r"
                    values={`${node.r};${node.r + 3};${node.r}`}
                    dur="2s"
                    begin={`${node.delay}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 15}
                fill="none"
                stroke={colors.secondary}
                strokeWidth="1"
                opacity="0.3"
              >
                {animate && (
                  <animate
                    attributeName="r"
                    values={`${node.r + 5};${node.r + 20};${node.r + 5}`}
                    dur="2s"
                    begin={`${node.delay}s`}
                    repeatCount="indefinite"
                  />
                )}
                {animate && (
                  <animate
                    attributeName="opacity"
                    values="0.3;0;0.3"
                    dur="2s"
                    begin={`${node.delay}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            </g>
          ))}
      </g>

      {/* Abstract triangular shapes */}
      <g
        style={{
          transform: animate
            ? `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`
            : undefined,
          transition: "transform 0.4s ease-out",
        }}
      >
        <polygon
          points="600,80 680,180 520,180"
          fill="url(#techGradient2)"
          opacity="0.5"
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 600 140"
              to="-360 600 140"
              dur="25s"
              repeatCount="indefinite"
            />
          )}
        </polygon>
      </g>

      {/* Floating rectangles with rounded corners */}
      <g
        style={{
          transform: animate
            ? `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`
            : undefined,
          transition: "transform 0.35s ease-out",
        }}
      >
        <rect
          x="300"
          y="400"
          width="120"
          height="80"
          rx="12"
          fill="url(#techGradient3)"
          opacity="0.4"
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;10,-10;0,0"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </rect>
      </g>

      {/* Diamond shapes */}
      <g>
        <polygon
          points="700,400 750,450 700,500 650,450"
          fill="url(#techGradient1)"
          opacity="0.35"
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.1;1"
              dur="3s"
              repeatCount="indefinite"
              additive="sum"
            />
          )}
        </polygon>
      </g>

      {/* Decorative arcs */}
      <g stroke={colors.accent} strokeWidth="2" fill="none" opacity="0.3">
        <path d="M 50 450 A 100 100 0 0 1 150 350">
          {animate && (
            <animate
              attributeName="stroke-dasharray"
              values="0,200;200,0;0,200"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path d="M 680 520 A 80 80 0 0 0 760 440">
          {animate && (
            <animate
              attributeName="stroke-dasharray"
              values="0,160;160,0;0,160"
              dur="3.5s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Dot pattern overlay */}
      <g fill={colors.primary} opacity="0.1">
        {Array.from({ length: variant === "dense" ? 100 : 50 }).map((_, i) => (
          <circle
            key={i}
            cx={(i % 10) * 80 + 40}
            cy={Math.floor(i / 10) * 60 + 30}
            r="2"
          />
        ))}
      </g>
    </svg>
  );
}

export default AbstractTechShapes;
