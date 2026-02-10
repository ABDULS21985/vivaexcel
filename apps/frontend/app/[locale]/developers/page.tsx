"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Webhook,
  Layout,
  ArrowRight,
  Terminal,
  Zap,
  Shield,
  Globe,
  BookOpen,
  Blocks,
  ShoppingCart,
  BarChart3,
  Key,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@ktblog/ui/components";
import { useState } from "react";

// =============================================================================
// Animation Variants
// =============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2, ease: "easeOut" } },
};

// =============================================================================
// Code Snippet Component
// =============================================================================

function CodeSnippet() {
  const [copied, setCopied] = useState(false);

  const code = `// Fetch products from the KTBlog API
const response = await fetch(
  'https://api.ktblog.com/v1/products',
  {
    headers: {
      'Authorization': 'Bearer kt_live_xxxxxxxx',
      'Content-Type': 'application/json',
    },
  }
);

const { data } = await response.json();
console.log(data.products);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-neutral-500 font-mono">
            example.ts
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre className="p-5 text-sm leading-relaxed overflow-x-auto">
        <code className="text-neutral-300">
          <span className="text-neutral-500">{"// Fetch products from the KTBlog API"}</span>
          {"\n"}
          <span className="text-purple-400">const</span>{" "}
          <span className="text-blue-300">response</span>{" "}
          <span className="text-neutral-500">=</span>{" "}
          <span className="text-purple-400">await</span>{" "}
          <span className="text-yellow-300">fetch</span>
          <span className="text-neutral-400">(</span>
          {"\n"}
          {"  "}
          <span className="text-green-400">{`'https://api.ktblog.com/v1/products'`}</span>
          <span className="text-neutral-400">,</span>
          {"\n"}
          {"  "}
          <span className="text-neutral-400">{"{"}</span>
          {"\n"}
          {"    "}
          <span className="text-blue-300">headers</span>
          <span className="text-neutral-400">:</span>{" "}
          <span className="text-neutral-400">{"{"}</span>
          {"\n"}
          {"      "}
          <span className="text-green-400">{`'Authorization'`}</span>
          <span className="text-neutral-400">:</span>{" "}
          <span className="text-green-400">{`'Bearer kt_live_xxxxxxxx'`}</span>
          <span className="text-neutral-400">,</span>
          {"\n"}
          {"      "}
          <span className="text-green-400">{`'Content-Type'`}</span>
          <span className="text-neutral-400">:</span>{" "}
          <span className="text-green-400">{`'application/json'`}</span>
          <span className="text-neutral-400">,</span>
          {"\n"}
          {"    "}
          <span className="text-neutral-400">{"}"}</span>
          <span className="text-neutral-400">,</span>
          {"\n"}
          {"  "}
          <span className="text-neutral-400">{"}"}</span>
          {"\n"}
          <span className="text-neutral-400">)</span>
          <span className="text-neutral-400">;</span>
          {"\n\n"}
          <span className="text-purple-400">const</span>{" "}
          <span className="text-neutral-400">{"{ "}</span>
          <span className="text-blue-300">data</span>
          <span className="text-neutral-400">{" }"}</span>{" "}
          <span className="text-neutral-500">=</span>{" "}
          <span className="text-purple-400">await</span>{" "}
          <span className="text-blue-300">response</span>
          <span className="text-neutral-400">.</span>
          <span className="text-yellow-300">json</span>
          <span className="text-neutral-400">();</span>
          {"\n"}
          <span className="text-blue-300">console</span>
          <span className="text-neutral-400">.</span>
          <span className="text-yellow-300">log</span>
          <span className="text-neutral-400">(</span>
          <span className="text-blue-300">data</span>
          <span className="text-neutral-400">.</span>
          <span className="text-blue-300">products</span>
          <span className="text-neutral-400">);</span>
        </code>
      </pre>
    </div>
  );
}

// =============================================================================
// Feature Cards
// =============================================================================

const features = [
  {
    icon: Code2,
    title: "Storefront API",
    description:
      "Integrate our product catalog, pricing, and checkout into your app with a RESTful API. Full CRUD support with typed responses.",
    href: "/developers/docs",
    color: "#1E4DB7",
    bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    borderColor: "border-blue-200/50 dark:border-blue-800/30",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Get real-time event notifications for orders, products, reviews, and subscriptions. Built-in retry logic and delivery logs.",
    href: "/developers/webhooks",
    color: "#143A8F",
    bgColor: "from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30",
    borderColor: "border-blue-200/50 dark:border-blue-800/30",
  },
  {
    icon: Layout,
    title: "Embed Widgets",
    description:
      "Embed product cards, grids, and buy buttons on any website. Customizable themes, colors, and responsive layouts.",
    href: "/developers/embeds",
    color: "#F59A23",
    bgColor: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    borderColor: "border-amber-200/50 dark:border-amber-800/30",
  },
];

// =============================================================================
// Use Cases
// =============================================================================

const useCases = [
  {
    icon: Globe,
    title: "Embed on Your Blog",
    description:
      "Add product widgets to your blog or personal website to showcase and sell products directly to your audience.",
  },
  {
    icon: ShoppingCart,
    title: "Build a Custom Storefront",
    description:
      "Use our Products and Checkout APIs to build a fully custom storefront with your own design and user experience.",
  },
  {
    icon: Zap,
    title: "Automate with Webhooks",
    description:
      "Trigger workflows, update inventory, send notifications, or sync data with third-party services using real-time events.",
  },
  {
    icon: BarChart3,
    title: "Analytics Integration",
    description:
      "Pull analytics data into your own dashboards or BI tools using our Analytics API endpoints.",
  },
  {
    icon: Blocks,
    title: "Marketplace Integrations",
    description:
      "Build integrations that connect KTBlog products with external marketplaces and distribution channels.",
  },
  {
    icon: Shield,
    title: "Secure Checkout Flows",
    description:
      "Create custom checkout experiences with our secure, PCI-compliant Checkout API with subscription support.",
  },
];

// =============================================================================
// Developer Portal Page
// =============================================================================

export default function DeveloperPortalPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2B6B] via-[#143A8F] to-[#1E4DB7]" />

        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-30 animate-gradient-shift"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, #6366F1 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, #F59A23 0%, transparent 50%), radial-gradient(ellipse at 50% 20%, #F59A23 0%, transparent 40%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F59A23]/10 rounded-full blur-3xl animate-float1" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#1E4DB7]/10 rounded-full blur-3xl animate-float2" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl animate-float3" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <Terminal className="h-4 w-4 text-[#F59A23]" />
                <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                  Developer Portal
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Build with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] via-amber-300 to-[#F59A23]">
                KTBlog
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Powerful APIs, real-time webhooks, and embeddable widgets to
              integrate our marketplace into your applications.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/developers/keys">
                <Button className="bg-[#F59A23] hover:bg-[#e08b1a] text-white font-semibold px-8 py-3 rounded-xl text-base shadow-lg shadow-[#F59A23]/25 hover:shadow-[#F59A23]/40 transition-all">
                  <Key className="h-4 w-4 mr-2" />
                  Get API Keys
                </Button>
              </Link>
              <Link href="/developers/docs">
                <Button
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl text-base backdrop-blur-sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read the Docs
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12"
            >
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Shield className="h-4 w-4 text-[#F59A23]/70" />
                <span>OAuth 2.0 & API Keys</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Zap className="h-4 w-4 text-amber-400/70" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Globe className="h-4 w-4 text-blue-400/70" />
                <span>Global CDN</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FEATURE CARDS */}
      {/* ================================================================= */}
      <section className="py-20 md:py-28 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            {/* Section header */}
            <motion.div variants={fadeInUp} custom={0} className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-px bg-[#1E4DB7]" />
                <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                  Platform
                </span>
                <div className="w-8 h-px bg-[#1E4DB7]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                Everything You Need to Integrate
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Three powerful tools to connect your application with the KTBlog
                marketplace ecosystem.
              </p>
            </motion.div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, idx) => (
                <motion.div key={feature.title} variants={fadeInUp} custom={idx + 1}>
                  <Link href={feature.href}>
                    <motion.div
                      variants={cardHover}
                      initial="rest"
                      whileHover="hover"
                      className={`group relative h-full rounded-2xl overflow-hidden bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} p-8 transition-shadow duration-300 hover:shadow-xl`}
                    >
                      {/* Decorative circle */}
                      <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"
                        style={{ backgroundColor: `${feature.color}10` }}
                      />

                      <div className="relative">
                        {/* Icon */}
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                          style={{ backgroundColor: `${feature.color}15` }}
                        >
                          <feature.icon
                            className="h-7 w-7"
                            style={{ color: feature.color }}
                          />
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                          {feature.description}
                        </p>

                        {/* Link */}
                        <div
                          className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                          style={{ color: feature.color }}
                        >
                          Explore
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CODE SNIPPET PREVIEW */}
      {/* ================================================================= */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/30 dark:to-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left -- text content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-[#F59A23]" />
                  <span className="text-xs font-bold tracking-wider text-[#F59A23] uppercase">
                    Quick Start
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                  Start Building in Minutes
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                  Our REST API follows industry standards with JSON responses,
                  bearer token authentication, and comprehensive error handling.
                  Get up and running in just a few lines of code.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      text: "Create an API key from the developer dashboard",
                    },
                    {
                      step: "2",
                      text: "Add the key to your request headers",
                    },
                    {
                      step: "3",
                      text: "Start making API calls to fetch products, manage carts, and process orders",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#1E4DB7]">
                          {item.step}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right -- code snippet */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CodeSnippet />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* USE CASES */}
      {/* ================================================================= */}
      <section className="py-20 md:py-28 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            {/* Section header */}
            <motion.div variants={fadeInUp} custom={0} className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-px bg-[#1E4DB7]" />
                <span className="text-xs font-bold tracking-wider text-[#1E4DB7] dark:text-blue-400 uppercase">
                  Use Cases
                </span>
                <div className="w-8 h-px bg-[#1E4DB7]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                What You Can Build
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                From simple product embeds to full-featured custom storefronts,
                the possibilities are endless.
              </p>
            </motion.div>

            {/* Use case cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, idx) => (
                <motion.div
                  key={useCase.title}
                  variants={fadeInUp}
                  custom={idx + 1}
                  className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 hover:border-[#1E4DB7]/30 dark:hover:border-[#1E4DB7]/30 hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-[#1E4DB7]/10 dark:group-hover:bg-[#1E4DB7]/20 transition-colors"
                  >
                    <useCase.icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400 group-hover:text-[#1E4DB7] transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {useCase.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA SECTION */}
      {/* ================================================================= */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/30 dark:to-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E4DB7] to-[#0F2B6B] p-12 md:p-16">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#F59A23]/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto">
                  Create your first API key and start integrating with the
                  KTBlog platform today. It&apos;s free to get started.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/developers/keys">
                    <Button className="bg-[#F59A23] hover:bg-[#e08b1a] text-white font-semibold px-8 py-3 rounded-xl text-base shadow-lg shadow-[#F59A23]/25">
                      <Key className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </Link>
                  <Link href="/developers/docs">
                    <Button
                      variant="outline"
                      className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl text-base"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      API Reference
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
