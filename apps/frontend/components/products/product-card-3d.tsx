"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Shield,
  GitBranch,
  Layers,
  Activity,
  Code2,
  Settings,
  FileCheck,
  QrCode,
  ClipboardCheck,
  Plug,
  XCircle,
  Building2,
  MapPin,
  GitCommit,
  Timer,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  Check,
  Zap,
  Link2,
  Eye,
  Smartphone,
  Globe,
  Users,
  MessageSquare,
  Phone,
  ShieldCheck,
  Bot,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@digibit/ui/lib/utils";
import type { Product } from "@/types/products";

// Icon mapping for product features
const iconMap: Record<string, LucideIcon> = {
  Shield,
  GitBranch,
  Layers,
  Activity,
  Code2,
  Settings,
  FileCheck,
  QrCode,
  ClipboardCheck,
  Plug,
  XCircle,
  Building2,
  MapPin,
  GitCommit,
  Timer,
  Link: GitBranch,
  TrendingUp,
  LayoutDashboard,
  Zap,
  Link2,
  Eye,
  Smartphone,
  Globe,
  Users,
  MessageSquare,
  Phone,
  ShieldCheck,
  Bot,
  BarChart3,
};

/* ===========================================
   PRODUCT CARD 3D COMPONENT
   =========================================== */
interface ProductCard3DProps {
  product: Product;
  className?: string;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Enable holographic shine effect */
  enableShine?: boolean;
  /** Enable magnetic cursor effect */
  enableMagnetic?: boolean;
  /** Show features on hover */
  showFeaturesOnHover?: boolean;
}

