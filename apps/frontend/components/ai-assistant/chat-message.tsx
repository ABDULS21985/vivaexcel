"use client";

// =============================================================================
// Chat Message Bubble
// =============================================================================
// Renders a single chat message with role-based styling (user vs assistant),
// a typing indicator with bouncing dots, timestamp, and inline action rendering
// for product cards, navigation links, coupons, add-to-cart, and comparisons.

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink,
  ShoppingCart,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { ProductCard } from "./product-card";
import type { ChatMessage, AssistantAction, ChatProduct } from "./types";

// =============================================================================
// Types
// =============================================================================

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSendMessage?: (text: string) => void;
}

// =============================================================================
// Animation Variants
// =============================================================================

const bubbleVariants = {
  initial: { opacity: 0, y: 12, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: i * 0.15,
      ease: "easeInOut",
    },
  }),
};

// =============================================================================
// Helpers
// =============================================================================

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// =============================================================================
// Sub-components: Action Renderers
// =============================================================================

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-2 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          custom={i}
          variants={dotVariants}
          animate="animate"
          className="block h-2 w-2 rounded-full bg-[#1E4DB7]/60 dark:bg-blue-400/60"
        />
      ))}
    </div>
  );
}

function ShowProductsAction({ payload }: { payload: Record<string, any> }) {
  const products: ChatProduct[] = payload.products || [];

  if (products.length === 0) return null;

  return (
    <div className="mt-2 -mx-1">
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-slate-600">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => {
              // This would integrate with the cart system
              // For now, navigate to the product page
              window.open(`/store/${product.slug}`, "_blank");
            }}
          />
        ))}
      </div>
    </div>
  );
}

function NavigateAction({ payload }: { payload: Record<string, any> }) {
  const url: string = payload.url || "/store";
  const label: string = payload.label || "View page";

  return (
    <div className="mt-2">
      <Link
        href={url}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1E4DB7]/10 dark:bg-blue-500/20 text-[#1E4DB7] dark:text-blue-300 hover:bg-[#1E4DB7]/20 dark:hover:bg-blue-500/30 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]"
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

function AddToCartAction({ payload }: { payload: Record<string, any> }) {
  const productId: string = payload.productId || "";
  const productTitle: string = payload.title || "Product";

  return (
    <div className="mt-2">
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          // Integration with cart would happen here
          window.open(`/store/${payload.slug || productId}`, "_blank");
        }}
        aria-label={`Add ${productTitle} to cart`}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F59A23] hover:bg-[#E86A1D] text-white transition-colors duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59A23]"
      >
        <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
        Add to Cart
      </motion.button>
    </div>
  );
}

function ApplyCouponAction({ payload }: { payload: Record<string, any> }) {
  const [copied, setCopied] = useState(false);
  const code: string = payload.code || "";
  const discount: string = payload.discount || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some environments
    }
  };

  return (
    <div className="mt-2">
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-[#F59A23]/50 bg-[#F59A23]/5 dark:bg-[#F59A23]/10">
        <div className="flex flex-col">
          {discount && (
            <span className="text-[10px] font-medium text-[#E86A1D] dark:text-[#F59A23] uppercase tracking-wide">
              {discount}
            </span>
          )}
          <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white tracking-wider">
            {code}
          </span>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          aria-label={copied ? "Coupon code copied" : `Copy coupon code ${code}`}
          className="flex items-center justify-center h-7 w-7 rounded-md bg-[#F59A23] hover:bg-[#E86A1D] text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59A23]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

function CompareAction({ payload }: { payload: Record<string, any> }) {
  const products: ChatProduct[] = payload.products || [];
  const features: string[] = payload.features || [
    "Price",
    "Rating",
    "Type",
  ];

  if (products.length < 2) return null;

  return (
    <div className="mt-2 overflow-x-auto -mx-1 px-1">
      <table className="w-full text-[11px] border-collapse" role="table">
        <thead>
          <tr>
            <th className="text-left py-1 px-2 font-medium text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-slate-700">
              Feature
            </th>
            {products.map((p) => (
              <th
                key={p.id}
                className="text-left py-1 px-2 font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-slate-700 max-w-[100px] truncate"
              >
                <Link
                  href={`/store/${p.slug}`}
                  className="hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
                >
                  {p.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature}>
              <td className="py-1 px-2 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-slate-700/50">
                {feature}
              </td>
              {products.map((p) => (
                <td
                  key={p.id}
                  className="py-1 px-2 text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-slate-700/50"
                >
                  {feature === "Price"
                    ? p.price === 0
                      ? "Free"
                      : `$${p.price.toFixed(2)}`
                    : feature === "Rating"
                      ? `${p.averageRating.toFixed(1)} (${p.totalReviews})`
                      : feature === "Type"
                        ? p.type
                        : (payload.featureValues?.[feature]?.[p.id] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Action Dispatcher
// =============================================================================

function ActionRenderer({
  action,
  onSendMessage,
}: {
  action: AssistantAction;
  onSendMessage?: (text: string) => void;
}) {
  switch (action.type) {
    case "show_products":
      return <ShowProductsAction payload={action.payload} />;
    case "navigate":
      return <NavigateAction payload={action.payload} />;
    case "add_to_cart":
      return <AddToCartAction payload={action.payload} />;
    case "apply_coupon":
      return <ApplyCouponAction payload={action.payload} />;
    case "compare":
      return <CompareAction payload={action.payload} />;
    case "plain_text":
    default:
      return null;
  }
}

// =============================================================================
// Main Component
// =============================================================================

export function ChatMessageBubble({
  message,
  onSendMessage,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // Typing indicator
  if (message.isTyping) {
    return (
      <motion.div
        variants={bubbleVariants}
        initial="initial"
        animate="animate"
        className="flex justify-start"
      >
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-neutral-100 dark:border-slate-700 shadow-sm">
          <TypingIndicator />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={[
          "max-w-[85%]",
          isUser
            ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-[#1E4DB7] text-white shadow-sm"
            : "px-4 py-2.5 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-slate-700 shadow-sm",
        ].join(" ")}
      >
        {/* Message content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Inline actions */}
        {isAssistant && message.actions && message.actions.length > 0 && (
          <div className="space-y-2">
            {message.actions.map((action, idx) => (
              <ActionRenderer
                key={`${action.type}-${idx}`}
                action={action}
                onSendMessage={onSendMessage}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={[
            "text-[10px] mt-1",
            isUser
              ? "text-white/60 text-right"
              : "text-neutral-400 dark:text-neutral-500",
          ].join(" ")}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
