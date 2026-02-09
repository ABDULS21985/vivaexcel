// =============================================================================
// AI Assistant Types
// =============================================================================
// Shared type definitions for the AI Shopping Assistant Chat Widget.

export type AssistantActionType =
  | "plain_text"
  | "show_products"
  | "apply_coupon"
  | "navigate"
  | "add_to_cart"
  | "compare";

export interface AssistantAction {
  type: AssistantActionType;
  payload: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: AssistantAction[];
  isTyping?: boolean;
}

export interface ChatProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
  type: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  actions: AssistantAction[];
  suggestions: string[];
}

export interface ProactiveSuggestion {
  text: string;
  icon?: string;
}
