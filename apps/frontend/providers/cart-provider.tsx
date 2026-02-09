"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { trackConversion } from "@/lib/conversion-tracking";

// =============================================================================
// Cart Provider
// =============================================================================
// Manages shopping cart state for both guests (via sessionId) and
// authenticated users. Automatically merges guest carts on login.
// Cart data is fetched from the backend and refreshed after mutations.

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CartItem {
  id: string;
  digitalProductId: string;
  variantId?: string;
  product: {
    id: string;
    title: string;
    slug: string;
    featuredImage?: string | null;
    type: string;
    currency: string;
  };
  variant?: {
    id: string;
    name: string;
  } | null;
  unitPrice: number;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  currency: string;
}

interface CartApiResponse {
  items: CartItem[];
  summary: CartSummary;
}

interface CartContextValue {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (productId: string, variantId?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const EMPTY_SUMMARY: CartSummary = {
  subtotal: 0,
  discountAmount: 0,
  total: 0,
  itemCount: 0,
  currency: "USD",
};

const SESSION_STORAGE_KEY = "ktblog_cart_session";

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | undefined>(undefined);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function getOrCreateSessionId(): string {
  let sessionId = getSessionId();
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

function clearSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Track previous auth state for detecting login transitions
  const prevAuthRef = useRef<boolean>(false);
  const hasFetchedRef = useRef<boolean>(false);

  // ----------------------------------
  // Fetch cart from API
  // ----------------------------------
  const fetchCart = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (!isAuthenticated) {
        const sessionId = getSessionId();
        if (sessionId) {
          params.sessionId = sessionId;
        }
      }

      const response = await apiGet<CartApiResponse>("/cart", params);
      setItems(response?.items ?? []);
      setSummary(
        response?.summary ?? {
          ...EMPTY_SUMMARY,
          itemCount: response?.items?.length ?? 0,
        },
      );
    } catch {
      // Cart may not exist yet, set empty state
      setItems([]);
      setSummary(EMPTY_SUMMARY);
    }
  }, [isAuthenticated]);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // ----------------------------------
  // Initial cart fetch
  // ----------------------------------
  useEffect(() => {
    if (authLoading) return;

    async function init() {
      setIsLoading(true);
      await fetchCart();
      setIsLoading(false);
      hasFetchedRef.current = true;
    }

    init();
  }, [authLoading, fetchCart]);

  // ----------------------------------
  // Merge guest cart on login
  // ----------------------------------
  const mergeGuestCart = useCallback(async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await apiPost("/cart/merge", { sessionId });
      clearSessionId();
      await fetchCart();
    } catch {
      // Merge failed silently -- user can still shop
    }
  }, [fetchCart]);

  useEffect(() => {
    if (authLoading) return;

    // Detect transition from not-authenticated to authenticated
    if (isAuthenticated && !prevAuthRef.current && hasFetchedRef.current) {
      const sessionId = getSessionId();
      if (sessionId) {
        mergeGuestCart();
      } else {
        // Just refresh to get the user's server cart
        fetchCart();
      }
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, authLoading, mergeGuestCart, fetchCart]);

  // ----------------------------------
  // Cart drawer controls
  // ----------------------------------
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // ----------------------------------
  // Add to cart
  // ----------------------------------
  const addToCart = useCallback(
    async (digitalProductId: string, variantId?: string) => {
      const sessionId = !isAuthenticated ? getOrCreateSessionId() : undefined;

      await apiPost("/cart/items", {
        digitalProductId,
        variantId,
        ...(sessionId && { sessionId }),
      });

      trackConversion("ADD_TO_CART", { digitalProductId });

      await fetchCart();
    },
    [isAuthenticated, fetchCart],
  );

  // ----------------------------------
  // Remove from cart
  // ----------------------------------
  const removeFromCart = useCallback(
    async (itemId: string) => {
      const params: Record<string, string> = {};
      if (!isAuthenticated) {
        const sessionId = getSessionId();
        if (sessionId) params.sessionId = sessionId;
      }

      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/cart/items/${itemId}${queryString ? `?${queryString}` : ""}`;

      await apiDelete(endpoint);
      await fetchCart();
    },
    [isAuthenticated, fetchCart],
  );

  // ----------------------------------
  // Clear cart
  // ----------------------------------
  const clearCart = useCallback(async () => {
    const params: Record<string, string> = {};
    if (!isAuthenticated) {
      const sessionId = getSessionId();
      if (sessionId) params.sessionId = sessionId;
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/cart${queryString ? `?${queryString}` : ""}`;

    await apiDelete(endpoint);
    setItems([]);
    setSummary(EMPTY_SUMMARY);
  }, [isAuthenticated]);

  // ----------------------------------
  // Context value
  // ----------------------------------
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      summary,
      isLoading,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      removeFromCart,
      clearCart,
      mergeGuestCart,
      refreshCart,
    }),
    [
      items,
      summary,
      isLoading,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      removeFromCart,
      clearCart,
      mergeGuestCart,
      refreshCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

/**
 * Hook to access the cart context.
 * Must be used within a CartProvider.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
