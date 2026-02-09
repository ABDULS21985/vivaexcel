"use client";

import { useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { FlashSaleCountdown } from "./flash-sale-countdown";

// =============================================================================
// Types
// =============================================================================

interface FlashSale {
  id: string;
  name: string;
  description?: string;
  discountPercentage: number;
  endsAt: string;
  featuredImage?: string;
}

interface FlashSaleBannerProps {
  sale: FlashSale;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const bannerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function FlashSaleBanner({
  sale,
  className = "",
}: FlashSaleBannerProps) {
  const handleExpired = useCallback(() => {
    // The banner could be hidden by a parent handler; for now it stays visible with "Expired"
  }, []);

  return (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 dark:from-red-700 dark:via-orange-600 dark:to-amber-600" />

      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 lg:p-10">
        {/* Featured Image */}
        {sale.featuredImage && (
          <motion.div
            variants={childVariants}
            className="flex-shrink-0 w-full md:w-48 lg:w-56 h-32 md:h-40 relative rounded-xl overflow-hidden shadow-2xl"
          >
            <Image
              src={sale.featuredImage}
              alt={sale.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 224px"
            />
          </motion.div>
        )}

        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          {/* Flash Sale Label */}
          <motion.div
            variants={childVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3"
          >
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Flash Sale
            </span>
          </motion.div>

          {/* Sale Name */}
          <motion.h2
            variants={childVariants}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight"
          >
            {sale.name}
          </motion.h2>

          {/* Description */}
          {sale.description && (
            <motion.p
              variants={childVariants}
              className="text-sm md:text-base text-white/80 mb-4 max-w-lg"
            >
              {sale.description}
            </motion.p>
          )}

          {/* Countdown */}
          <motion.div variants={childVariants} className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              Ends in
            </p>
            <FlashSaleCountdown
              endsAt={sale.endsAt}
              size="lg"
              onExpired={handleExpired}
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={childVariants}>
            <Link
              href={`/store?sale=${sale.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-neutral-50 transition-all duration-200 group"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Discount Badge */}
        <motion.div
          variants={childVariants}
          className="flex-shrink-0 order-first md:order-last"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/30"
          >
            <div className="text-center">
              <span className="block text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none">
                {sale.discountPercentage}%
              </span>
              <span className="block text-xs md:text-sm font-bold text-white/90 uppercase tracking-wider">
                OFF
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default FlashSaleBanner;
