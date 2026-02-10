"use client";

// =============================================================================
// Chat Panel
// =============================================================================
// The main AI assistant chat panel with header, scrollable message area,
// text input with send button, and quick suggestion chips. Supports both
// desktop (floating panel) and mobile (full-screen overlay) layouts.

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Minimize2,
  X,
  RotateCcw,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useChat } from "./use-chat";
import { ChatMessageBubble } from "./chat-message";
import { QuickChips } from "./quick-chips";

// =============================================================================
// Types
// =============================================================================

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// Animation Variants
// =============================================================================

const panelVariants = {
  // Desktop: slides up from bottom-right
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.95,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: 24,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Mobile: full-screen slide up
const mobilePanelVariants = {
  hidden: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.3, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const welcomeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, type: "spring", stiffness: 200, damping: 20 },
  },
};

// =============================================================================
// Constants
// =============================================================================

const MAX_MESSAGE_LENGTH = 500;

// =============================================================================
// Component
// =============================================================================

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { messages, isLoading, suggestions, sendMessage, clearChat } =
    useChat();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Auto-scroll to bottom when new messages arrive
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ---------------------------------------------------------------------------
  // Focus input when panel opens
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Handle keyboard shortcuts
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ---------------------------------------------------------------------------
  // Send message handler
  // ---------------------------------------------------------------------------
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    sendMessage(trimmed);
    setInputValue("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ---------------------------------------------------------------------------
  // Auto-resize textarea
  // ---------------------------------------------------------------------------
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_MESSAGE_LENGTH) {
        setInputValue(value);
      }

      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Handle chip selection
  // ---------------------------------------------------------------------------
  const handleChipSelect = useCallback(
    (text: string) => {
      if (isLoading) return;
      sendMessage(text);
    },
    [isLoading, sendMessage],
  );

  // ---------------------------------------------------------------------------
  // Determine if we should show the welcome screen
  // ---------------------------------------------------------------------------
  const showWelcome = messages.length === 0;

  // ---------------------------------------------------------------------------
  // Shared inner content (reused in desktop and mobile layouts)
  // ---------------------------------------------------------------------------
  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-slate-700/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* AI avatar */}
          <div className="relative flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] shadow-md">
            <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
            {/* Online status dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900"
              aria-label="Online"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              VivaExcel AI
            </h2>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear chat button */}
          {messages.length > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={clearChat}
              aria-label="Clear chat history"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          )}

          {/* Minimize (desktop) / Close button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            aria-label="Close chat"
            className="flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]"
          >
            {/* Show Minimize2 on desktop, X on mobile */}
            <Minimize2
              className="h-4 w-4 hidden lg:block"
              aria-hidden="true"
            />
            <X className="h-4 w-4 lg:hidden" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Messages Area                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {/* Welcome screen */}
        {showWelcome && (
          <motion.div
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center h-full text-center px-4 py-8"
          >
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] shadow-lg mb-4">
              <MessageCircle
                className="h-8 w-8 text-white"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1.5">
              Hi there! I'm your AI assistant
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[260px] leading-relaxed">
              I can help you find the perfect digital products, compare options,
              and discover great deals.
            </p>
          </motion.div>
        )}

        {/* Message bubbles */}
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              onSendMessage={sendMessage}
            />
          ))}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Quick Suggestion Chips                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-3 pt-1 flex-shrink-0">
        <QuickChips
          suggestions={suggestions}
          onSelect={handleChipSelect}
          disabled={isLoading}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Input Area                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-3 pb-3 pt-2 flex-shrink-0">
        <div className="flex items-end gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700/50 focus-within:border-[#1E4DB7] dark:focus-within:border-blue-500 transition-colors duration-200">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isLoading}
            aria-label="Type your message"
            className={[
              "flex-1 resize-none",
              "bg-transparent",
              "text-sm text-neutral-900 dark:text-white",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:outline-none",
              "max-h-24",
              "leading-relaxed",
              "disabled:opacity-50",
              "py-1",
            ].join(" ")}
          />

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
            className={[
              "flex items-center justify-center",
              "h-8 w-8 rounded-lg flex-shrink-0",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]",
              inputValue.trim() && !isLoading
                ? "bg-[#1E4DB7] hover:bg-[#143A8F] text-white shadow-sm cursor-pointer"
                : "bg-neutral-200 dark:bg-slate-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed",
            ].join(" ")}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Character count */}
        {inputValue.length > MAX_MESSAGE_LENGTH * 0.8 && (
          <p
            className={[
              "text-[10px] text-right mt-1 pr-1",
              inputValue.length >= MAX_MESSAGE_LENGTH
                ? "text-red-500"
                : "text-neutral-400",
            ].join(" ")}
          >
            {inputValue.length}/{MAX_MESSAGE_LENGTH}
          </p>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ================================================================== */}
      {/* Desktop Panel (hidden below lg)                                    */}
      {/* ================================================================== */}
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-label="AI Shopping Assistant"
        aria-modal="false"
        className={[
          "hidden lg:flex",
          "fixed bottom-24 right-6 z-50",
          "w-[380px] h-[520px] max-h-[70vh]",
          "flex-col",
          "rounded-2xl",
          "bg-white/80 dark:bg-slate-900/80",
          "backdrop-blur-xl",
          "border border-white/20 dark:border-slate-700/30",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "overflow-hidden",
        ].join(" ")}
      >
        {renderContent()}
      </motion.div>

      {/* ================================================================== */}
      {/* Mobile Full-Screen Overlay (visible below lg)                      */}
      {/* ================================================================== */}
      <motion.div
        variants={mobilePanelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-label="AI Shopping Assistant"
        aria-modal="true"
        className={[
          "lg:hidden",
          "fixed inset-0 z-50",
          "flex flex-col",
          "bg-white/95 dark:bg-slate-900/95",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        {renderContent()}
      </motion.div>
    </>
  );
}
