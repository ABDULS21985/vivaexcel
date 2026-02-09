"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Shield,
  Network,
  Fingerprint,
  MapPin,
  Users,
  ArrowRight,
  Zap,
  Brain,
  Cloud,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface ProductMetric {
  value: string;
  numericValue?: number;
  label: string;
}

interface Product {
  name: string;
  color: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  metrics: ProductMetric[];
  useCases: string[];
  featured?: boolean;
  relationship?: number[]; // Indices of related products
}

// ============================================
// PRODUCTS DATA
// ============================================

const PRODUCTS: Product[] = [
  {
    name: "TrustMeHub",
    color: "var(--accent-orange)",
    icon: Shield,
    tagline: "Building Trust. Empowering Growth.",
    description:
      "Global digital trust infrastructure for instant blockchain-anchored credential verification.",
    metrics: [
      { value: "<10ms", label: "Verification Speed" },
      { value: "99%", numericValue: 99, label: "Cost Reduction" },
      { value: "100K+", numericValue: 100, label: "Verifications/sec" },
      { value: "98%", numericValue: 98, label: "Fraud Elimination" },
    ],
    useCases: ["Education", "Banking KYC", "Healthcare", "Government ID", "Land Registry"],
    featured: true,
    relationship: [2, 3],
  },
  {
    name: "DigiGate",
    color: "var(--primary)",
    icon: Network,
    tagline: "The Command Center for Your Digital Ecosystem",
    description:
      "Comprehensive API gateway and lifecycle management solution for enterprise-grade integrations.",
    metrics: [
      { value: "95%", numericValue: 95, label: "Security Incident Reduction" },
      { value: "Days", label: "Integration Time" },
      { value: "99.99%", numericValue: 99, label: "Uptime Guarantee" },
    ],
    useCases: ["Financial Institutions", "Government", "Enterprise Microservices"],
    relationship: [6, 7],
  },
  {
    name: "DigiTrust",
    color: "var(--secondary-yellow)",
    icon: Fingerprint,
    tagline: "Immutable Trust for a Digital World",
    description:
      "Blockchain-based tamper-proof digital credentials ensuring authenticity at every layer.",
    metrics: [
      { value: "100%", numericValue: 100, label: "Fraud Elimination" },
      { value: "Seconds", label: "Verification Time" },
      { value: "GDPR", label: "Fully Compliant" },
    ],
    useCases: ["Education", "Government Registries", "Insurance", "Professional Bodies"],
    featured: true,
    relationship: [0, 3],
  },
  {
    name: "DigiTrack",
    color: "var(--accent-red)",
    icon: MapPin,
    tagline: "Complete Visibility Across Your Digital Operations",
    description:
      "Real-time tracking and traceability platform for assets, workflows, and supply chains.",
    metrics: [
      { value: "100%", numericValue: 100, label: "Asset Visibility" },
      { value: "40%", numericValue: 40, label: "Loss Reduction" },
      { value: "60%", numericValue: 60, label: "Downtime Reduction" },
    ],
    useCases: ["Supply Chain", "Financial Services", "Healthcare", "Energy"],
    relationship: [0, 2],
  },
  {
    name: "BoaCRM",
    color: "var(--secondary)",
    icon: Users,
    tagline: "The Operating System for Customer Relationships",
    description:
      "Enterprise CRM purpose-built for African financial institutions with 35 integrated modules.",
    metrics: [
      { value: "35", numericValue: 35, label: "Integrated Modules" },
      { value: "3-5x", label: "More Affordable" },
      { value: "2M+", numericValue: 2, label: "Customers Managed" },
    ],
    useCases: ["Commercial Banks", "Microfinance", "Payment Providers"],
    featured: true,
    relationship: [5],
  },
  {
    name: "AI & Data Advisory",
    color: "var(--secondary-yellow)",
    icon: Brain,
    tagline: "Responsible AI, Measurable Outcomes",
    description:
      "End-to-end AI strategy, data governance aligned to ISO 42001, and production-grade MLOps pipelines for enterprise-scale intelligence.",
    metrics: [
      { value: "ISO 42001", label: "AI Governance" },
      { value: "10x", numericValue: 10, label: "Faster Insights" },
      { value: "50+", numericValue: 50, label: "Models Deployed" },
    ],
    useCases: ["AI Strategy", "Data Governance", "ML/AI Solutions", "MLOps"],
    relationship: [4, 7],
  },
  {
    name: "Cybersecurity Services",
    color: "var(--accent-red)",
    icon: Shield,
    tagline: "Zero Trust. Total Resilience.",
    description:
      "Comprehensive security spanning zero-trust architecture, 24/7 SOC operations, threat hunting, and rapid incident response.",
    metrics: [
      { value: "24/7", label: "SOC Operations" },
      { value: "Zero Trust", label: "Architecture" },
      { value: "95%", numericValue: 95, label: "Threat Reduction" },
    ],
    useCases: ["Security Strategy", "SOC", "Incident Response", "Pen Testing"],
    relationship: [1, 7],
  },
  {
    name: "Cloud & Platform",
    color: "var(--primary)",
    icon: Cloud,
    tagline: "Cloud-Native. Cost-Optimized. Scalable.",
    description:
      "Cloud strategy, migration, platform engineering, and FinOps discipline to optimize performance and developer productivity.",
    metrics: [
      { value: "40%", numericValue: 40, label: "Cost Savings" },
      { value: "99.99%", numericValue: 99, label: "Availability" },
      { value: "3x", numericValue: 3, label: "Faster Deployments" },
    ],
    useCases: ["Cloud Migration", "Platform Engineering", "FinOps", "DevOps"],
    relationship: [1, 5, 6],
  },
];

