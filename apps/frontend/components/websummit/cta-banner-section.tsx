"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, FileText } from "lucide-react";

// ============================================
// TYPES
// ============================================

interface FloatingShape {
  id: number;
  size: string;
  position: string;
  color: string;
  animationDelay: string;
  animationDuration: string;
  shape: "circle" | "diamond" | "ring";
}

// ============================================
// CONSTANTS
// ============================================

const FLOATING_SHAPES: FloatingShape[] = [
  {
    id: 1,
    size: "w-20 h-20",
    position: "top-12 left-[10%]",
    color: "bg-accent-orange/20",
    animationDelay: "0ms",
    animationDuration: "6s",
    shape: "circle",
  },
  {
    id: 2,
    size: "w-14 h-14",
    position: "top-1/3 right-[8%]",
    color: "bg-secondary-yellow/20",
    animationDelay: "1500ms",
    animationDuration: "7s",
    shape: "diamond",
  },
  {
    id: 3,
    size: "w-10 h-10",
    position: "bottom-16 left-[20%]",
    color: "bg-accent-yellow/20",
    animationDelay: "3000ms",
    animationDuration: "5s",
    shape: "ring",
  },
  {
    id: 4,
    size: "w-16 h-16",
    position: "bottom-1/4 right-[15%]",
    color: "bg-accent-orange/15",
    animationDelay: "2000ms",
    animationDuration: "8s",
    shape: "circle",
  },
  {
    id: 5,
    size: "w-8 h-8",
    position: "top-1/4 left-[40%]",
    color: "bg-secondary-yellow/15",
    animationDelay: "4000ms",
    animationDuration: "6s",
    shape: "diamond",
  },
  {
    id: 6,
    size: "w-12 h-12",
    position: "top-2/3 right-[30%]",
    color: "bg-accent-red/15",
    animationDelay: "500ms",
    animationDuration: "7s",
    shape: "ring",
  },
];

// ============================================
// SUBCOMPONENTS
// ============================================

function FloatingShapeElement({ shape }: { shape: FloatingShape }) {
  const baseClasses = `absolute ${shape.position} ${shape.size} pointer-events-none`;
  const motionClasses = "motion-safe:animate-bounce motion-reduce:animate-none";

  if (shape.shape === "diamond") {
    return (
      <div
        className={`${baseClasses} ${motionClasses} rotate-45 rounded-md ${shape.color} blur-sm`}
        style={{
          animationDelay: shape.animationDelay,
          animationDuration: shape.animationDuration,
        }}
        aria-hidden="true"
      />
    );
  }

  if (shape.shape === "ring") {
    return (
      <div
        className={`${baseClasses} ${motionClasses} rounded-full border-2 border-accent-orange/20`}
        style={{
          animationDelay: shape.animationDelay,
          animationDuration: shape.animationDuration,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`${baseClasses} ${motionClasses} rounded-full ${shape.color} blur-sm`}
      style={{
        animationDelay: shape.animationDelay,
        animationDuration: shape.animationDuration,
      }}
      aria-hidden="true"
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WebSummitCTABanner() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="cta-banner"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      aria-label="Call to action"
    >
      {/* ===== BACKGROUND ===== */}

      {/* Dark gradient base */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-secondary"
        aria-hidden="true"
      />

      {/* Grid pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="cta-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-grid-pattern)" />
      </svg>

      {/* Accent glow lines - top */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-orange/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-orange/30 to-transparent blur-sm"
        aria-hidden="true"
      />

      {/* Accent glow lines - bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-orange/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-orange/30 to-transparent blur-sm"
        aria-hidden="true"
      />

      {/* Floating accent shapes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {FLOATING_SHAPES.map((shape) => (
          <FloatingShapeElement key={shape.id} shape={shape} />
        ))}

        {/* Large ambient glow - left */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-accent-orange/10 to-transparent rounded-full blur-[100px]" />

        {/* Large ambient glow - right */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-l from-secondary-yellow/10 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          Ready to Transform Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange via-secondary-yellow to-accent-orange">
            Digital Future?
          </span>
        </h2>

        {/* Subtitle */}
        <p
          className={`text-base sm:text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          Book a private demo, request our investor deck, or schedule a meeting
          with our leadership team at Web Summit Qatar 2026.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-400 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          {/* Primary CTA */}
          <Link
            href="#contact"
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-orange to-secondary-yellow hover:from-accent-red hover:to-accent-orange text-white rounded-full px-8 h-14 text-base font-semibold shadow-lg shadow-accent-orange/25 hover:shadow-xl hover:shadow-accent-orange/40 transition-all duration-300 hover:scale-105 overflow-hidden w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book a Meeting
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            {/* Shimmer effect */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              aria-hidden="true"
            />
          </Link>

          {/* Outline white CTA */}
          <Link
            href="#contact"
            className="group inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white hover:text-secondary rounded-full px-8 h-14 text-base font-semibold transition-all duration-300 hover:scale-105 hover:border-white w-full sm:w-auto"
          >
            <FileText className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            Request Investor Deck
          </Link>

          {/* Outline CTA */}
          <Link
            href="#solutions"
            className="group inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white/80 hover:border-accent-orange/50 hover:text-white rounded-full px-8 h-14 text-base font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            Explore Solutions
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WebSummitCTABanner;