export function ProductCard3D({
  product,
  className,
  maxTilt = 10,
  enableShine = true,
  enableMagnetic = true,
  showFeaturesOnHover = true,
}: ProductCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Motion values for magnetic effect
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);

  // Motion values for shine effect
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  // Transform mouse position to rotation values
  const rotateX = useTransform(y, [-100, 100], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-100, 100], [-maxTilt, maxTilt]);

  // Spring configs for smooth animations
  const springConfig = { stiffness: 150, damping: 20 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springMagneticX = useSpring(magneticX, { stiffness: 200, damping: 25 });
  const springMagneticY = useSpring(magneticY, { stiffness: 200, damping: 25 });

  // Parallax for image (deeper layer moves more)
  const imageX = useTransform(x, [-100, 100], [8, -8]);
  const imageY = useTransform(y, [-100, 100], [8, -8]);
  const springImageX = useSpring(imageX, springConfig);
  const springImageY = useSpring(imageY, springConfig);

  // Listen for reduced motion preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener("change", handleChange);
    return () => motionQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle mouse move for 3D tilt and shine
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || isTouchDevice) return;

      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center for tilt
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      x.set(distX);
      y.set(distY);

      // Calculate shine position (percentage)
      const shinePercentX = ((e.clientX - rect.left) / rect.width) * 100;
      const shinePercentY = ((e.clientY - rect.top) / rect.height) * 100;
      shineX.set(shinePercentX);
      shineY.set(shinePercentY);

      // Magnetic effect - card slightly follows cursor
      if (enableMagnetic) {
        const magnetStrength = 0.1;
        magneticX.set(distX * magnetStrength);
        magneticY.set(distY * magnetStrength);
      }
    },
    [x, y, shineX, shineY, magneticX, magneticY, enableMagnetic, prefersReducedMotion, isTouchDevice]
  );

  // Reset on mouse leave
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    magneticX.set(0);
    magneticY.set(0);
    shineX.set(50);
    shineY.set(50);
    setIsHovered(false);
  }, [x, y, magneticX, magneticY, shineX, shineY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Only apply 3D effects if not reduced motion and not touch
  const enable3D = !prefersReducedMotion && !isTouchDevice;

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative group", className)}
      style={
        enable3D
          ? {
              x: springMagneticX,
              y: springMagneticY,
            }
          : undefined
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        className="relative h-full"
        style={
          enable3D
            ? {
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d",
                transformPerspective: 1000,
              }
            : undefined
        }
      >
        {/* Main Card */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-white border border-neutral-200",
            "shadow-lg transition-shadow duration-300",
            "hover:shadow-2xl",
            "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Holographic Shine Overlay */}
          {enableShine && enable3D && (
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `
                  radial-gradient(
                    circle at ${shineX.get()}% ${shineY.get()}%,
                    rgba(255, 255, 255, 0.4) 0%,
                    transparent 50%
                  ),
                  linear-gradient(
                    105deg,
                    transparent 40%,
                    rgba(255, 255, 255, 0.2) 45%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0.2) 55%,
                    transparent 60%
                  )
                `,
              }}
            />
          )}

          {/* Rainbow Holographic Effect */}
          {enableShine && (
            <div
              className={cn(
                "absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500",
                isHovered && enable3D && "opacity-30"
              )}
              style={{
                background: `linear-gradient(
                  135deg,
                  rgba(255, 0, 128, 0.1) 0%,
                  rgba(0, 255, 255, 0.1) 25%,
                  rgba(255, 255, 0, 0.1) 50%,
                  rgba(0, 128, 255, 0.1) 75%,
                  rgba(255, 0, 128, 0.1) 100%
                )`,
                backgroundSize: "200% 200%",
                animation: isHovered ? "holographic 3s ease infinite" : "none",
              }}
            />
          )}

          {/* Product Image with Parallax */}
          <div className="relative h-48 md:h-56 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={
                enable3D
                  ? {
                      x: springImageX,
                      y: springImageY,
                      scale: isHovered ? 1.05 : 1,
                    }
                  : undefined
              }
              transition={{ duration: 0.3 }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>

            {/* Image Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Tagline Badge */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <span
                className="inline-block px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold"
                style={{ color: product.accentColor }}
              >
                {product.tagline}
              </span>
            </div>

            {/* Accent Color Border on Hover */}
            <div
              className={cn(
                "absolute inset-0 border-2 rounded-t-2xl transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              style={{ borderColor: product.accentColor }}
            />
          </div>

          {/* Card Content */}
          <div className="p-5 md:p-6" style={{ transform: "translateZ(20px)" }}>
            {/* Product Name */}
            <h3 className="text-xl md:text-2xl font-bold text-[#1e3a8a] mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Animated Features List */}
            {showFeaturesOnHover && (
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      {product.valuePropositions.slice(0, 3).map((prop, index) => (
                        <motion.div
                          key={prop}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 text-sm text-neutral-700"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: index * 0.1 + 0.1,
                              type: "spring",
                              stiffness: 300,
                            }}
                          >
                            <Check
                              className="h-4 w-4 flex-shrink-0"
                              style={{ color: product.accentColor }}
                            />
                          </motion.div>
                          <span className="line-clamp-1">{prop}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Feature Icons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.features.slice(0, 4).map((feature) => {
                const IconComponent = iconMap[feature.icon] || Shield;
                return (
                  <div
                    key={feature.title}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: `${product.accentColor}15` }}
                    title={feature.title}
                  >
                    <IconComponent
                      className="h-4 w-4"
                      style={{ color: product.accentColor }}
                    />
                  </div>
                );
              })}
              {product.features.length > 4 && (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `${product.accentColor}15`,
                    color: product.accentColor,
                  }}
                >
                  +{product.features.length - 4}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              href={`/products/${product.id}`}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300",
                "hover:scale-105 hover:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-offset-2"
              )}
              style={{
                backgroundColor: product.accentColor,
                // Focus ring uses CSS custom property for dynamic color
                "--tw-ring-color": product.accentColor,
              } as React.CSSProperties}
            >
              Learn More
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 3D Depth Shadow */}
        {enable3D && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-2xl"
            style={{
              background: `${product.accentColor}20`,
              transform: "translateZ(-30px) translateX(8px) translateY(8px)",
              filter: "blur(20px)",
              opacity: isHovered ? 0.6 : 0.3,
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      {/* Global CSS for holographic animation */}
      <style jsx global>{`
        @keyframes holographic {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </motion.div>
  );
}

/* ===========================================
   PRODUCT GRID 3D COMPONENT
   =========================================== */
interface ProductGrid3DProps {
  products: Product[];
  className?: string;
  /** Number of columns on different breakpoints */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Stagger delay between card animations in ms */
  staggerDelay?: number;
  /** Initial delay before first card animates in ms */
  initialDelay?: number;
  /** Card configuration options */
  cardProps?: Omit<ProductCard3DProps, "product">;
}

export function ProductGrid3D({
  products,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 3 },
  staggerDelay = 100,
  initialDelay = 0,
  cardProps,
}: ProductGrid3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use lazy initialization to check prefersReducedMotion for isVisible
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Listen for reduced motion preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener("change", handleChange);
    return () => motionQuery.removeEventListener("change", handleChange);
  }, []);

  // Intersection observer for scroll-based reveal
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Already visible if reduced motion is preferred (set via lazy init)
    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Generate grid column classes
  const gridClasses = cn(
    "grid gap-6 md:gap-8",
    columns.sm === 1 && "grid-cols-1",
    columns.sm === 2 && "grid-cols-2",
    columns.md === 2 && "md:grid-cols-2",
    columns.md === 3 && "md:grid-cols-3",
    columns.lg === 2 && "lg:grid-cols-2",
    columns.lg === 3 && "lg:grid-cols-3",
    columns.lg === 4 && "lg:grid-cols-4",
    columns.xl === 3 && "xl:grid-cols-3",
    columns.xl === 4 && "xl:grid-cols-4"
  );

  // Container animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay / 1000,
        delayChildren: initialDelay / 1000,
      },
    },
  };

  // Item animation variants
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Custom easing
      },
    },
  };

  // Reduced motion variants
  const reducedMotionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const variants = prefersReducedMotion ? reducedMotionVariants : itemVariants;

  return (
    <motion.div
      ref={containerRef}
      className={cn(gridClasses, className)}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={variants}
          custom={index}
        >
          <ProductCard3D product={product} {...cardProps} />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ===========================================
   COMPACT PRODUCT CARD 3D (Smaller variant)
   =========================================== */
interface CompactProductCard3DProps {
  product: Product;
  className?: string;
}

export function CompactProductCard3D({
  product,
  className,
}: CompactProductCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });
  const [prefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-50, 50], [5, -5]);
  const rotateY = useTransform(x, [-50, 50], [-5, 5]);

  const springConfig = { stiffness: 200, damping: 25 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || isTouchDevice) return;

      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      x.set(e.clientX - (rect.left + rect.width / 2));
      y.set(e.clientY - (rect.top + rect.height / 2));
    },
    [x, y, prefersReducedMotion, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  const enable3D = !prefersReducedMotion && !isTouchDevice;

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      <motion.div
        style={
          enable3D
            ? {
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d",
                transformPerspective: 800,
              }
            : undefined
        }
      >
        <Link
          href={`/products/${product.id}`}
          className={cn(
            "block p-4 rounded-xl bg-white border border-neutral-200",
            "shadow-md hover:shadow-xl transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${product.accentColor}15` }}
            >
              {(() => {
                const IconComponent =
                  iconMap[product.features[0]?.icon] || Shield;
                return (
                  <IconComponent
                    className="h-6 w-6"
                    style={{ color: product.accentColor }}
                  />
                );
              })()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-neutral-900 truncate">
                {product.name}
              </h4>
              <p className="text-xs text-neutral-500 truncate">
                {product.tagline}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight
              className={cn(
                "h-5 w-5 text-neutral-400 transition-all duration-300",
                isHovered && "text-primary translate-x-1"
              )}
            />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default ProductCard3D;
