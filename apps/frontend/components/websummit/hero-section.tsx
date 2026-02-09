"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@digibit/ui/components";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Calendar,
  MapPin,
  ChevronDown,
  Globe,
  Shield,
  Cpu,
  Blocks,
  Sparkles,
  Zap,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}

interface FloatingShape {
  id: number;
  type: "hexagon" | "circle" | "triangle" | "square";
  size: number;
  x: number;
  y: number;
  rotation: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface TimeUnit {
  value: number;
  label: string;
}

// ============================================
// CONSTANTS
// ============================================

const HEADLINE_WORDS = ["DIGIBIT", "GLOBAL", "SOLUTIONS"];

const STATS_DATA = [
  { value: 10, suffix: "+", labelKey: "years", icon: <Calendar className="w-4 h-4" /> },
  { value: 50, suffix: "+", labelKey: "countries", icon: <Globe className="w-4 h-4" /> },
  { value: 500, suffix: "+", labelKey: "projects", icon: <Blocks className="w-4 h-4" /> },
  { value: 99, suffix: "%", labelKey: "satisfaction", icon: <Shield className="w-4 h-4" /> },
];

const EXPERTISE_TAGS = [
  { labelKey: "ai", icon: <Cpu className="w-3.5 h-3.5" /> },
  { labelKey: "blockchain", icon: <Blocks className="w-3.5 h-3.5" /> },
  { labelKey: "cybersecurity", icon: <Shield className="w-3.5 h-3.5" /> },
  { labelKey: "digitalTransform", icon: <Globe className="w-3.5 h-3.5" /> },
];

const BRAND_COLORS = [
  "rgba(245, 154, 35, 0.3)",   // accent-orange
  "rgba(249, 198, 35, 0.3)",   // secondary-yellow
  "rgba(30, 77, 183, 0.25)",   // primary
  "rgba(20, 58, 143, 0.25)",   // secondary
  "rgba(232, 106, 29, 0.25)",  // accent-red
];

// Target date: Feb 1, 2026
const EVENT_DATE = new Date("2026-02-01T00:00:00");

// ============================================
// HOOKS
// ============================================

function useCountUp(end: number, duration: number = 2000, startCounting: boolean = false): number {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!startCounting) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, startCounting]);

  return count;
}

