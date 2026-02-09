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

export {
    useAnalyticsDashboard,
    useTopPosts,
    useTrafficSources,
    usePostStats,
    analyticsKeys,
    type DashboardOverview,
    type TopPost,
    type TrafficSource,
    type PostStats,
} from "./use-analytics";

export {
    useAllComments,
    useApproveComment,
    useRejectComment,
    useSpamComment,
    useDeleteComment,
    commentKeys,
    type Comment,
    type CommentFilters,
} from "./use-comments";

export {
    useMediaList,
    useMediaFolders,
    useUploadMedia,
    useUpdateMedia,
    useDeleteMedia,
    useCreateFolder,
    useDeleteFolder,
    mediaKeys,
    type MediaAsset,
    type MediaFolder,
    type MediaFilters,
} from "./use-media";

export {
    useNewsletterSubscribers,
    useNewsletterStats,
    useSendNewsletter,
    useScheduleNewsletter,
    useTestNewsletter,
    useDeleteSubscriber,
    newsletterKeys,
    type NewsletterSubscriber,
    type NewsletterStats,
    type SubscriberFilters,
} from "./use-newsletter";

export {
    useDigitalProducts,
    useDigitalProduct,
    useCreateDigitalProduct,
    useUpdateDigitalProduct,
    useDeleteDigitalProduct,
    usePublishDigitalProduct,
    useArchiveDigitalProduct,
    useDigitalProductCategories,
    useDigitalProductTags,
    useCreateDigitalProductCategory,
    useUpdateDigitalProductCategory,
    useDeleteDigitalProductCategory,
    useCreateDigitalProductTag,
    useUpdateDigitalProductTag,
    useDeleteDigitalProductTag,
    digitalProductKeys,
    type DigitalProduct,
    type DigitalProductCategory,
    type DigitalProductTag,
} from "./use-digital-products";
