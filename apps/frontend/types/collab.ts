// =============================================================================
// VivaExcel Collab Types
// =============================================================================

export interface CollabUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isVerified: boolean;
  isPremium?: boolean;
  followerCount: number;
  followingCount: number;
}

export interface PostMedia {
  id: string;
  type: "image" | "video" | "gif";
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface PostPoll {
  id: string;
  options: { label: string; votes: number }[];
  totalVotes: number;
  endsAt: string;
}

export interface CollabPost {
  id: string;
  author: CollabUser;
  content: string;
  media?: PostMedia[];
  poll?: PostPoll;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  viewCount: number;
  bookmarkCount: number;
  publishedAt: string;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  replyTo?: { author: CollabUser; id: string };
  tags?: string[];
}

export interface TrendingTopic {
  id: string;
  category: string;
  title: string;
  postCount: number;
}

export interface LiveEvent {
  id: string;
  host: string;
  hostAvatar: string;
  title: string;
  listenerCount: number;
  isHostVerified: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  timeAgo: string;
  category: string;
  postCount: number;
  avatars: string[];
}

export type FeedTab = "for-you" | "following" | "excel" | "ai" | "data";

export interface CollabFilters {
  tab: FeedTab;
  page?: number;
  pageSize?: number;
}
