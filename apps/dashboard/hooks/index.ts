/**
 * Authentication Hooks
 *
 * Export all authentication-related hooks for easy importing.
 *
 * @example
 * ```tsx
 * import { useAuth, useUser, useIsAdmin } from "@/hooks";
 * ```
 */

export {
    useAuth,
    useIsAuthenticated,
    useAuthLoading,
    useAuthError,
} from "./use-auth";

export {
    useUser,
    useUserRole,
    useIsAdmin,
    useHasRole,
    type UserData,
} from "./use-user";

export {
    useGenerateTitles,
    useGenerateMetaDescription,
    useGenerateExcerpt,
    useGenerateOutline,
    useAnalyzeContent,
    useImproveText,
    useGenerateAltText,
    type ContentAnalysis,
    type WritingTone,
} from "./use-ai";
