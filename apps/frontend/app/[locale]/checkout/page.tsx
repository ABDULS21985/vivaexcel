"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Lock,
  ChevronRight,
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

// =============================================================================
// Checkout Page
// =============================================================================
// Displays order summary and initiates Stripe Checkout session.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function CheckoutPage() {
  const { items, summary, isLoading: cartLoading } = useCart();
  const checkout = useCheckout();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

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

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create checkout session";
      setCouponError(message);
    }
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Your cart is empty
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Button asChild>
          <Link href="/store" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/store">Store</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-3.5 h-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Order Summary ({summary.itemCount} {summary.itemCount === 1 ? "item" : "items"})
          </h2>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-4 sm:p-5",
                  index < items.length - 1 &&
                    "border-b border-neutral-100 dark:border-neutral-800",
                )}
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  {item.product.featuredImage ? (
                    <Image
                      src={item.product.featuredImage}
                      alt={item.product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {item.product.title}
                  </p>
                  {item.variant && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.variant.name}
                    </p>
                  )}
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 capitalize">
                    {item.product.type.replace(/_/g, " ")}
                  </p>
                </div>

                {/* Price */}
                <p className="text-sm font-semibold text-neutral-900 dark:text-white flex-shrink-0">
                  {formatPrice(item.unitPrice, item.product.currency)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Payment Summary
            </h3>

            {/* Coupon Code */}
            <div className="space-y-2">
              <label
                htmlFor="coupon-code"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Coupon Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  leftIcon={<Tag className="w-4 h-4" />}
                  className="flex-1 text-neutral-900 dark:text-white"
                />
              </div>
              {couponError && (
                <p className="text-xs text-red-500 dark:text-red-400">{couponError}</p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span className="text-neutral-900 dark:text-white font-medium">
                  {formatPrice(summary.subtotal, summary.currency)}
                </span>
              </div>

              {summary.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Discount</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    -{formatPrice(summary.discountAmount, summary.currency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-base font-semibold text-neutral-900 dark:text-white">
                  Total
                </span>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(summary.total, summary.currency)}
                </span>
              </div>
            </div>

            {/* Pay button */}
            <Button
              onClick={handleCheckout}
              isLoading={checkout.isPending}
              disabled={checkout.isPending || items.length === 0}
              className="w-full h-12 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl shadow-lg shadow-[#1E4DB7]/25 hover:shadow-xl hover:shadow-[#1E4DB7]/30 transition-all gap-2"
              leftIcon={<CreditCard className="w-5 h-5" />}
            >
              {checkout.isPending ? "Creating session..." : "Pay with Stripe"}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              <Lock className="w-3 h-3" />
              <span>Secured by Stripe. We never store your card details.</span>
            </div>

            {/* Back to cart */}
            <div className="text-center">
              <Link
                href="/store"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors underline underline-offset-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
