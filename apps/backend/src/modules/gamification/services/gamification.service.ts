import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CacheService } from '../../../common/cache/cache.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { GamificationRepository } from '../gamification.repository';
import { UserXP } from '../entities/user-xp.entity';
import { Achievement } from '../entities/achievement.entity';
import {
  XPSource,
  LeaderboardPeriod,
  LeaderboardCategory,
} from '../enums/gamification.enums';
import {
  AchievementsQueryDto,
  LeaderboardQueryDto,
  ActivityQueryDto,
} from '../dto';

// ─── Constants ────────────────────────────────────────────────────────────

const CACHE_TAG = 'gamification';
const CACHE_TTL_PROFILE = 300;
const CACHE_TTL_ACHIEVEMENTS = 600;
const CACHE_TTL_LEADERBOARD = 300;

const STREAK_BONUS_MAP: Record<number, number> = {
  7: 50,
  14: 100,
  30: 250,
  60: 500,
  100: 1000,
};

const LEVEL_UP_CREDIT_BONUSES: Record<number, number> = {
  10: 100,
  25: 250,
  50: 500,
  75: 750,
  100: 1000,
};

// Mapping from achievement requirement type → trigger types that should check it
const REQUIREMENT_TRIGGERS: Record<string, string[]> = {
  purchase_count: ['purchase'],
  total_spend: ['purchase'],
  review_count: ['review'],
  helpful_votes: ['review'],
  sale_count: ['sale'],
  seller_revenue: ['sale'],
  product_count: ['product_upload'],
  streak_days: ['login'],
  distinct_categories_purchased: ['purchase'],
  owned_products: ['purchase'],
  purchase_time_range: ['purchase'],
  consecutive_five_star_reviews: ['review'],
};

