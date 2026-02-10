export enum AchievementCategory {
  BUYER = 'buyer',
  SELLER = 'seller',
  REVIEWER = 'reviewer',
  COMMUNITY = 'community',
  EXPLORER = 'explorer',
  COLLECTOR = 'collector',
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum XPSource {
  PURCHASE = 'purchase',
  REVIEW = 'review',
  REFERRAL = 'referral',
  DAILY_LOGIN = 'daily_login',
  ACHIEVEMENT = 'achievement',
  STREAK_BONUS = 'streak_bonus',
  SALE = 'sale',
  PRODUCT_UPLOAD = 'product_upload',
  SHOWCASE_CREATED = 'showcase_created',
  THREAD_CREATED = 'thread_created',
  REPLY_CREATED = 'reply_created',
  ANSWER_ACCEPTED = 'answer_accepted',
  QUESTION_ASKED = 'question_asked',
}

export enum LeaderboardPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

export enum LeaderboardCategory {
  BUYER_XP = 'buyer_xp',
  SELLER_REVENUE = 'seller_revenue',
  REVIEWER = 'reviewer',
  REFERRER = 'referrer',
}
