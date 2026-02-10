"use client";

import { motion } from "framer-motion";
import { Crown, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSubscription } from "@/providers/subscription-provider";
import type { DigitalProduct } from "@/types/digital-product";
import { ProductCard } from "@/components/store/product-card";

interface SubscriberPopularSectionProps {
  products: DigitalProduct[];
}

export function SubscriberPopularSection({ products }: SubscriberPopularSectionProps) {
  const { isSubscribed } = useSubscription();

  if (!isSubscribed) {
    // Promotional banner for non-subscribers
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-12"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-1 text-center md:text-start">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <Crown className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-bold text-white/90 uppercase tracking-wider">
                    Subscribe & Save
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Get unlimited access with a subscription
                </h2>
                <p className="text-white/80 text-sm md:text-base max-w-lg">
                  Subscribe from $19/mo and download products using credits. Save up to 80% compared to individual purchases.
                </p>
              </div>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:bg-neutral-50 transition-all duration-300 flex-shrink-0"
              >
                <Sparkles className="h-5 w-5" />
                View Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // For subscribers: show products they can access
  const accessibleProducts = products.slice(0, 6);
  if (accessibleProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-neutral-950">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-px bg-emerald-500" />
              <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                <Crown className="inline h-3 w-3 mr-1" />
                Your Plan
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              Popular with Subscribers
            </h2>
          </div>
          <Link
            href="/store"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Browse All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {accessibleProducts.map((product, idx) => (
            <div key={product.id} className="flex-shrink-0 w-[300px] md:w-[340px]">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
