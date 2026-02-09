"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@ktblog/ui/components";
import { useCart } from "@/providers/cart-provider";
import { useTranslations } from "next-intl";

// =============================================================================
// Checkout Cancel Page
// =============================================================================
// Shown when the user cancels payment on the Stripe Checkout page.

export default function CheckoutCancelPage() {
  const { openCart } = useCart();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-amber-500 dark:text-amber-400" />
        </motion.div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          Payment Cancelled
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          Your payment was not completed and you have not been charged.
          Your cart items are still saved if you would like to try again.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={openCart}
            variant="default"
            className="gap-2 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white"
          >
            <ShoppingCart className="w-4 h-4" />
            Return to Cart
          </Button>

          <Button asChild variant="outline" className="gap-2">
            <Link href="/store">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
