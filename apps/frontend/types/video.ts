// =============================================================================
// Video Blog Types
// =============================================================================

export interface VideoChannel {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  subscriberCount: number;
  isVerified: boolean;
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  channel: VideoChannel;
  category: VideoCategory;
  tags: string[];
  isLive?: boolean;
  isPremium?: boolean;
}

export interface VideoShort {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  channel: VideoChannel;
  publishedAt: string;
}

export interface VideoFilters {
  categorySlug?: string;
  search?: string;
  sortBy?: "latest" | "popular" | "trending";
  page?: number;
  pageSize?: number;
}

export interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VideoShortsResponse {
  shorts: VideoShort[];
  total: number;
}
