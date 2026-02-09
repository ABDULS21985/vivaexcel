"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Lock,
  ChevronRight,
  Shield,
  RefreshCw,
  Timer,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Quote,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Input } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import { useCheckout } from "@/hooks/use-cart";
import { trackConversion } from "@/lib/conversion-tracking";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";

// =============================================================================
// Checkout Page — Premium Pre-Checkout Experience
// =============================================================================

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const TYPE_BADGE_COLORS: Record<string, string> = {
  powerpoint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  document: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  web_template: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  startup_kit: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  solution_template: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  design_system: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  code_template: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  other: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700/30 dark:text-neutral-400",
};

function getTypeBadgeClass(type: string): string {
  return TYPE_BADGE_COLORS[type] || TYPE_BADGE_COLORS.other;
}

function formatTypeLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 25 };
const EASE_OUT = { duration: 0.3, ease: "easeOut" as const };

// -----------------------------------------------------------------------------
// Countdown Timer
// -----------------------------------------------------------------------------

function CountdownTimer({ seconds, expired, t }: { seconds: number; expired: boolean; t: ReturnType<typeof useTranslations> }) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (expired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40"
      >
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          {t("coupon.expired")}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40"
    >
      <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <span className="text-sm text-amber-700 dark:text-amber-300">
        {t("coupon.countdown", { time: `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` })}
      </span>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Trust Signals
// -----------------------------------------------------------------------------

function TrustSignals({ t }: { t: ReturnType<typeof useTranslations> }) {
  const signals = [
    { icon: Shield, label: t("trust.securePayment"), desc: t("trust.securePaymentDesc") },
    { icon: CreditCard, label: t("trust.sslEncrypted"), desc: t("trust.sslEncryptedDesc") },
    { icon: RefreshCw, label: t("trust.moneyBack"), desc: t("trust.moneyBackDesc") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, ...EASE_OUT }}
      className="space-y-4"
    >
      <div className="grid grid-cols-3 gap-2">
        {signals.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
          >
            <Icon className="w-5 h-5 text-[#1E4DB7] dark:text-blue-400 mb-1.5" />
            <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
              {label}
            </span>
            <span className="text-[9px] text-neutral-500 dark:text-neutral-400">{desc}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
        <Quote className="w-5 h-5 text-[#F59A23] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm italic text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {t("trust.testimonialQuote")}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
            {t("trust.testimonialAuthor")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Coupon Input
// -----------------------------------------------------------------------------

function CouponSection({
  couponCode,
  setCouponCode,
  couponError,
  couponSuccess,
  t,
}: {
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponError: string | null;
  couponSuccess: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [showCoupon, setShowCoupon] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCoupon && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [showCoupon]);

  return (
    <div>
      <button
        onClick={() => setShowCoupon(!showCoupon)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
      >
        <Tag className="w-3.5 h-3.5" />
        <span>{showCoupon ? t("coupon.hide") : t("coupon.haveACoupon")}</span>
      </button>

      <AnimatePresence>
        {showCoupon && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={EASE_OUT}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-2.5">
              <Input
                ref={inputRef}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t("coupon.placeholder")}
                leftIcon={<Tag className="w-4 h-4" />}
                className={cn(
                  "flex-1 text-sm h-9",
                  couponSuccess && "border-emerald-500",
                  couponError && "border-red-500",
                )}
                disabled={couponSuccess}
              />
            </div>
            <AnimatePresence>
              {couponSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> {t("coupon.applied")}
                </motion.p>
              )}
              {couponError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-500 dark:text-red-400 mt-1.5"
                >
                  {couponError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { items, summary, isLoading: cartLoading, removeFromCart } = useCart();
  const checkout = useCheckout();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (couponSuccess && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            setTimerExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [couponSuccess]);

  useEffect(() => {
    if (items.length > 0) {
      trackConversion("CHECKOUT_STARTED", {
        quantity: items.length,
        revenue: summary.total,
        currency: summary.currency,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckout = async () => {
    setCouponError(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout/cancel`;

    try {
      const result = await checkout.mutateAsync({
        successUrl,
        cancelUrl,
        ...(couponCode.trim() && { couponCode: couponCode.trim() }),
      });
      if (result.url) window.location.href = result.url;
    } catch (error: unknown) {
      setCouponError(
        error instanceof Error ? error.message : "Failed to create checkout session",
      );
    }
  };

  const handleRemove = useCallback(
    async (itemId: string) => {
      try { await removeFromCart(itemId); } catch { /* stays */ }
    },
    [removeFromCart],
  );

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-8 animate-pulse" />
        <div className="h-10 w-56 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>
          <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6 mx-auto">
            <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{t("empty.title")}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">{t("empty.description")}</p>
        <Button asChild className="gap-2">
          <Link href="/store"><ArrowLeft className="w-4 h-4" /> {t("empty.browseProducts")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">{t("breadcrumb.home")}</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="w-3.5 h-3.5" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/store">{t("breadcrumb.store")}</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="w-3.5 h-3.5" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbPage>{t("breadcrumb.checkout")}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-8">
        {t("title")}
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            {t("orderSummary")} ({t("item.count", { count: summary.itemCount })})
          </h2>

          <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/20 dark:border-neutral-700/30 rounded-2xl overflow-hidden shadow-lg shadow-neutral-200/20 dark:shadow-black/20">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: index * 0.05, ...EASE_OUT }}
                  className={cn(
                    "flex items-center gap-4 p-4 sm:p-5 group",
                    index < items.length - 1 && "border-b border-neutral-100 dark:border-neutral-800",
                  )}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
                    {item.product.featuredImage ? (
                      <Image src={item.product.featuredImage} alt={item.product.title} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded", getTypeBadgeClass(item.product.type))}>
                        {formatTypeLabel(item.product.type)}
                      </span>
                      {item.variant && <span className="text-xs text-neutral-500 dark:text-neutral-400">{item.variant.name}</span>}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-neutral-900 dark:text-white flex-shrink-0">
                    {formatPrice(item.unitPrice, { currency: item.product.currency })}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-50 sm:group-hover:opacity-100"
                    aria-label={t("item.remove", { title: item.product.title })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...EASE_OUT }}
              className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/20 dark:border-neutral-700/30 rounded-2xl p-6 space-y-5 shadow-lg shadow-neutral-200/20 dark:shadow-black/20"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t("paymentSummary")}</h3>

              <CouponSection couponCode={couponCode} setCouponCode={setCouponCode} couponError={couponError} couponSuccess={couponSuccess} t={t} />

              <AnimatePresence>
                {couponSuccess && <CountdownTimer seconds={timerSeconds} expired={timerExpired} t={t} />}
              </AnimatePresence>

              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">{t("summary.subtotal")}</span>
                  <motion.span key={summary.subtotal} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-neutral-900 dark:text-white font-medium">
                    {formatPrice(summary.subtotal, { currency: summary.currency })}
                  </motion.span>
                </div>

                <AnimatePresence>
                  {summary.discountAmount > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between text-sm overflow-hidden">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {t("summary.discount")}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">-{formatPrice(summary.discountAmount, { currency: summary.currency })}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-base font-semibold text-neutral-900 dark:text-white">{t("summary.total")}</span>
                  <motion.span key={summary.total} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatPrice(summary.total, { currency: summary.currency })}
                  </motion.span>
                </div>
              </div>

              {/* Pay button */}
              <div className="relative">
                <Button
                  onClick={handleCheckout}
                  disabled={checkout.isPending || items.length === 0}
                  className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 transition-all gap-2"
                >
                  {checkout.isPending ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t("creatingSession")}</>) : (<><CreditCard className="w-5 h-5" /> {t("proceedToPayment")}</>)}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: "checkoutShimmer 2.5s ease-in-out infinite" }} />
                </Button>
                <style>{`@keyframes checkoutShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
              </div>

              <div className="text-center space-y-1.5">
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wide font-medium">Also available at checkout</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold rounded-md">Apple Pay</span>
                  <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold rounded-md">Google Pay</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                <Lock className="w-3 h-3" />
                <span>Secured by Stripe. We never store your card details.</span>
              </div>

              <div className="text-center">
                <Link href="/store" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors underline underline-offset-4">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>

            <TrustSignals />
          </div>
        </div>
      </div>
    </div>
  );
}
