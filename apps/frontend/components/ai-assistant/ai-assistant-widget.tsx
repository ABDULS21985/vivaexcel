"use client";

// =============================================================================
// AI Assistant Widget
// =============================================================================
// The top-level wrapper that combines the floating ChatButton and the ChatPanel.
// Manages the open/close state and coordinates AnimatePresence transitions.

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatButton } from "./chat-button";
import { ChatPanel } from "./chat-panel";

// =============================================================================
// Component
// =============================================================================

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      // When opening, clear unread
      if (!prev) {
        setHasUnread(false);
      }
      return !prev;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <ChatButton
        isOpen={isOpen}
        onClick={handleToggle}
        hasUnread={hasUnread}
      />
      <AnimatePresence>
        {isOpen && <ChatPanel isOpen={isOpen} onClose={handleClose} />}
      </AnimatePresence>
    </>
  );
}
