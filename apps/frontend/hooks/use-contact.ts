import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api-client";

// =============================================================================
// Contact Types
// =============================================================================

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Submit the contact form to the backend API.
 */
export function useSubmitContact() {
  return useMutation({
    mutationFn: async (data: ContactFormData): Promise<ContactResponse> => {
      return apiPost<ContactResponse>("/contact", data, { skipAuth: true });
    },
  });
}