// ─── Service ──────────────────────────────────────────────────────────────

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly repository: GamificationRepository,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── Public API Methods ───────────────────────────────────────────

  async getProfile(userId: string) {
    const cacheKey = this.cacheService.generateKey('gamification', 'profile', userId);
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const xp = await this.repository.findOrCreateUserXP(userId);
        const achievements = await this.repository.findUserAchievements(userId);
        const { items: recentActivity } = await this.repository.findXPTransactions(
          userId,
          undefined,
          10,
        );

        const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

        return {
          status: 'success' as const,
          message: 'Gamification profile retrieved',
          data: {
            xp: {
              totalXP: xp.totalXP,
              level: xp.level,
              currentLevelXP: xp.currentLevelXP,
              nextLevelXP: xp.nextLevelXP,
              title: xp.title,
              streak: xp.streak,
              longestStreak: xp.longestStreak,
              lastActiveDate: xp.lastActiveDate,
              streakFreezeAvailable: xp.streakFreezeAvailable,
            },
            achievements: achievements.map((ua) => ({
              id: ua.id,
              achievementId: ua.achievementId,
              achievement: ua.achievement,
              progress: Number(ua.progress),
              unlockedAt: ua.unlockedAt,
            })),
            recentActivity,
            stats: {
              unlockedCount,
              totalAchievements: achievements.length,
            },
          },
        };
      },
      { ttl: CACHE_TTL_PROFILE, tags: [CACHE_TAG, `${CACHE_TAG}:profile:${userId}`] },
    );
  }

  async getAllAchievements(query: AchievementsQueryDto, userId?: string) {
    const cacheKey = this.cacheService.generateKey('gamification', 'achievements', query);
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const achievements = await this.repository.findAllAchievements(query);

        let userAchievementMap = new Map<string, { progress: number; unlockedAt: Date | null }>();
        if (userId) {
          const userAchievements = await this.repository.findUserAchievements(userId);
          for (const ua of userAchievements) {
            userAchievementMap.set(ua.achievementId, {
              progress: Number(ua.progress),
              unlockedAt: ua.unlockedAt,
            });
          }
        }

        const mapped = achievements.map((a) => {
          const userProgress = userAchievementMap.get(a.id);
          const isUnlocked = !!userProgress?.unlockedAt;

          // Mask secret achievements that haven't been unlocked
          if (a.isSecret && !isUnlocked) {
            return {
              id: a.id,
              slug: a.slug,
              name: '???',
              description: 'Hidden Achievement',
              category: a.category,
              tier: a.tier,
              iconUrl: null,
              badgeColor: a.badgeColor,
              xpReward: a.xpReward,
              isSecret: true,
              sortOrder: a.sortOrder,
              userProgress: userProgress?.progress ?? 0,
              unlockedAt: null,
            };
          }

          return {
            id: a.id,
            slug: a.slug,
            name: a.name,
            description: a.description,
            category: a.category,
            tier: a.tier,
            iconUrl: a.iconUrl,
            badgeColor: a.badgeColor,
            xpReward: a.xpReward,
            isSecret: a.isSecret,
            sortOrder: a.sortOrder,
            userProgress: userProgress?.progress ?? 0,
            unlockedAt: userProgress?.unlockedAt ?? null,
          };
        });

        return {
          status: 'success' as const,
          message: 'Achievements retrieved',
          data: mapped,
        };
      },
      { ttl: CACHE_TTL_ACHIEVEMENTS, tags: [CACHE_TAG, `${CACHE_TAG}:achievements`] },
    );
  }

  async getAchievementDetail(slug: string, userId?: string) {
    const achievement = await this.repository.findAchievementBySlug(slug);
    if (!achievement) {
      return {
        status: 'error' as const,
        message: 'Achievement not found',
        data: null,
      };
    }

    let userProgress = null;
    if (userId) {
      const ua = await this.repository.findUserAchievement(userId, achievement.id);
      if (ua) {
        userProgress = {
          id: ua.id,
          progress: Number(ua.progress),
          unlockedAt: ua.unlockedAt,
          metadata: ua.metadata,
        };
      }
    }

    // Mask secret if not unlocked
    const isUnlocked = !!userProgress?.unlockedAt;
    if (achievement.isSecret && !isUnlocked) {
      return {
        status: 'success' as const,
        message: 'Achievement retrieved',
        data: {
          achievement: {
            ...achievement,
            name: '???',
            description: 'Hidden Achievement',
          },
          userProgress,
        },
      };
    }

    return {
      status: 'success' as const,
      message: 'Achievement retrieved',
      data: { achievement, userProgress },
    };
  }

  async getLeaderboard(query: LeaderboardQueryDto) {
    const period = query.period ?? LeaderboardPeriod.WEEKLY;
    const category = query.category ?? LeaderboardCategory.BUYER_XP;
    const limit = query.limit ?? 20;

    const cacheKey = this.cacheService.generateKey(
      'gamification',
      'leaderboard',
      period,
      category,
    );

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const entries = await this.repository.getLeaderboard(period, category, limit);

        return {
          status: 'success' as const,
          message: 'Leaderboard retrieved',
          data: {
            period,
            category,
            items: entries.map((e) => ({
              userId: e.userId,
              userName: e.user?.firstName
                ? `${e.user.firstName} ${e.user.lastName ?? ''}`.trim()
                : 'Anonymous',
              userAvatar: e.user?.avatar,
              score: e.score,
              rank: e.rank,
            })),
          },
        };
      },
      { ttl: CACHE_TTL_LEADERBOARD, tags: [CACHE_TAG, `${CACHE_TAG}:leaderboard`] },
    );
  }

  async getActivity(userId: string, query: ActivityQueryDto) {
    const limit = query.limit ?? 20;
    const result = await this.repository.findXPTransactions(
      userId,
      query.cursor,
      limit,
    );

    return {
      status: 'success' as const,
      message: 'Activity retrieved',
      data: {
        items: result.items,
        nextCursor: result.nextCursor,
      },
    };
  }

  async freezeStreak(userId: string) {
    const xp = await this.repository.findOrCreateUserXP(userId);

    if (xp.streakFreezeAvailable <= 0) {
      throw new BadRequestException('No streak freeze available');
    }

    await this.repository.updateUserXP(userId, {
      streakFreezeAvailable: xp.streakFreezeAvailable - 1,
      streakFreezeUsedAt: new Date(),
    } as Partial<UserXP>);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:profile:${userId}`]);

    return {
      status: 'success' as const,
      message: 'Streak freeze activated',
      data: {
        streakFreezeAvailable: xp.streakFreezeAvailable - 1,
        streak: xp.streak,
      },
    };
  }

  // ─── Internal: XP & Leveling ──────────────────────────────────────

  async grantXP(
    userId: string,
    amount: number,
    source: XPSource,
    referenceId?: string,
    description?: string,
  ): Promise<void> {
    // Create transaction record
    await this.repository.createXPTransaction({
      userId,
      amount,
      source,
      referenceId: referenceId ?? null,
      description: description ?? `${source} reward`,
    });

    // Update totals
    const xp = await this.repository.findOrCreateUserXP(userId);
    const newTotalXP = xp.totalXP + amount;
    const levelInfo = this.calculateLevel(newTotalXP);
    const newTitle = this.getTitleForLevel(levelInfo.level);
    const didLevelUp = levelInfo.level > xp.level;

    await this.repository.updateUserXP(userId, {
      totalXP: newTotalXP,
      level: levelInfo.level,
      currentLevelXP: levelInfo.currentLevelXP,
      nextLevelXP: levelInfo.nextLevelXP,
      title: newTitle,
    } as Partial<UserXP>);

    // Send XP notification
    this.notificationsService.notifyUser(userId, {
      title: 'XP Earned!',
      message: `+${amount} XP — ${description ?? source}`,
      type: 'success',
      data: { type: 'xp_earned', amount, source, totalXP: newTotalXP },
    });

    // Handle level-up
    if (didLevelUp) {
      this.logger.log(
        `User ${userId} leveled up: ${xp.level} → ${levelInfo.level} (${newTitle})`,
      );

      this.notificationsService.notifyUser(userId, {
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${levelInfo.level} — ${newTitle}`,
        type: 'success',
        data: {
          type: 'gamification.level_up',
          level: levelInfo.level,
          title: newTitle,
        },
      });

      // Credit bonus at milestone levels
      const creditBonus = LEVEL_UP_CREDIT_BONUSES[levelInfo.level];
      if (creditBonus) {
        this.logger.log(
          `Granting ${creditBonus} credits to user ${userId} for reaching level ${levelInfo.level}`,
        );
      }

      this.eventEmitter.emit('gamification.level_up', {
        userId,
        level: levelInfo.level,
        title: newTitle,
      });
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([`${CACHE_TAG}:profile:${userId}`]);
  }

  // ─── Internal: Achievement Evaluation ─────────────────────────────

  async checkAndUpdateAchievements(
    userId: string,
    triggerType: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Find which requirement types match this trigger
    const requirementTypes = Object.entries(REQUIREMENT_TRIGGERS)
      .filter(([, triggers]) => triggers.includes(triggerType))
      .map(([reqType]) => reqType);

    if (requirementTypes.length === 0) return;

    // Fetch relevant achievements
    const achievements: Achievement[] = [];
    for (const reqType of requirementTypes) {
      const found = await this.repository.findAchievementsByRequirementType(reqType);
      achievements.push(...found);
    }

    // Evaluate each
    for (const achievement of achievements) {
      try {
        await this.evaluateAchievement(userId, achievement, metadata);
      } catch (err) {
        this.logger.error(
          `Error evaluating achievement ${achievement.slug} for user ${userId}: ${err}`,
        );
      }
    }
  }

  private async evaluateAchievement(
    userId: string,
    achievement: Achievement,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const requirement = achievement.requirement;
    const type = requirement.type as string;
    const threshold = requirement.threshold as number;

    let currentValue = 0;

    switch (type) {
      case 'purchase_count':
        currentValue = await this.repository.countUserCompletedOrders(userId);
        break;
      case 'total_spend':
        currentValue = await this.repository.getUserTotalSpend(userId);
        break;
      case 'review_count':
        currentValue = await this.repository.countUserReviews(userId);
        break;
      case 'helpful_votes':
        currentValue = await this.repository.getUserTotalHelpfulVotes(userId);
        break;
      case 'sale_count': {
        const stats = await this.repository.getSellerStats(userId);
        currentValue = stats.totalSales;
        break;
      }
      case 'seller_revenue': {
        const stats = await this.repository.getSellerStats(userId);
        currentValue = stats.totalRevenue;
        break;
      }
      case 'product_count':
        currentValue = await this.repository.countUserProducts(userId);
        break;
      case 'streak_days': {
        const xp = await this.repository.findOrCreateUserXP(userId);
        currentValue = xp.streak;
        break;
      }
      case 'distinct_categories_purchased':
        currentValue = await this.repository.countUserDistinctCategories(userId);
        break;
      case 'owned_products':
        currentValue = await this.repository.countUserOwnedProducts(userId);
        break;
      case 'purchase_time_range': {
        // Check if the purchase happened within the specified hour range
        const purchaseHour = metadata?.purchaseHour ?? new Date().getHours();
        const start = requirement.start as number;
        const end = requirement.end as number;
        currentValue = purchaseHour >= start && purchaseHour < end ? 1 : 0;
        break;
      }
      default:
        return;
    }

    // Calculate progress
    const progress =
      type === 'purchase_time_range'
        ? currentValue > 0
          ? 100
          : 0
        : Math.min(100, (currentValue / threshold) * 100);

    // Get or create user achievement
    const ua = await this.repository.findOrCreateUserAchievement(
      userId,
      achievement.id,
    );

    // Already unlocked? Skip
    if (ua.unlockedAt) return;

    // Update progress
    const roundedProgress = Math.round(progress * 100) / 100;

    if (roundedProgress >= 100) {
      // Unlock!
      await this.repository.updateUserAchievementProgress(
        ua.id,
        100,
        new Date(),
      );

      this.logger.log(
        `Achievement unlocked: ${achievement.slug} for user ${userId}`,
      );

      // Grant XP
      await this.grantXP(
        userId,
        achievement.xpReward,
        XPSource.ACHIEVEMENT,
        achievement.id,
        `Achievement: ${achievement.name}`,
      );

      // Send achievement notification
      this.notificationsService.notifyUser(userId, {
        title: 'Achievement Unlocked!',
        message: `${achievement.name} — ${achievement.description}`,
        type: 'success',
        data: {
          type: 'gamification.achievement_unlocked',
          achievement: {
            id: achievement.id,
            slug: achievement.slug,
            name: achievement.name,
            description: achievement.description,
            tier: achievement.tier,
            badgeColor: achievement.badgeColor,
            xpReward: achievement.xpReward,
          },
        },
      });

      this.eventEmitter.emit('gamification.achievement_unlocked', {
        userId,
        achievementId: achievement.id,
        achievementSlug: achievement.slug,
      });
    } else if (roundedProgress > Number(ua.progress)) {
      // Just update progress
      await this.repository.updateUserAchievementProgress(
        ua.id,
        roundedProgress,
      );
    }
  }

  // ─── Internal: Streak Management ──────────────────────────────────

  async updateStreak(userId: string): Promise<void> {
    const xp = await this.repository.findOrCreateUserXP(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = xp.lastActiveDate
      ? new Date(xp.lastActiveDate)
      : null;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    const todayStr = today.toISOString().split('T')[0];
    const lastStr = lastActive?.toISOString().split('T')[0];

    // Same day — no-op
    if (todayStr === lastStr) return;

    const diffMs = lastActive ? today.getTime() - lastActive.getTime() : 0;
    const diffDays = lastActive ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;

    let newStreak = xp.streak;

    if (!lastActive) {
      // First login ever
      newStreak = 1;
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = xp.streak + 1;
    } else if (diffDays === 2 && xp.streakFreezeUsedAt) {
      // Streak freeze was used (skip one day)
      const freezeDate = new Date(xp.streakFreezeUsedAt);
      freezeDate.setHours(0, 0, 0, 0);
      const freezeStr = freezeDate.toISOString().split('T')[0];
      const yesterdayStr = new Date(today.getTime() - 86400000)
        .toISOString()
        .split('T')[0];

      if (freezeStr === yesterdayStr || freezeStr === todayStr) {
        newStreak = xp.streak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      // Streak broken
      newStreak = 1;
    }

    const newLongestStreak = Math.max(xp.longestStreak, newStreak);

    // Grant streak freeze at 7-day milestones
    const newFreezeAvailable =
      newStreak > 0 && newStreak % 7 === 0
        ? xp.streakFreezeAvailable + 1
        : xp.streakFreezeAvailable;

    await this.repository.updateUserXP(userId, {
      streak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: today,
      streakFreezeAvailable: newFreezeAvailable,
      streakFreezeUsedAt: null,
    } as Partial<UserXP>);

    // Grant daily login XP
    await this.grantXP(
      userId,
      10,
      XPSource.DAILY_LOGIN,
      undefined,
      'Daily login bonus',
    );

    // Check for streak bonus
    const streakBonus = STREAK_BONUS_MAP[newStreak];
    if (streakBonus) {
      await this.grantXP(
        userId,
        streakBonus,
        XPSource.STREAK_BONUS,
        undefined,
        `${newStreak}-day streak bonus!`,
      );
    }
  }

  // ─── Pure Functions: Level Calculation ────────────────────────────

  calculateLevel(totalXP: number): {
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
  } {
    let level = 1;
    let xpUsed = 0;

    while (level < 100) {
      const xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
      if (xpUsed + xpForNextLevel > totalXP) {
        return {
          level,
          currentLevelXP: totalXP - xpUsed,
          nextLevelXP: xpForNextLevel,
        };
      }
      xpUsed += xpForNextLevel;
      level++;
    }

    return {
      level: 100,
      currentLevelXP: totalXP - xpUsed,
      nextLevelXP: 0,
    };
  }

  getTitleForLevel(level: number): string {
    if (level <= 4) return 'Newcomer';
    if (level <= 9) return 'Explorer';
    if (level <= 19) return 'Enthusiast';
    if (level <= 34) return 'Expert';
    if (level <= 49) return 'Master';
    return 'Legend';
  }

  // ─── Event Handlers ───────────────────────────────────────────────

  @OnEvent('order.completed')
  async handleOrderCompleted(payload: {
    userId: string;
    orderId: string;
    total: number;
  }) {
    this.logger.debug(
      `Handling order.completed for user ${payload.userId}, order ${payload.orderId}`,
    );

    const xpAmount = Math.max(10, Math.round(payload.total * 10));
    await this.grantXP(
      payload.userId,
      xpAmount,
      XPSource.PURCHASE,
      payload.orderId,
      'Purchase completed',
    );

    const purchaseHour = new Date().getHours();
    await this.checkAndUpdateAchievements(payload.userId, 'purchase', {
      purchaseHour,
    });
  }

  @OnEvent('review.created')
  async handleReviewCreated(payload: {
    productId: string;
    reviewId: string;
    userId?: string;
  }) {
    if (!payload.userId) return;

    this.logger.debug(
      `Handling review.created for user ${payload.userId}`,
    );

    await this.grantXP(
      payload.userId,
      50,
      XPSource.REVIEW,
      payload.reviewId,
      'Review submitted',
    );

    await this.checkAndUpdateAchievements(payload.userId, 'review');
  }

  @OnEvent('seller.sale_made')
  async handleSaleMade(payload: {
    sellerId: string;
    orderId: string;
    amount: number;
  }) {
    this.logger.debug(
      `Handling seller.sale_made for seller ${payload.sellerId}`,
    );

    const xpAmount = Math.max(10, Math.round(payload.amount * 5));
    await this.grantXP(
      payload.sellerId,
      xpAmount,
      XPSource.SALE,
      payload.orderId,
      'Product sold',
    );

    await this.checkAndUpdateAchievements(payload.sellerId, 'sale');
  }

  @OnEvent('user.login')
  async handleUserLogin(payload: { userId: string }) {
    this.logger.debug(`Handling user.login for user ${payload.userId}`);
    await this.updateStreak(payload.userId);
    await this.checkAndUpdateAchievements(payload.userId, 'login');
  }

  @OnEvent('product.uploaded')
  async handleProductUploaded(payload: {
    userId: string;
    productId: string;
  }) {
    this.logger.debug(
      `Handling product.uploaded for user ${payload.userId}`,
    );

    await this.grantXP(
      payload.userId,
      100,
      XPSource.PRODUCT_UPLOAD,
      payload.productId,
      'Product uploaded',
    );

    await this.checkAndUpdateAchievements(payload.userId, 'product_upload');
  }
}
