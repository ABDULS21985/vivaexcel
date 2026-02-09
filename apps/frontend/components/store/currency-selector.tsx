"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import {
  useCurrency,
  CURRENCY_INFO,
  type SupportedCurrency,
} from "@/providers/currency-provider";

export function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const info = CURRENCY_INFO[currency];

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
          setFocusedIndex(
            availableCurrencies.indexOf(currency)
          );
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < availableCurrencies.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : availableCurrencies.length - 1
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0) {
            setCurrency(availableCurrencies[focusedIndex]);
            setOpen(false);
            triggerRef.current?.focus();
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
      }
    },
    [open, focusedIndex, availableCurrencies, currency, setCurrency]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[role='option']");
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, focusedIndex]);

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen(!open);
          if (!open)
            setFocusedIndex(availableCurrencies.indexOf(currency));
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${info.name}. Click to change`}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="text-xs">{info.symbol}</span>
        <span>{currency}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            role="listbox"
            aria-label="Select currency"
            aria-activedescendant={
              focusedIndex >= 0
                ? `currency-${availableCurrencies[focusedIndex]}`
                : undefined
            }
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
          >
            {availableCurrencies.map((c, index) => {
              const cInfo = CURRENCY_INFO[c];
              const isSelected = c === currency;
              const isFocused = index === focusedIndex;

              return (
                <div
                  key={c}
                  id={`currency-${c}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setCurrency(c);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    isFocused
                      ? "bg-neutral-100 dark:bg-neutral-700"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                  } ${
                    isSelected
                      ? "text-[#1E4DB7] dark:text-blue-400 font-semibold"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <span className="w-5 text-center text-base">{cInfo.symbol}</span>
                  <span className="flex-1">
                    {c} — {cInfo.name}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