// Animation directions for staggered entry
const ANIMATION_DIRECTIONS = [
  { x: -60, y: -30 },  // top-left
  { x: 0, y: -50 },    // top
  { x: 60, y: -30 },   // top-right
  { x: 60, y: 0 },     // right
  { x: 60, y: 30 },    // bottom-right
  { x: 0, y: 50 },     // bottom
  { x: -60, y: 30 },   // bottom-left
  { x: -60, y: 0 },    // left
];

// Parallax depths for cards
const PARALLAX_DEPTHS = [0.15, 0.25, 0.1, 0.2, 0.3, 0.12, 0.22, 0.18];

// ============================================
// HOOKS
// ============================================

function useIntersectionObserver(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function useMousePosition(containerRef: React.RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, [containerRef]);

  return position;
}

function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

function useCountUp(
  end: number,
  duration: number = 2000,
  startCounting: boolean = false
): number {
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

// ============================================
// SUB-COMPONENTS
// ============================================

function SectionHeader({ isVisible, t }: { isVisible: boolean; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="text-center mb-16 lg:mb-20">
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/10
          bg-primary/5 mb-6 transition-all duration-700
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <Zap className="w-4 h-4 text-secondary-yellow" />
        <span className="text-sm font-semibold tracking-widest text-primary uppercase">
          {t("products.badge")}
        </span>
      </div>

      <h2
        className={`text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6
          transition-all duration-700 delay-150
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {t("products.title")}
      </h2>

      <p
        className={`text-lg md:text-xl text-neutral-gray max-w-2xl mx-auto leading-relaxed
          transition-all duration-700 delay-300
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {t("products.subtitle")}
      </p>
    </div>
  );
}

function AnimatedMetric({
  metric,
  color,
  isVisible,
  delay,
}: {
  metric: ProductMetric;
  color: string;
  isVisible: boolean;
  delay: number;
}) {
  const [startCounting, setStartCounting] = useState(false);
  const count = useCountUp(metric.numericValue || 0, 1500, startCounting);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setStartCounting(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  const displayValue = metric.numericValue
    ? `${count}${metric.value.replace(/\d+/g, "")}`
    : metric.value;

  return (
    <div className="text-center">
      <div
        className="text-lg font-bold tabular-nums transition-transform duration-300 hover:scale-110"
        style={{ color }}
      >
        {displayValue}
      </div>
      <div className="text-xs text-neutral-gray mt-0.5 leading-tight">{metric.label}</div>
    </div>
  );
}

function UseCaseChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: `${color}10`,
        color: color,
        borderColor: `${color}15`,
      }}
    >
      {label}
    </span>
  );
}

