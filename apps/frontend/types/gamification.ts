export enum AchievementCategory {
  BUYER = "buyer",
  SELLER = "seller",
  REVIEWER = "reviewer",
  COMMUNITY = "community",
  EXPLORER = "explorer",
  COLLECTOR = "collector",
}

export enum AchievementTier {
  BRONZE = "bronze",
  SILVER = "silver",
  GOLD = "gold",
  PLATINUM = "platinum",
  DIAMOND = "diamond",
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  [AchievementTier.BRONZE]: "#CD7F32",
  [AchievementTier.SILVER]: "#C0C0C0",
  [AchievementTier.GOLD]: "#FFD700",
  [AchievementTier.PLATINUM]: "#E5E4E2",
  [AchievementTier.DIAMOND]: "#B9F2FF",
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  [AchievementCategory.BUYER]: "Buyer",
  [AchievementCategory.SELLER]: "Seller",
  [AchievementCategory.REVIEWER]: "Reviewer",
  [AchievementCategory.COMMUNITY]: "Community",
  [AchievementCategory.EXPLORER]: "Explorer",
  [AchievementCategory.COLLECTOR]: "Collector",
};

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  iconUrl?: string | null;
  badgeColor?: string | null;
  xpReward: number;
  creditReward?: number | null;
  isSecret: boolean;
  sortOrder: number;
  userProgress?: number;
  unlockedAt?: string | null;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  progress: number;
  unlockedAt: string | null;
}

export interface UserXP {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  title: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakFreezeAvailable: number;
}

export interface XPTransaction {
  id: string;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

export interface GamificationProfile {
  xp: UserXP;
  achievements: UserAchievement[];
  recentActivity: XPTransaction[];
  stats: {
    unlockedCount: number;
    totalAchievements: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  rank: number;
}

export interface LeaderboardResponse {
  period: string;
  category: string;
  items: LeaderboardEntry[];
}
