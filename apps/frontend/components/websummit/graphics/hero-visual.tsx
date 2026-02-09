"use client";

import { useEffect, useRef, useState } from "react";

// ============================================
// TYPES
// ============================================

interface HeroVisualProps {
  className?: string;
  animate?: boolean;
  variant?: "network" | "minimal" | "full";
}

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  pulseDelay: number;
}

interface Connection {
  from: number;
  to: number;
  animated: boolean;
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
// GLOBAL NETWORK CONNECTION GRAPHIC
// ============================================

export function GlobalNetworkGraphic({
  className = "",
  animate = true,
  variant = "full",
}: HeroVisualProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<SVGSVGElement>(null);

  // Define network nodes
  const nodes: Node[] = [
    // Qatar (center/focal point)
    { id: 0, x: 600, y: 300, size: 14, color: BRAND_COLORS.orange, pulseDelay: 0 },
    // Middle East region
    { id: 1, x: 550, y: 280, size: 6, color: BRAND_COLORS.primary, pulseDelay: 0.2 },
    { id: 2, x: 580, y: 340, size: 5, color: BRAND_COLORS.primary, pulseDelay: 0.4 },
    { id: 3, x: 520, y: 320, size: 4, color: BRAND_COLORS.yellow, pulseDelay: 0.6 },
    // Europe
    { id: 4, x: 450, y: 200, size: 8, color: BRAND_COLORS.primary, pulseDelay: 0.3 },
    { id: 5, x: 420, y: 240, size: 6, color: BRAND_COLORS.yellow, pulseDelay: 0.5 },
    { id: 6, x: 480, y: 220, size: 5, color: BRAND_COLORS.orange, pulseDelay: 0.7 },
    // Africa
    { id: 7, x: 480, y: 380, size: 8, color: BRAND_COLORS.orange, pulseDelay: 0.4 },
    { id: 8, x: 450, y: 340, size: 5, color: BRAND_COLORS.primary, pulseDelay: 0.6 },
    { id: 9, x: 430, y: 400, size: 6, color: BRAND_COLORS.yellow, pulseDelay: 0.8 },
    // Asia
    { id: 10, x: 700, y: 280, size: 7, color: BRAND_COLORS.primary, pulseDelay: 0.2 },
    { id: 11, x: 750, y: 320, size: 6, color: BRAND_COLORS.yellow, pulseDelay: 0.4 },
    { id: 12, x: 720, y: 250, size: 5, color: BRAND_COLORS.orange, pulseDelay: 0.6 },
    { id: 13, x: 800, y: 280, size: 5, color: BRAND_COLORS.primary, pulseDelay: 0.8 },
    // Americas (further west)
    { id: 14, x: 200, y: 280, size: 7, color: BRAND_COLORS.orange, pulseDelay: 0.5 },
    { id: 15, x: 250, y: 320, size: 5, color: BRAND_COLORS.primary, pulseDelay: 0.7 },
    { id: 16, x: 180, y: 350, size: 6, color: BRAND_COLORS.yellow, pulseDelay: 0.9 },
    // Oceania
    { id: 17, x: 850, y: 400, size: 5, color: BRAND_COLORS.primary, pulseDelay: 0.6 },
    { id: 18, x: 880, y: 380, size: 4, color: BRAND_COLORS.yellow, pulseDelay: 0.8 },
  ];

  // Define connections (all connecting to/through Qatar node 0)
  const connections: Connection[] = [
    // Direct connections to Qatar
    { from: 0, to: 1, animated: true },
    { from: 0, to: 2, animated: true },
    { from: 0, to: 3, animated: true },
    { from: 0, to: 4, animated: true },
    { from: 0, to: 7, animated: true },
    { from: 0, to: 10, animated: true },
    { from: 0, to: 14, animated: true },
    // Regional connections
    { from: 4, to: 5, animated: false },
    { from: 4, to: 6, animated: false },
    { from: 7, to: 8, animated: false },
    { from: 7, to: 9, animated: false },
    { from: 10, to: 11, animated: false },
    { from: 10, to: 12, animated: false },
    { from: 11, to: 13, animated: false },
    { from: 14, to: 15, animated: false },
    { from: 14, to: 16, animated: false },
    { from: 11, to: 17, animated: false },
    { from: 17, to: 18, animated: false },
    // Cross-regional
    { from: 5, to: 8, animated: true },
    { from: 6, to: 1, animated: true },
    { from: 10, to: 2, animated: true },
  ];

  useEffect(() => {
    if (!animate) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [animate]);

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 1000 600"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="heroNetworkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="heroNetworkGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
          <stop offset="50%" stopColor={BRAND_COLORS.orange} stopOpacity="0.8" />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
        </linearGradient>

        <radialGradient id="qatarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} stopOpacity="0.6" />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0" />
        </radialGradient>

        {/* Filters */}
        <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Background world map silhouette (simplified) */}
      <g opacity="0.05" fill={BRAND_COLORS.primary}>
        {/* Europe */}
        <path d="M380 180 Q 420 160, 480 170 Q 510 180, 500 220 Q 480 250, 420 240 Q 380 230, 380 180" />
        {/* Africa */}
        <path d="M420 280 Q 480 260, 520 300 Q 540 350, 520 420 Q 480 450, 420 430 Q 380 380, 420 280" />
        {/* Middle East / Arabian Peninsula */}
        <path d="M520 280 Q 560 260, 620 280 Q 650 310, 640 360 Q 600 380, 540 360 Q 510 330, 520 280" />
        {/* Asia */}
        <path d="M650 200 Q 750 180, 850 220 Q 880 280, 850 340 Q 780 380, 680 350 Q 640 300, 650 200" />
        {/* Americas */}
        <path d="M150 200 Q 200 180, 280 220 Q 320 280, 300 380 Q 250 420, 180 400 Q 130 350, 150 200" />
        {/* Australia */}
        <path d="M820 380 Q 880 360, 920 400 Q 930 440, 900 470 Q 850 480, 810 450 Q 790 420, 820 380" />
      </g>

      {/* Connection lines layer */}
      <g
        style={{
          transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`,
          transition: "transform 0.5s ease-out",
        }}
      >
        {connections.map((conn, i) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];

          return (
            <g key={i}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={conn.animated ? BRAND_COLORS.orange : BRAND_COLORS.primary}
                strokeWidth={conn.animated ? 1.5 : 0.8}
                opacity={conn.animated ? 0.4 : 0.2}
              >
                {animate && conn.animated && (
                  <animate
                    attributeName="stroke-dasharray"
                    values="0,500;500,0;0,500"
                    dur={`${3 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                )}
              </line>

              {/* Animated data packet along connection */}
              {animate && conn.animated && (
                <circle r="3" fill={BRAND_COLORS.yellow}>
                  <animateMotion
                    dur={`${2 + i * 0.2}s`}
                    repeatCount="indefinite"
                    path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0.5;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </g>

      {/* Qatar focal point glow */}
      <circle
        cx={nodes[0].x}
        cy={nodes[0].y}
        r="60"
        fill="url(#qatarGlow)"
        filter="url(#softGlow)"
      >
        {animate && (
          <animate
            attributeName="r"
            values="50;70;50"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Network nodes */}
      <g
        style={{
          transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
          transition: "transform 0.4s ease-out",
        }}
      >
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Node glow/pulse */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size + 10}
              fill={node.color}
              opacity="0"
              filter="url(#softGlow)"
            >
              {animate && (
                <>
                  <animate
                    attributeName="r"
                    values={`${node.size + 5};${node.size + 15};${node.size + 5}`}
                    dur="2s"
                    begin={`${node.pulseDelay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0;0.3"
                    dur="2s"
                    begin={`${node.pulseDelay}s`}
                    repeatCount="indefinite"
                  />
                </>
              )}
            </circle>

            {/* Main node */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={node.color}
              filter={node.id === 0 ? "url(#heroGlow)" : undefined}
            >
              {animate && (
                <animate
                  attributeName="r"
                  values={`${node.size};${node.size + 2};${node.size}`}
                  dur="2s"
                  begin={`${node.pulseDelay}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>

            {/* Inner highlight */}
            <circle
              cx={node.x - node.size * 0.3}
              cy={node.y - node.size * 0.3}
              r={node.size * 0.3}
              fill="white"
              opacity="0.3"
            />
          </g>
        ))}
      </g>

      {/* Qatar marker/label */}
      {variant === "full" && (
        <g transform={`translate(${nodes[0].x}, ${nodes[0].y})`}>
          {/* Marker pin */}
          <g transform="translate(25, -30)">
            <rect
              x="-40"
              y="0"
              width="80"
              height="28"
              rx="14"
              fill={BRAND_COLORS.secondary}
              opacity="0.9"
            />
            <text
              x="0"
              y="19"
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              DOHA, QATAR
            </text>
          </g>

          {/* Connecting line */}
          <line
            x1="18"
            y1="-5"
            x2="25"
            y2="-15"
            stroke={BRAND_COLORS.orange}
            strokeWidth="2"
            opacity="0.8"
          />
        </g>
      )}

      {/* Decorative circular orbits around Qatar */}
      {variant === "full" && (
        <g opacity="0.15">
          <circle
            cx={nodes[0].x}
            cy={nodes[0].y}
            r="80"
            fill="none"
            stroke={BRAND_COLORS.primary}
            strokeWidth="1"
            strokeDasharray="5,10"
          >
            {animate && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${nodes[0].x} ${nodes[0].y}`}
                to={`360 ${nodes[0].x} ${nodes[0].y}`}
                dur="30s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle
            cx={nodes[0].x}
            cy={nodes[0].y}
            r="120"
            fill="none"
            stroke={BRAND_COLORS.orange}
            strokeWidth="0.5"
            strokeDasharray="3,8"
          >
            {animate && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`360 ${nodes[0].x} ${nodes[0].y}`}
                to={`0 ${nodes[0].x} ${nodes[0].y}`}
                dur="45s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
      )}

      {/* Decorative corner elements */}
      <g opacity="0.1" stroke={BRAND_COLORS.primary} strokeWidth="1" fill="none">
        {/* Top left */}
        <path d="M 50 10 L 10 10 L 10 50" />
        <path d="M 70 10 L 70 30" />

        {/* Top right */}
        <path d="M 950 10 L 990 10 L 990 50" />
        <path d="M 930 10 L 930 30" />

        {/* Bottom left */}
        <path d="M 50 590 L 10 590 L 10 550" />
        <path d="M 70 590 L 70 570" />

        {/* Bottom right */}
        <path d="M 950 590 L 990 590 L 990 550" />
        <path d="M 930 590 L 930 570" />
      </g>
    </svg>
  );
}

// ============================================
// ABSTRACT CONNECTION GRAPHIC
// ============================================

export function AbstractConnectionGraphic({
  className = "",
  animate = true,
}: HeroVisualProps) {
  return (
    <svg
      viewBox="0 0 600 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="connGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={BRAND_COLORS.orange} stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="connGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={BRAND_COLORS.orange} stopOpacity="0.8" />
          <stop offset="100%" stopColor={BRAND_COLORS.yellow} stopOpacity="0.3" />
        </linearGradient>

        <filter id="connGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Central connecting curves */}
      <g fill="none" strokeWidth="2">
        <path
          d="M 100 200 Q 200 100, 300 200 Q 400 300, 500 200"
          stroke="url(#connGrad1)"
        >
          {animate && (
            <animate
              attributeName="d"
              values="M 100 200 Q 200 100, 300 200 Q 400 300, 500 200;
                      M 100 200 Q 200 300, 300 200 Q 400 100, 500 200;
                      M 100 200 Q 200 100, 300 200 Q 400 300, 500 200"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </path>

        <path
          d="M 50 250 Q 150 350, 300 250 Q 450 150, 550 250"
          stroke="url(#connGrad2)"
          opacity="0.6"
        >
          {animate && (
            <animate
              attributeName="d"
              values="M 50 250 Q 150 350, 300 250 Q 450 150, 550 250;
                      M 50 250 Q 150 150, 300 250 Q 450 350, 550 250;
                      M 50 250 Q 150 350, 300 250 Q 450 150, 550 250"
              dur="10s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Intersection nodes */}
      {[
        { cx: 100, cy: 200 },
        { cx: 300, cy: 200 },
        { cx: 500, cy: 200 },
        { cx: 50, cy: 250 },
        { cx: 300, cy: 250 },
        { cx: 550, cy: 250 },
      ].map((node, i) => (
        <g key={i}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r="8"
            fill={i % 2 === 0 ? BRAND_COLORS.orange : BRAND_COLORS.primary}
            filter="url(#connGlow)"
          >
            {animate && (
              <animate
                attributeName="r"
                values="8;10;8"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
          {/* Pulse ring */}
          <circle
            cx={node.cx}
            cy={node.cy}
            r="8"
            fill="none"
            stroke={BRAND_COLORS.yellow}
            strokeWidth="1"
            opacity="0"
          >
            {animate && (
              <>
                <animate
                  attributeName="r"
                  values="8;20;8"
                  dur="2s"
                  begin={`${i * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="2s"
                  begin={`${i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
        </g>
      ))}

      {/* Flowing particles */}
      {animate && (
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} r="4" fill={BRAND_COLORS.yellow} opacity="0.8">
              <animateMotion
                dur={`${4 + i}s`}
                repeatCount="indefinite"
                path="M 100 200 Q 200 100, 300 200 Q 400 300, 500 200"
              />
            </circle>
          ))}
        </g>
      )}
    </svg>
  );
}

// ============================================
// COMBINED EXPORT
// ============================================

export const HeroVisuals = {
  GlobalNetwork: GlobalNetworkGraphic,
  AbstractConnection: AbstractConnectionGraphic,
};

export default HeroVisuals;
