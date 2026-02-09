"use client";

// =============================================================================
// useChat Hook
// =============================================================================
// Custom hook managing all chat state: messages, loading, suggestions,
// conversation tracking, and communication with the AI assistant backend.

import { useState, useCallback, useRef } from "react";
import { apiPost } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { ChatMessage, ChatResponse } from "./types";

// =============================================================================
// Constants
// =============================================================================

const SESSION_KEY = "vivaexcel_chat_session";

const DEFAULT_SUGGESTIONS = [
  "What's popular right now?",
  "Help me find Excel templates",
  "Show me products under $20",
  "Compare presentation templates",
];

// =============================================================================
// Session Helpers
// =============================================================================

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// =============================================================================
// Hook
// =============================================================================

export function useChat() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const messageIdCounter = useRef(0);

  const generateId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg_${messageIdCounter.current}_${Date.now()}`;
  }, []);

  // ---------------------------------------------------------------------------
  // Send a message to the AI assistant
  // ---------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (text: string, context?: Record<string, any>) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Insert a typing indicator message
      const typingId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isTyping: true,
        },
      ]);

      try {
        const response = await apiPost<{ data: ChatResponse }>(
          "/ai-assistant/chat",
          {
            message: trimmed,
            conversationId,
            sessionId: getSessionId(),
            context: {
              ...context,
              isAuthenticated,
            },
          },
        );

        const data = response.data;

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          actions: data.actions,
        };

        // Replace typing indicator with the real response
        setMessages((prev) =>
          prev.filter((m) => m.id !== typingId).concat(assistantMessage),
        );

        if (data.suggestions?.length > 0) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // Replace typing indicator with an error message
        setMessages((prev) =>
          prev.filter((m) => m.id !== typingId).concat({
            id: generateId(),
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date(),
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, generateId, isAuthenticated],
  );

  // ---------------------------------------------------------------------------
  // Clear the conversation and reset state
  // ---------------------------------------------------------------------------
  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setSuggestions(DEFAULT_SUGGESTIONS);
    messageIdCounter.current = 0;
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    conversationId,
    sendMessage,
    clearChat,
  };
}
