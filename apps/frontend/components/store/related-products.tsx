"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/store/product-card";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface RelatedProductsProps {
  products: DigitalProduct[];
  title?: string;
  showViewAll?: boolean;
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function RelatedProducts({
  products,
  title = "Related Products",
  showViewAll = true,
}: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#1E4DB7]" />
              <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                You May Also Like
              </span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#1E4DB7]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              {title}
            </h2>
          </div>

          {showViewAll && (
            <Link
              href="/store"
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] transition-colors group"
            >
              View All Products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          {products.slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>

        {/* Mobile View All */}
        {showViewAll && (
          <div className="flex justify-center mt-10 md:hidden">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default RelatedProducts;