function useCountdown(targetDate: Date): TimeUnit[] {
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([
    { value: 0, label: "Days" },
    { value: 0, label: "Hours" },
    { value: 0, label: "Minutes" },
    { value: 0, label: "Seconds" },
  ]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft([
          { value: days, label: "Days" },
          { value: hours, label: "Hours" },
          { value: minutes, label: "Minutes" },
          { value: seconds, label: "Seconds" },
        ]);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// ============================================
// SUBCOMPONENTS
// ============================================

// Aurora/Gradient Mesh Background - Light theme
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary aurora layer - softer for white bg */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-aurora-slow"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(245, 154, 35, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(30, 77, 183, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 40% 80%, rgba(249, 198, 35, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 60% 60%, rgba(20, 58, 143, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Secondary aurora layer */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] animate-aurora-medium"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 70% 30%, rgba(232, 106, 29, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 30% 70%, rgba(30, 77, 183, 0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(245, 154, 35, 0.03) 60deg,
              transparent 120deg,
              rgba(30, 77, 183, 0.03) 180deg,
              transparent 240deg,
              rgba(249, 198, 35, 0.03) 300deg,
              transparent 360deg
            )
          `,
          animation: "spin 60s linear infinite",
        }}
      />
    </div>
  );
}

// Floating Geometric Shapes - Light theme
function FloatingShapes() {
  const [shapes] = useState<FloatingShape[]>(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: (["hexagon", "circle", "triangle", "square"] as const)[Math.floor(Math.random() * 4)],
      size: Math.random() * 40 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      duration: Math.random() * 20 + 30,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.2 + 0.1,
    }))
  );

  const renderShape = (shape: FloatingShape) => {
    const baseClasses = "absolute transition-all duration-1000";
    const style = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: shape.size,
      height: shape.size,
      opacity: shape.opacity,
      animation: `float-drift ${shape.duration}s ease-in-out infinite`,
      animationDelay: `${shape.delay}s`,
    };

    switch (shape.type) {
      case "hexagon":
        return (
          <svg
            key={shape.id}
            className={baseClasses}
            style={style}
            viewBox="0 0 100 100"
          >
            <polygon
              points="50,3 95,25 95,75 50,97 5,75 5,25"
              fill="none"
              stroke="rgba(245, 154, 35, 0.2)"
              strokeWidth="1"
            />
          </svg>
        );
      case "circle":
        return (
          <div
            key={shape.id}
            className={`${baseClasses} rounded-full border border-primary/15`}
            style={style}
          />
        );
      case "triangle":
        return (
          <svg
            key={shape.id}
            className={baseClasses}
            style={style}
            viewBox="0 0 100 100"
          >
            <polygon
              points="50,10 90,90 10,90"
              fill="none"
              stroke="rgba(30, 77, 183, 0.15)"
              strokeWidth="1"
            />
          </svg>
        );
      case "square":
        return (
          <div
            key={shape.id}
            className={`${baseClasses} border border-accent-orange/15 rotate-45`}
            style={style}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {shapes.map(renderShape)}
    </div>
  );
}

// Pulsing Grid Pattern - Light theme
function PulsingGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ws-pulse-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="rgba(30, 77, 183, 0.1)"
              strokeWidth="0.5"
              className="animate-grid-pulse"
            />
          </pattern>
          <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(30, 77, 183, 0.05)" stopOpacity="1" />
            <stop offset="50%" stopColor="rgba(30, 77, 183, 0.02)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(30, 77, 183, 0)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#ws-pulse-grid)" style={{ opacity: 0.5 }} />
        <rect width="100%" height="100%" fill="url(#grid-fade)" />
      </svg>
    </div>
  );
}

// Particle Effect
function ParticleEffect() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      duration: Math.random() * 15 + 20,
      delay: Math.random() * -15,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}

// Countdown Timer Component - Light theme
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const timeLeft = useCountdown(targetDate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative w-14 sm:w-16 md:w-20 h-16 sm:h-18 md:h-22 bg-primary/5 rounded-xl border border-primary/10" />
            <span className="text-[10px] sm:text-xs text-neutral-400 mt-2 uppercase tracking-wider">--</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
      {timeLeft.map((unit, index) => (
        <div key={unit.label} className="flex flex-col items-center">
          {/* Flip clock style container */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-orange/20 via-secondary-yellow/20 to-accent-orange/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Main container */}
            <div className="relative w-14 sm:w-16 md:w-20 h-16 sm:h-18 md:h-22 bg-gradient-to-b from-primary to-secondary rounded-xl border border-primary/20 overflow-hidden shadow-lg">
              {/* Top reflection */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

              {/* Center divider line */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
              <div className="absolute inset-x-0 top-1/2 translate-y-px h-px bg-white/10" />

              {/* Number display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums"
                  style={{
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {unit.value.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Animated ring indicator */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${(unit.value / (index === 0 ? 365 : index === 1 ? 24 : 60)) * 283} 283`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>

          {/* Label */}
          <span className="text-[10px] sm:text-xs text-neutral-500 mt-2 uppercase tracking-wider font-medium">
            {unit.label}
          </span>

          {/* Separator dots (except for last item) */}
          {index < timeLeft.length - 1 && (
            <div className="absolute -right-1.5 sm:-right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 sm:opacity-100">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse delay-500" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Event Badge Component - Light theme
function EventBadge({ type }: { type: "live" | "date" | "booth" }) {
  const t = useTranslations("websummit");

  if (type === "live") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent-red/10 to-accent-orange/10 border border-accent-red/30 backdrop-blur-sm animate-pulse-subtle">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-red" />
        </span>
        <span className="text-xs sm:text-sm font-bold text-accent-red uppercase tracking-wider">
          Live Event
        </span>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-sm hover:bg-primary/10 transition-colors duration-300">
        <Calendar className="w-4 h-4 text-accent-orange animate-bounce-subtle" />
        <span className="text-xs sm:text-sm font-semibold text-neutral-700">
          Feb 1-4, 2026
        </span>
      </div>
    );
  }

  if (type === "booth") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 backdrop-blur-sm group hover:from-primary/20 hover:to-secondary/20 transition-all duration-300">
        <MapPin className="w-4 h-4 text-primary group-hover:animate-bounce" />
        <span className="text-xs sm:text-sm font-bold text-primary">
          Booth A5-35
        </span>
        <Sparkles className="w-3.5 h-3.5 text-accent-orange opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return null;
}

// Decorative WebSummit Graphic
function DecorativeGraphic() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 hidden xl:block" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="w-full h-full animate-rotate-slow">
        {/* Outer ring */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
        {/* Middle ring */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="url(#grad2)"
          strokeWidth="1"
        />
        {/* Inner ring */}
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="0.5"
        />
        {/* Hexagon */}
        <polygon
          points="200,40 320,110 320,250 200,320 80,250 80,110"
          fill="none"
          stroke="url(#grad3)"
          strokeWidth="1"
        />
        {/* Inner hexagon */}
        <polygon
          points="200,80 280,130 280,230 200,280 120,230 120,130"
          fill="none"
          stroke="url(#grad2)"
          strokeWidth="0.5"
        />
        {/* Connecting lines */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <line
            key={i}
            x1="200"
            y1="200"
            x2={200 + 180 * Math.cos((angle * Math.PI) / 180)}
            y2={200 + 180 * Math.sin((angle * Math.PI) / 180)}
            stroke="url(#grad1)"
            strokeWidth="0.3"
            strokeDasharray="2 6"
          />
        ))}
        {/* Center dot */}
        <circle cx="200" cy="200" r="4" fill="url(#grad3)" />

        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59A23" />
            <stop offset="100%" stopColor="#F9C623" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E4DB7" />
            <stop offset="100%" stopColor="#143A8F" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59A23" />
            <stop offset="50%" stopColor="#1E4DB7" />
            <stop offset="100%" stopColor="#F9C623" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function AnimatedText({
  text,
  className,
  delay = 0,
  isVisible,
}: {
  text: string;
  className?: string;
  delay?: number;
  isVisible: boolean;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em]">
          <span
            className="inline-block transition-all duration-700 ease-out"
            style={{
              transform: isVisible ? "translateY(0)" : "translateY(100%)",
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${delay + wordIndex * 80}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

function HeadlineWord({
  word,
  index,
  isVisible,
}: {
  word: string;
  index: number;
  isVisible: boolean;
}) {
  return (
    <span className="inline-block overflow-hidden mr-[0.15em]">
      <span
        className="inline-block transition-all duration-1000 ease-out"
        style={{
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(120%) scale(0.9)",
          opacity: isVisible ? 1 : 0,
          transitionDelay: `${600 + index * 150}ms`,
        }}
      >
        {word}
      </span>
    </span>
  );
}

function AnimatedCounter({
  stat,
  delay,
  isVisible,
}: {
  stat: Stat;
  delay: number;
  isVisible: boolean;
}) {
  const [startCounting, setStartCounting] = useState(false);
  const count = useCountUp(stat.value, 2000, startCounting);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setStartCounting(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <div
      className="relative group text-center p-4 sm:p-5 rounded-2xl bg-primary/5 backdrop-blur-sm border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-accent-orange/0 group-hover:bg-accent-orange/10 blur-xl transition-all duration-500 -z-10" />

      <div className="flex items-center justify-center gap-1.5 mb-2 text-accent-orange">
        {stat.icon}
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-1 tabular-nums tracking-tight">
        <span className="inline-block transition-transform duration-300 group-hover:scale-110">
          {count}
          {stat.suffix}
        </span>
      </div>
      <div className="text-xs sm:text-sm text-neutral-500 font-medium">{stat.label}</div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WebSummitHero() {
  const t = useTranslations("websummit");
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Build stats with translated labels
  const STATS: Stat[] = STATS_DATA.map(stat => ({
    ...stat,
    label: t(`hero.stats.${stat.labelKey}`),
  }));

  // GSAP entrance animations
  useGSAP(() => {
    if (!contentRef.current || !isVisible) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animate badges
    tl.fromTo(
      ".hero-badge",
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
      0.2
    );

    // Animate countdown
    tl.fromTo(
      ".countdown-container",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      0.5
    );

    // Animate CTA buttons with glow
    tl.fromTo(
      ".cta-button",
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15 },
      1.2
    );

  }, { scope: contentRef, dependencies: [isVisible] });

  // Initial mount visibility trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Stats section IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const el = statsRef.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Scroll parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse-follow parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x: x * 20, y: y * 20 });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener("mousemove", handleMouseMove);
      return () => hero.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const parallaxOffset = scrollY * 0.3;

  const handleScrollDown = useCallback(() => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full min-h-screen overflow-hidden"
      aria-label="Web Summit Qatar 2026 Hero"
    >
      {/* ===== BACKGROUND LAYERS ===== */}

      {/* Base white background */}
      <div
        className="absolute inset-0 bg-white"
        style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        aria-hidden="true"
      />

      {/* Aurora/Gradient Mesh Background */}
      <AuroraBackground />

      {/* Pulsing Grid Pattern */}
      <PulsingGrid />

      {/* Floating Geometric Shapes */}
      <FloatingShapes />

      {/* Particle Effect */}
      <ParticleEffect />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(30, 77, 183, 0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-accent-orange/[0.05] to-transparent blur-[120px]"
          style={{
            transform: `translate(-50%, ${mousePosition.y * 0.5}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-primary/[0.05] to-transparent blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-secondary-yellow/[0.05] to-transparent blur-[100px]" />
      </div>

      {/* Decorative WebSummit Graphic */}
      <DecorativeGraphic />

      {/* ===== MAIN CONTENT ===== */}
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-32"
        style={{ transform: `translateY(${parallaxOffset * -0.1}px)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Event Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="hero-badge">
              <EventBadge type="live" />
            </div>
            <div className="hero-badge">
              <EventBadge type="date" />
            </div>
            <div className="hero-badge">
              <EventBadge type="booth" />
            </div>
          </div>

          {/* Event badge */}
          <div className="overflow-hidden mb-6">
            <div
              className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent-orange opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-orange" />
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                {t("event.name")}
              </span>
              <span className="hidden sm:inline-block w-px h-4 bg-primary/20" />
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                {t("event.dates")}
                <MapPin className="w-3.5 h-3.5 ml-1" />
                {t("event.location")}
              </span>
            </div>
          </div>

          {/* Main headline with word-by-word reveal */}
          <h1 className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.95] tracking-tight mb-6 text-neutral-900">
            {HEADLINE_WORDS.map((word, index) => (
              <HeadlineWord
                key={word}
                word={word}
                index={index}
                isVisible={isVisible}
              />
            ))}
            {/* Animated gradient overlay on text */}
            <span
              className="absolute inset-0 text-transparent bg-clip-text bg-[length:200%_100%]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--primary), var(--accent-orange), var(--secondary-yellow), var(--accent-orange), var(--primary))",
                animation: isVisible ? "gradientShift 6s linear infinite" : "none",
                opacity: isVisible ? 1 : 0,
                transition: "opacity 1s ease-out 1.2s",
              }}
              aria-hidden="true"
            >
              {HEADLINE_WORDS.join(" ")}
            </span>
            {/* Accessible hidden text for screen readers */}
            <span className="sr-only">Digibit Global Solutions</span>
          </h1>

          {/* Tagline */}
          <div
            className={`mb-6 transition-all duration-700 delay-[900ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-neutral-600 tracking-wide">
              <AnimatedText text={t("hero.tagline")} isVisible={isVisible} delay={1000} />
            </h2>
          </div>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-lg md:text-xl text-neutral-500 leading-relaxed max-w-3xl mx-auto mb-8 transition-all duration-700 delay-[1200ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {t("hero.subtitle")}
          </p>

          {/* Countdown Timer */}
          <div className={`countdown-container mb-10 transition-all duration-700 delay-[1000ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <p className="text-sm text-neutral-400 uppercase tracking-widest mb-4 font-medium">
              Countdown to WebSummit Qatar 2026
            </p>
            <CountdownTimer targetDate={EVENT_DATE} />
          </div>

          {/* Expertise tags */}
          <div
            className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 transition-all duration-700 delay-[1400ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {EXPERTISE_TAGS.map((tag, index) => (
              <span
                key={tag.labelKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs sm:text-sm text-neutral-600 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-300"
                style={{
                  transitionDelay: `${1400 + index * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                {tag.icon}
                {t(`hero.expertise.${tag.labelKey}`)}
              </span>
            ))}
          </div>

          {/* CTA Buttons with Glow Effects */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 transition-all duration-700 delay-[1600ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              asChild
              size="lg"
              className="cta-button group relative bg-gradient-to-r from-accent-orange to-secondary-yellow hover:from-accent-red hover:to-accent-orange text-white rounded-full px-8 sm:px-10 h-12 sm:h-14 text-base font-semibold shadow-lg shadow-accent-orange/25 hover:shadow-xl hover:shadow-accent-orange/40 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <Link href="#solutions">
                {/* Glow effect */}
                <span className="absolute -inset-1 bg-gradient-to-r from-accent-orange via-secondary-yellow to-accent-orange rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 -z-10" />
                <span className="relative z-10 flex items-center gap-2">
                  {t("hero.buttons.explore")}
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </Button>

            <Link
              href="#contact"
              className="cta-button group relative inline-flex items-center justify-center gap-2 border-2 border-primary/30 text-primary hover:bg-primary hover:text-white rounded-full px-8 sm:px-10 h-12 sm:h-14 text-base font-semibold transition-all duration-300 hover:scale-105 hover:border-primary overflow-hidden"
            >
              {/* Subtle glow on hover */}
              <span className="absolute -inset-1 bg-primary/0 group-hover:bg-primary/10 rounded-full blur-lg transition-all duration-500 -z-10" />
              <Calendar className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              {t("hero.buttons.schedule")}
              <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-accent-orange group-hover:text-secondary-yellow" />
            </Link>
          </div>

          {/* Event info bar */}
          <div
            className={`inline-flex items-center gap-4 sm:gap-6 px-6 py-3 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10 mb-16 transition-all duration-700 delay-[1800ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="w-4 h-4 text-accent-orange" />
              <span className="font-medium">{t("event.fullDates")}</span>
            </div>
            <span className="w-px h-4 bg-primary/20" />
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{t("event.location")}</span>
            </div>
          </div>
        </div>

        {/* ===== STATS BAR ===== */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto pt-8 border-t border-primary/10"
        >
          {STATS.map((stat, index) => (
            <AnimatedCounter
              key={stat.label}
              stat={stat}
              delay={index * 150}
              isVisible={statsVisible}
            />
          ))}
        </div>
      </div>

      {/* ===== WHO WE ARE SECTION ===== */}
      <WhoWeAreSection />

      {/* ===== SCROLL INDICATOR ===== */}
      <div
        className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-all duration-700 delay-[2200ms] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        aria-hidden="true"
      >
        <button
          onClick={handleScrollDown}
          className="flex flex-col items-center gap-2 group cursor-pointer"
          aria-label="Scroll down"
        >
          <span className="text-xs text-neutral-400 uppercase tracking-widest font-medium group-hover:text-primary transition-colors">
            Scroll
          </span>
          <div className="relative w-6 h-10 rounded-full border-2 border-primary/20 flex justify-center group-hover:border-primary/40 transition-colors">
            <div
              className="w-1 h-2 bg-primary/60 rounded-full mt-2"
              style={{ animation: "scrollIndicator 2s ease-in-out infinite" }}
            />
          </div>
          <ChevronDown
            className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors"
            style={{ animation: "bounceDown 2s ease-in-out infinite" }}
          />
        </button>
      </div>

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes scrollIndicator {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(12px); opacity: 0.3; }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes aurora-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2%, 2%) rotate(1deg); }
          50% { transform: translate(0, 3%) rotate(0deg); }
          75% { transform: translate(-2%, 1%) rotate(-1deg); }
        }
        @keyframes aurora-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-3%, 2%) rotate(-2deg); }
          66% { transform: translate(2%, -2%) rotate(1deg); }
        }
        @keyframes float-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -15px) rotate(5deg); }
          50% { transform: translate(-5px, 10px) rotate(-3deg); }
          75% { transform: translate(8px, 5px) rotate(2deg); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          25% { transform: translate(20px, -30px); opacity: 0.6; }
          50% { transform: translate(-10px, -50px); opacity: 0.4; }
          75% { transform: translate(15px, -20px); opacity: 0.5; }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-aurora-slow {
          animation: aurora-slow 30s ease-in-out infinite;
        }
        .animate-aurora-medium {
          animation: aurora-medium 25s ease-in-out infinite;
        }
        .animate-grid-pulse {
          animation: grid-pulse 4s ease-in-out infinite;
        }
        .animate-particle-float {
          animation: particle-float 20s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

// ============================================
// WHO WE ARE SECTION
// ============================================

function WhoWeAreSection() {
  const t = useTranslations("websummit");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const pillars = [
    {
      icon: <Cpu className="w-6 h-6" />,
      titleKey: "ai",
      color: "from-primary/20 to-secondary/10",
      borderColor: "group-hover:border-primary/30",
      iconColor: "text-primary",
    },
    {
      icon: <Blocks className="w-6 h-6" />,
      titleKey: "blockchain",
      color: "from-secondary/20 to-primary/10",
      borderColor: "group-hover:border-secondary/30",
      iconColor: "text-secondary",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      titleKey: "cybersecurity",
      color: "from-accent-orange/20 to-secondary-yellow/10",
      borderColor: "group-hover:border-accent-orange/30",
      iconColor: "text-accent-orange",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      titleKey: "governance",
      color: "from-accent-red/20 to-accent-orange/10",
      borderColor: "group-hover:border-accent-red/30",
      iconColor: "text-accent-red",
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-32"
    >
      {/* Section header */}
      <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
        <div
          className="transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-xs sm:text-sm font-medium tracking-wider text-accent-orange uppercase">
            {t("section.whoweare")}
          </span>
        </div>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-6 transition-all duration-700 delay-150"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <AnimatedText
            text={t("section.heading1")}
            isVisible={isVisible}
            delay={200}
          />
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange via-secondary-yellow to-accent-orange">
            <AnimatedText
              text={t("section.heading2")}
              isVisible={isVisible}
              delay={400}
            />
          </span>
        </h2>

        <p
          className="text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {t("hero.subtitle")}
        </p>
      </div>

      {/* Pillar cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {pillars.map((pillar, index) => (
          <div
            key={pillar.titleKey}
            className={`group relative p-6 sm:p-8 rounded-2xl bg-white backdrop-blur-sm border border-neutral-200 ${pillar.borderColor} hover:bg-neutral-50 hover:shadow-lg transition-all duration-500 hover:-translate-y-1`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: `${500 + index * 150}ms`,
              transitionDuration: "700ms",
              transitionProperty: "opacity, transform",
            }}
          >
            {/* Card glow */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10 blur-xl`}
            />

            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 ${pillar.iconColor} mb-5 group-hover:scale-110 transition-transform duration-300`}
            >
              {pillar.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-3">
              {t(`pillars.${pillar.titleKey}.title`)}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-600 transition-colors duration-300">
              {t(`pillars.${pillar.titleKey}.description`)}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent group-hover:via-primary/30 transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebSummitHero;
