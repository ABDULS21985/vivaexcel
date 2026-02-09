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

export {
    useOrders,
    useOrder,
    useOrderStats,
    useRefundOrder,
    orderKeys,
    type Order,
    type OrderItem,
    type DownloadToken,
    type OrderFilters,
    OrderStatus,
} from "./use-orders";

export {
    usePresentations,
    usePresentation,
    useCreatePresentation,
    useUpdatePresentation,
    useDeletePresentation,
    usePresentationSlides,
    useUploadPresentation,
    useReprocessPresentation,
    useAnalyzePresentation,
    useGenerateDescription,
    useSuggestPricing,
    usePresentationStats,
    useBulkDeletePresentations,
    useBulkAnalyzePresentations,
    useUpdateSlide,
    useReorderSlides,
    useRegenerateThumbnails,
    presentationKeys,
    type Presentation,
    type SlidePreview,
    type PresentationFilters,
    type PresentationStats,
    type CreatePresentationDto,
    type UpdatePresentationDto,
    type PresentationIndustry,
    type PresentationType,
    type PresentationFileFormat,
    type PresentationAspectRatio,
    type SlideContentType,
    type ColorScheme,
} from "./use-presentations";

export {
    useSolutionDocuments,
    useSolutionDocument,
    useCreateSolutionDocument,
    useUpdateSolutionDocument,
    useDeleteSolutionDocument,
    useDocumentBundles,
    useDocumentBundle,
    useCreateBundle,
    useUpdateBundle,
    useDeleteBundle,
    useAddToBundle,
    useRemoveFromBundle,
    useDocumentUpdates,
    usePublishUpdate,
    useUploadDocument,
    useAnalyzeDocument,
    useGenerateDocumentDescription,
    useGenerateSeo,
    useGenerateToc,
    useExtractTechStack,
    useSolutionDocumentStats,
    useBulkDeleteDocuments,
    useBulkAnalyzeDocuments,
    solutionDocumentKeys,
    type SolutionDocument,
    type DocumentBundle,
    type DocumentUpdate,
    type TOCItem,
    type SolutionDocumentFilters,
    type SolutionDocumentStats,
    type DocumentBundleFilters,
    type CreateSolutionDocumentDto,
    type UpdateSolutionDocumentDto,
    type CreateDocumentBundleDto,
    type UpdateDocumentBundleDto,
    type DocumentType,
    type Domain,
    type MaturityLevel,
    type DiagramTool,
    type DocumentStatus,
    type CloudPlatform,
    type ComplianceFramework,
    type TemplateFormat,
} from "./use-solution-documents";

export {
    useWebTemplates,
    useWebTemplate,
    useCreateWebTemplate,
    useUpdateWebTemplate,
    useDeleteWebTemplate,
    usePublishWebTemplate,
    useArchiveWebTemplate,
    useTemplateLicenses,
    webTemplateKeys,
} from "./use-web-templates";