function FeaturedBadge({ color }: { color: string }) {
  return (
    <div
      className="absolute -top-3 -right-3 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: "white",
      }}
    >
      <Star className="w-3 h-3 fill-current" />
      <span>Featured</span>
      {/* Animated pulse ring */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-30"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function AnimatedIcon({ Icon, color, isFlipped }: { Icon: LucideIcon; color: string; isFlipped: boolean }) {
  return (
    <div
      className="relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
        transition-all duration-500 group-hover:scale-110 overflow-hidden"
      style={{ backgroundColor: `${color}15` }}
    >
      {/* Animated background pulse */}
      <div
        className={`absolute inset-0 rounded-xl transition-transform duration-1000 ${
          isFlipped ? "scale-150 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          background: `radial-gradient(circle at center, ${color}30, transparent 70%)`,
        }}
      />

      {/* Rotating accent ring */}
      <div
        className="absolute inset-1 rounded-lg border border-dashed opacity-30"
        style={{
          borderColor: color,
          animation: "spin 8s linear infinite",
        }}
      />

      <Icon
        className={`relative z-10 w-6 h-6 transition-all duration-500 ${
          isFlipped ? "scale-110 rotate-12" : "scale-100 rotate-0"
        }`}
        style={{ color }}
      />
    </div>
  );
}

// Card Back Content (shown on flip)
function CardBack({
  product,
  onFlip,
}: {
  product: Product;
  onFlip: () => void;
}) {
  return (
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary via-primary to-secondary p-6 lg:p-7 flex flex-col backface-hidden rotate-y-180">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-white">{product.name}</h4>
        <button
          onClick={onFlip}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-white rotate-180" />
        </button>
      </div>

      {/* Key metrics with larger display */}
      <div className="space-y-4 flex-grow">
        {product.metrics.slice(0, 3).map((metric, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/10"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-sm text-white/60">{metric.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <span>Click to flip back</span>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  index,
  isVisible,
  mousePosition,
  containerRect,
  scrollY,
  sectionTop,
}: {
  product: Product;
  index: number;
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  containerRect: DOMRect | null;
  scrollY: number;
  sectionTop: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardMetricsVisible, setCardMetricsVisible] = useState(false);

  const animDir = ANIMATION_DIRECTIONS[index % ANIMATION_DIRECTIONS.length];
  const parallaxDepth = PARALLAX_DEPTHS[index % PARALLAX_DEPTHS.length];

  // Calculate parallax offset based on scroll
  const parallaxOffset = useMemo(() => {
    const relativeScroll = scrollY - sectionTop + 400;
    return relativeScroll * parallaxDepth;
  }, [scrollY, sectionTop, parallaxDepth]);

  // Calculate scale based on scroll position
  const scaleOnScroll = useMemo(() => {
    const relativeScroll = scrollY - sectionTop;
    const normalizedScroll = Math.max(0, Math.min(relativeScroll / 600, 1));
    return 0.9 + normalizedScroll * 0.1;
  }, [scrollY, sectionTop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;

    setTilt({ x: rotateX, y: rotateY });
  }, [isFlipped]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Trigger metric count when card becomes visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setCardMetricsVisible(true), index * 100 + 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, index]);

  const Icon = product.icon;

  // Calculate spotlight distance for glow effect
  const spotlightIntensity = useMemo(() => {
    if (!containerRect || !cardRef.current) return 0;
    const cardRect = cardRef.current.getBoundingClientRect();
    const cardCenterX = cardRect.left - containerRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top - containerRect.top + cardRect.height / 2;
    const distance = Math.hypot(mousePosition.x - cardCenterX, mousePosition.y - cardCenterY);
    return Math.max(0, 1 - distance / 400);
  }, [mousePosition, containerRect]);

  return (
    <div
      className={`transition-all duration-700
        ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        transitionDelay: `${index * 120}ms`,
        transform: isVisible
          ? `translateY(${parallaxOffset}px) scale(${scaleOnScroll})`
          : `translate(${animDir.x}px, ${animDir.y}px) scale(0.8)`,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="group relative h-full cursor-pointer"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Featured badge */}
        {product.featured && <FeaturedBadge color={product.color} />}

        {/* Cursor spotlight glow */}
        <div
          className="absolute -inset-4 rounded-3xl pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${product.color}20, transparent 70%)`,
            opacity: spotlightIntensity * 0.8,
          }}
        />

        {/* Animated gradient border */}
        <div
          className={`absolute -inset-px rounded-2xl transition-opacity duration-500
            ${isHovered ? "opacity-100" : "opacity-0"}`}
          style={{
            background: `linear-gradient(135deg, ${product.color}40, transparent 40%, transparent 60%, ${product.color}40)`,
            backgroundSize: "200% 200%",
            animation: isHovered ? "gradient-shift 3s ease infinite" : "none",
          }}
        />

        {/* Glowing edge effect */}
        <div
          className="absolute -inset-[1px] rounded-2xl transition-all duration-500"
          style={{
            boxShadow: isHovered
              ? `0 0 20px ${product.color}30, inset 0 0 20px ${product.color}10`
              : "none",
          }}
        />

        {/* Card flip container */}
        <div
          className="relative h-full transition-transform duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${isFlipped ? 0 : tilt.x}deg) rotateY(${isFlipped ? 180 : tilt.y}deg)`,
          }}
        >
          {/* Card Front */}
          <div
            className="relative h-full rounded-2xl bg-white shadow-lg border border-neutral-light
              overflow-hidden transition-all duration-300 ease-out backface-hidden
              hover:shadow-xl hover:shadow-primary/10"
          >
            {/* Top accent border with animation */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden"
              style={{
                background: `linear-gradient(90deg, transparent, ${product.color}, transparent)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent, white, transparent)`,
                  backgroundSize: "200% 100%",
                  animation: isHovered ? "shine-sweep 2s ease-in-out infinite" : "none",
                }}
              />
            </div>

            {/* Shine sweep overlay */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 pointer-events-none
                ${isHovered ? "opacity-100" : "opacity-0"}`}
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: isHovered ? "shine-sweep 1.5s ease-in-out infinite" : "none",
              }}
            />

            <div className="relative p-6 lg:p-7 flex flex-col h-full min-h-[380px]">
              {/* Icon + Name */}
              <div className="flex items-start gap-4 mb-4">
                <AnimatedIcon Icon={Icon} color={product.color} isFlipped={isFlipped} />
                <div>
                  <h3 className="text-xl font-bold text-secondary">{product.name}</h3>
                  <p className="text-sm mt-0.5" style={{ color: product.color }}>
                    {product.tagline}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-gray leading-relaxed mb-5 flex-grow-0">
                {product.description}
              </p>

              {/* Animated Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-5 py-4 border-y border-neutral-light">
                {product.metrics.slice(0, 4).map((metric, i) => (
                  <AnimatedMetric
                    key={i}
                    metric={metric}
                    color={product.color}
                    isVisible={cardMetricsVisible}
                    delay={i * 150}
                  />
                ))}
              </div>

              {/* Use cases */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {product.useCases.slice(0, 3).map((useCase) => (
                  <UseCaseChip key={useCase} label={useCase} color={product.color} />
                ))}
                {product.useCases.length > 3 && (
                  <span className="text-xs text-neutral-gray self-center">
                    +{product.useCases.length - 3} more
                  </span>
                )}
              </div>

              {/* Learn more / flip hint */}
              <div
                className={`flex items-center justify-between mt-4 text-sm font-medium transition-all duration-300
                  ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                style={{ color: product.color }}
              >
                <span>Click to see metrics</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card Back */}
          <CardBack product={product} onFlip={() => setIsFlipped(false)} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONNECTING LINES BETWEEN PRODUCTS
// ============================================

function ConnectingLines({
  products,
  isVisible,
  containerRef,
}: {
  products: Product[];
  isVisible: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const updateLines = () => {
      const container = containerRef.current;
      if (!container) return;

      const cards = container.querySelectorAll("[data-product-card]");
      const newLines: typeof lines = [];

      products.forEach((product, index) => {
        if (!product.relationship) return;

        const sourceCard = cards[index] as HTMLElement;
        if (!sourceCard) return;

        product.relationship.forEach((targetIndex) => {
          const targetCard = cards[targetIndex] as HTMLElement;
          if (!targetCard) return;

          const sourceRect = sourceCard.getBoundingClientRect();
          const targetRect = targetCard.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          newLines.push({
            x1: sourceRect.left - containerRect.left + sourceRect.width / 2,
            y1: sourceRect.top - containerRect.top + sourceRect.height / 2,
            x2: targetRect.left - containerRect.left + targetRect.width / 2,
            y2: targetRect.top - containerRect.top + targetRect.height / 2,
            color: product.color,
          });
        });
      });

      setLines(newLines);
    };

    // Initial calculation after cards render
    const timer = setTimeout(updateLines, 1000);
    window.addEventListener("resize", updateLines);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateLines);
    };
  }, [isVisible, products, containerRef]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0 hidden lg:block"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        {lines.map((_, i) => (
          <linearGradient key={i} id={`line-gradient-${i}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        ))}
      </defs>
      {lines.map((line, i) => (
        <g key={i} style={{ color: line.color }}>
          {/* Animated line */}
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`url(#line-gradient-${i})`}
            strokeWidth="2"
            strokeDasharray="8 4"
            strokeLinecap="round"
            className="opacity-30"
            style={{
              animation: `dash-animation 20s linear infinite`,
            }}
          />
          {/* Glowing nodes at endpoints */}
          <circle cx={line.x1} cy={line.y1} r="4" fill={line.color} opacity="0.2" />
          <circle cx={line.x2} cy={line.y2} r="4" fill={line.color} opacity="0.2" />
        </g>
      ))}
    </svg>
  );
}

