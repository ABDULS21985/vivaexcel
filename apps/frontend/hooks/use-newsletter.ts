import { useMutation } from "@tanstack/react-query";
import { apiPost, ApiError } from "@/lib/api-client";

// =============================================================================
// Newsletter Types
// =============================================================================

interface SubscribeRequest {
  email: string;
  name?: string;
  tags?: string[];
}

interface SubscribeResponse {
  success: boolean;
  message: string;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Subscribe to the newsletter.
 * Handles "already subscribed" gracefully and returns appropriate messages.
 */
export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (data: SubscribeRequest): Promise<SubscribeResponse> => {
      try {
        const response = await apiPost<SubscribeResponse>(
          "/newsletter/subscribe",
          data,
          { skipAuth: true }
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle "already subscribed" as a soft success
          if (error.status === 409) {
            return {
              success: true,
              message: "You are already subscribed to our newsletter.",
            };
          }
          throw error;
        }
        throw error;
      }
    },
  });
}
