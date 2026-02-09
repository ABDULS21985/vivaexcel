"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Presentation as PresentationIcon,
  Layers,
  Globe,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import type { Presentation } from "@/types/presentation";
import { PresentationCard } from "@/components/presentations/presentation-card";

// =============================================================================
// Types
// =============================================================================

interface IndustryItem {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface TypeItem {
  key: string;
  label: string;
  color: string;
}

interface LandingPageClientProps {
  featured: Presentation[];
  newArrivals: Presentation[];
  popular: Presentation[];
  totalCount: number;
  industryData: IndustryItem[];
  typeData: TypeItem[];
}

// =============================================================================
// Animation Variants
// =============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// =============================================================================
// Featured Carousel Section
// =============================================================================

function FeaturedCarousel({ items }: { items: Presentation[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {items.map((presentation, index) => (
            <div
              key={presentation.id}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
            >
              <PresentationCard presentation={presentation} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {items.length > 4 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function LandingPageClient({
  featured,
  newArrivals,
  popular,
  totalCount,
  industryData,
  typeData,
}: LandingPageClientProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-24 md:py-36 bg-gradient-to-br from-[#D24726] via-[#B73D20] to-[#8F2E17] overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#F59A23]/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FBBC04]/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <Sparkles className="h-4 w-4 text-[#FBBC04]" />
                <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                  Presentation Marketplace
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Create Stunning{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#FBBC04]">
                Presentations
              </span>
              <br />
              in Minutes
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Professional PowerPoint, Google Slides, and Keynote templates for
              every industry. Fully editable, beautifully designed, ready to
              download.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link
                href="/presentations"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#D24726] font-bold rounded-xl hover:bg-neutral-100 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Browse Templates
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/presentations?isFeatured=true"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <Star className="h-5 w-5" />
                View Featured
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
            >
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {totalCount}+
                </p>
                <p className="text-sm text-white/60">Templates</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {industryData.length}
                </p>
                <p className="text-sm text-white/60">Industries</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {typeData.length}
                </p>
                <p className="text-sm text-white/60">Types</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  Instant
                </p>
                <p className="text-sm text-white/60">Download</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Presentations Carousel */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900/50 dark:to-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-[#D24726]" />
                    <span className="text-xs font-bold tracking-wider text-[#D24726] uppercase">
                      Featured
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Featured Templates
                  </h2>
                </div>
                <Link
                  href="/presentations?isFeatured=true"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <FeaturedCarousel items={featured} />
            </div>
          </div>
        </section>
      )}

      {/* Browse by Industry */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-[#D24726]" />
                <span className="text-xs font-bold tracking-wider text-[#D24726] uppercase">
                  By Industry
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Browse by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D24726] to-[#F59A23]">
                  Industry
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Find the perfect template tailored to your industry
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
            >
              {industryData.map((industry) => (
                <motion.div key={industry.key} variants={fadeInUp}>
                  <Link
                    href={`/presentations/industry/${industry.key}`}
                    className="group block p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300 hover:border-neutral-200 dark:hover:border-neutral-700 text-center"
                  >
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${industry.color}10` }}
                    >
                      {industry.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-[#D24726] dark:group-hover:text-orange-400 transition-colors">
                      {industry.label}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-[#D24726]" />
                <span className="text-xs font-bold tracking-wider text-[#D24726] uppercase">
                  By Type
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Browse by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D24726] to-[#F59A23]">
                  Presentation Type
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                From pitch decks to annual reports, find your template type
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              {typeData.map((type) => (
                <motion.div key={type.key} variants={fadeInUp}>
                  <Link
                    href={`/presentations?presentationType=${type.key}`}
                    className="group block p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300 hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <div
                      className="w-full h-1.5 rounded-full mb-4"
                      style={{ backgroundColor: type.color }}
                    />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-[#D24726] dark:group-hover:text-orange-400 transition-colors">
                      {type.label}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-neutral-500 dark:text-neutral-400 group-hover:text-[#D24726] dark:group-hover:text-orange-400 transition-colors">
                      <span className="text-xs font-medium">Browse</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-[#D24726]" />
                    <span className="text-xs font-bold tracking-wider text-[#D24726] uppercase">
                      New
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    New Arrivals
                  </h2>
                </div>
                <Link
                  href="/presentations?sortBy=publishedAt&sortOrder=DESC"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {newArrivals.map((presentation, index) => (
                  <motion.div key={presentation.id} variants={fadeInUp}>
                    <PresentationCard
                      presentation={presentation}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Most Popular */}
      {popular.length > 0 && (
        <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900/30">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-[#D24726]" />
                    <span className="text-xs font-bold tracking-wider text-[#D24726] uppercase">
                      Popular
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    Most Popular
                  </h2>
                </div>
                <Link
                  href="/presentations?sortBy=downloadCount&sortOrder=DESC"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {popular.map((presentation, index) => (
                  <motion.div key={presentation.id} variants={fadeInUp}>
                    <PresentationCard
                      presentation={presentation}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#D24726] via-[#B73D20] to-[#8F2E17] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trusted by Professionals{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#FBBC04]">
                  Worldwide
                </span>
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Join thousands of professionals using our presentation templates
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <PresentationIcon className="h-8 w-8 text-white mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {totalCount}+
                </p>
                <p className="text-sm text-white/60">Total Templates</p>
              </div>
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <Layers className="h-8 w-8 text-white mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  10K+
                </p>
                <p className="text-sm text-white/60">Total Slides</p>
              </div>
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <Globe className="h-8 w-8 text-white mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {industryData.length}
                </p>
                <p className="text-sm text-white/60">Industries</p>
              </div>
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <Star className="h-8 w-8 text-white mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  4.8
                </p>
                <p className="text-sm text-white/60">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                Ready to Create{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D24726] to-[#F59A23]">
                  Stunning Presentations?
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
                Browse our full collection of premium presentation templates and
                find the perfect one for your next presentation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/presentations"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D24726] to-[#B73D20] hover:from-[#B73D20] hover:to-[#D24726] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D24726]/25"
                >
                  Browse All Templates
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl transition-all duration-300"
                >
                  Custom Request
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPageClient;