// ============================================
// CURSOR SPOTLIGHT
// ============================================

function CursorSpotlight({
  mousePosition,
  isVisible,
}: {
  mousePosition: { x: number; y: number };
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none z-0 transition-opacity duration-500 hidden lg:block"
      style={{
        left: mousePosition.x - 200,
        top: mousePosition.y - 200,
        width: 400,
        height: 400,
        background: `radial-gradient(circle at center, rgba(30, 77, 183, 0.08) 0%, rgba(255, 104, 31, 0.05) 30%, transparent 70%)`,
        borderRadius: "50%",
        opacity: mousePosition.x > 0 && mousePosition.y > 0 ? 1 : 0,
      }}
    />
  );
}

// ============================================
// BACKGROUND
// ============================================

function SectionBackground({ scrollY, sectionTop }: { scrollY: number; sectionTop: number }) {
  const parallax = (scrollY - sectionTop) * 0.1;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated mesh gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30, 77, 183, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(255, 104, 31, 0.06), transparent),
            radial-gradient(ellipse 60% 40% at 0% 50%, rgba(0, 102, 102, 0.06), transparent)
          `,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: `translateY(${parallax * 0.5}px)`,
        }}
      />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating orbs with parallax */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px]"
        style={{
          background: "linear-gradient(135deg, rgba(30, 77, 183, 0.15), rgba(0, 102, 102, 0.1))",
          animation: "float-orb 20s ease-in-out infinite",
          transform: `translate(${parallax * 0.3}px, ${parallax * -0.2}px)`,
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[550px] h-[550px] rounded-full blur-[120px]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 104, 31, 0.12), rgba(255, 230, 59, 0.08))",
          animation: "float-orb 25s ease-in-out infinite 3s",
          transform: `translate(${parallax * -0.2}px, ${parallax * 0.3}px)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 230, 59, 0.1), rgba(0, 102, 102, 0.08))",
          animation: "float-orb 18s ease-in-out infinite 1.5s",
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{
          background: "linear-gradient(135deg, rgba(237, 73, 73, 0.08), rgba(255, 104, 31, 0.1))",
          animation: "float-orb 22s ease-in-out infinite 4s",
          transform: `translate(${parallax * 0.25}px, ${parallax * -0.15}px)`,
        }}
      />

      {/* Layered depth elements */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 0%, white 5%, white 95%, transparent 100%)`,
        }}
      />
    </div>
  );
}

// ============================================
// KEYFRAMES STYLE
// ============================================

const keyframesCSS = `
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes shine-sweep {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes float-orb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -20px) scale(1.05); }
    50% { transform: translate(-20px, 30px) scale(0.98); }
    75% { transform: translate(-30px, -15px) scale(1.02); }
  }
  @keyframes dash-animation {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 100; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-ring {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.6; }
  }
  .backface-hidden {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================

export function WebSummitProducts() {
  const t = useTranslations("websummit");
  const { ref: sectionRef, isVisible } = useIntersectionObserver(0.1);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [sectionTop, setSectionTop] = useState(0);
  const mousePosition = useMousePosition(gridContainerRef);
  const scrollY = useScrollPosition();

  // Update container rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (gridContainerRef.current) {
        setContainerRect(gridContainerRef.current.getBoundingClientRect());
      }
      if (sectionRef.current) {
        setSectionTop(sectionRef.current.getBoundingClientRect().top + window.scrollY);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [sectionRef]);

  return (
    <section
      id="solutions"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      <SectionBackground scrollY={scrollY} sectionTop={sectionTop} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader isVisible={isVisible} t={t} />

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory lg:hidden -mx-4 px-4 scrollbar-hide">
          {PRODUCTS.map((product, index) => (
            <div
              key={product.name}
              className="min-w-[320px] max-w-[340px] snap-center flex-shrink-0"
              data-product-card
            >
              <ProductCard
                product={product}
                index={index}
                isVisible={isVisible}
                mousePosition={{ x: 0, y: 0 }}
                containerRect={null}
                scrollY={scrollY}
                sectionTop={sectionTop}
              />
            </div>
          ))}
        </div>

        {/* Desktop: grid layout with effects */}
        <div
          ref={gridContainerRef}
          className="hidden lg:block relative"
        >
          {/* Cursor spotlight */}
          <CursorSpotlight mousePosition={mousePosition} isVisible={isVisible} />

          {/* Connecting lines */}
          <ConnectingLines
            products={PRODUCTS}
            isVisible={isVisible}
            containerRef={gridContainerRef}
          />

          {/* Grid */}
          <div className="relative z-10 grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {PRODUCTS.map((product, index) => (
              <div key={product.name} data-product-card>
                <ProductCard
                  product={product}
                  index={index}
                  isVisible={isVisible}
                  mousePosition={mousePosition}
                  containerRect={containerRect}
                  scrollY={scrollY}
                  sectionTop={sectionTop}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-[1200ms]
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold
              bg-gradient-to-r from-accent-orange to-primary hover:shadow-lg hover:shadow-primary/20
              transition-all duration-300 hover:scale-105 relative overflow-hidden"
          >
            {/* Animated shimmer */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            />
            <span className="relative z-10">{t("products.cta")}</span>
            <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
