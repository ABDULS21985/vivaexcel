"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { FlashSaleCountdown } from "./flash-sale-countdown";

// =============================================================================
// Types
// =============================================================================

export interface FlashSale {
  id: string;
  name: string;
  description?: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  productCount?: number;
  bannerColor?: string;
  imageUrl?: string;
}

interface FlashSaleBannerProps {
  sale: FlashSale;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function FlashSaleBanner({ sale, className = "" }: FlashSaleBannerProps) {
  const bgGradient = sale.bannerColor
    ? `linear-gradient(135deg, ${sale.bannerColor}, ${sale.bannerColor}dd)`
    : "linear-gradient(135deg, #dc2626, #ea580c)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative min-w-[320px] max-w-[400px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg ${className}`}
      style={{ background: bgGradient }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <Link
        href={`/store/flash-sale/${sale.id}`}
        className="relative z-10 flex flex-col p-6 h-full"
      >
        {/* Flash sale icon + badge */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
          </motion.div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">
            Flash Sale
          </span>
          <span className="ml-auto px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
            {sale.discountPercent}% OFF
          </span>
        </div>

        {/* Sale name */}
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
          {sale.name}
        </h3>

        {/* Description */}
        {sale.description && (
          <p className="text-sm text-white/70 mb-4 line-clamp-2">
            {sale.description}
          </p>
        )}

        {/* Countdown */}
        <div className="mt-auto">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
            Ends in
          </p>
          <FlashSaleCountdown endsAt={sale.endsAt} size="sm" />
        </div>

        {/* Product count + CTA */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
          {sale.productCount !== undefined && (
            <span className="text-xs text-white/70">
              {sale.productCount} products on sale
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-white transition-all">
            Shop Now
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default FlashSaleBanner;
