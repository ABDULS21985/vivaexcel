import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserXP } from './entities/user-xp.entity';
import { XPTransaction } from './entities/xp-transaction.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Review } from '../../entities/review.entity';
import { SellerProfile } from '../../entities/seller-profile.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import {
  AchievementCategory,
  AchievementTier,
  LeaderboardPeriod,
  LeaderboardCategory,
} from './enums/gamification.enums';

@Injectable()
export class GamificationRepository {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepo: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private readonly userAchievementRepo: Repository<UserAchievement>,
    @InjectRepository(UserXP)
    private readonly userXPRepo: Repository<UserXP>,
    @InjectRepository(XPTransaction)
    private readonly xpTransactionRepo: Repository<XPTransaction>,
    @InjectRepository(LeaderboardEntry)
    private readonly leaderboardRepo: Repository<LeaderboardEntry>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepo: Repository<DigitalProduct>,
  ) {}

  // ─── Achievement Queries ────────────────────────────────────────────

  async findAllAchievements(options?: {
    category?: AchievementCategory;
    tier?: AchievementTier;
    search?: string;
  }): Promise<Achievement[]> {
    const qb = this.achievementRepo
      .createQueryBuilder('a')
      .where('a.is_active = :active', { active: true })
      .orderBy('a.sort_order', 'ASC');

    if (options?.category) {
      qb.andWhere('a.category = :category', { category: options.category });
    }
    if (options?.tier) {
      qb.andWhere('a.tier = :tier', { tier: options.tier });
    }
    if (options?.search) {
      qb.andWhere('(a.name ILIKE :s OR a.description ILIKE :s)', {
        s: `%${options.search}%`,
      });
    }

    return qb.getMany();
  }

  async findAchievementBySlug(slug: string): Promise<Achievement | null> {
    return this.achievementRepo.findOne({ where: { slug } });
  }

  async findAchievementsByRequirementType(
    type: string,
  ): Promise<Achievement[]> {
    return this.achievementRepo
      .createQueryBuilder('a')
      .where('a.is_active = :active', { active: true })
      .andWhere("a.requirement->>'type' = :type", { type })
      .getMany();
  }

  // ─── User Achievement Queries ───────────────────────────────────────

  async findUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementRepo.find({
      where: { userId },
      relations: ['achievement'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUserAchievement(
    userId: string,
    achievementId: string,
  ): Promise<UserAchievement | null> {
    return this.userAchievementRepo.findOne({
      where: { userId, achievementId },
      relations: ['achievement'],
    });
  }

  async findOrCreateUserAchievement(
    userId: string,
    achievementId: string,
  ): Promise<UserAchievement> {
    let ua = await this.userAchievementRepo.findOne({
      where: { userId, achievementId },
      relations: ['achievement'],
    });
    if (!ua) {
      ua = this.userAchievementRepo.create({
        userId,
        achievementId,
        progress: 0,
        unlockedAt: null,
      });
      ua = await this.userAchievementRepo.save(ua);
      ua = (await this.userAchievementRepo.findOne({
        where: { id: ua.id },
        relations: ['achievement'],
      }))!;
    }
    return ua;
  }

  async updateUserAchievementProgress(
    id: string,
    progress: number,
    unlockedAt?: Date,
  ): Promise<void> {
    const update: Partial<UserAchievement> = { progress };
    if (unlockedAt) {
      update.unlockedAt = unlockedAt;
    }
    await this.userAchievementRepo.update(id, update);
  }

  // ─── UserXP Queries ─────────────────────────────────────────────────

  async findOrCreateUserXP(userId: string): Promise<UserXP> {
    let xp = await this.userXPRepo.findOne({ where: { userId } });
    if (!xp) {
      xp = this.userXPRepo.create({
        userId,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: 100,
        title: 'Newcomer',
        streak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakFreezeAvailable: 0,
      });
      xp = await this.userXPRepo.save(xp);
    }
    return xp;
  }

  async updateUserXP(userId: string, data: Partial<UserXP>): Promise<void> {
    await this.userXPRepo.update({ userId }, data);
  }

  // ─── XP Transaction Queries ─────────────────────────────────────────

  async createXPTransaction(
    data: Partial<XPTransaction>,
  ): Promise<XPTransaction> {
    const tx = this.xpTransactionRepo.create(data);
    return this.xpTransactionRepo.save(tx);
  }

  async findXPTransactions(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{ items: XPTransaction[]; nextCursor: string | null }> {
    const qb = this.xpTransactionRepo
      .createQueryBuilder('tx')
      .where('tx.user_id = :userId', { userId })
      .orderBy('tx.created_at', 'DESC')
      .take(limit + 1);

    if (cursor) {
      qb.andWhere('tx.created_at < :cursor', { cursor: new Date(cursor) });
    }

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    return {
      items,
      nextCursor: hasMore
        ? items[items.length - 1].createdAt.toISOString()
        : null,
    };
  }

  // ─── Leaderboard Queries ────────────────────────────────────────────

  async getLeaderboard(
    period: LeaderboardPeriod,
    category: LeaderboardCategory,
    limit: number = 20,
  ): Promise<LeaderboardEntry[]> {
    return this.leaderboardRepo.find({
      where: { period, category },
      relations: ['user'],
      order: { rank: 'ASC' },
      take: limit,
    });
  }

  async getUserLeaderboardEntry(
    userId: string,
    period: LeaderboardPeriod,
    category: LeaderboardCategory,
  ): Promise<LeaderboardEntry | null> {
    return this.leaderboardRepo.findOne({
      where: { userId, period, category },
    });
  }

  async upsertLeaderboardEntry(
    data: Partial<LeaderboardEntry>,
  ): Promise<void> {
    const existing = await this.leaderboardRepo.findOne({
      where: {
        userId: data.userId,
        period: data.period,
        category: data.category,
        periodStart: data.periodStart,
      },
    });
    if (existing) {
      await this.leaderboardRepo.update(existing.id, {
        score: data.score,
        rank: data.rank,
        periodEnd: data.periodEnd,
      });
    } else {
      const entry = this.leaderboardRepo.create(data);
      await this.leaderboardRepo.save(entry);
    }
  }

  // ─── Stat Queries (for achievement evaluation) ──────────────────────

  async countUserCompletedOrders(userId: string): Promise<number> {
    return this.orderRepo.count({
      where: { userId, status: OrderStatus.COMPLETED },
    });
  }

  async getUserTotalSpend(userId: string): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'total')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();
    return parseFloat(result?.total ?? '0');
  }

  async countUserReviews(userId: string): Promise<number> {
    return this.reviewRepo.count({ where: { userId } });
  }

  async getUserTotalHelpfulVotes(userId: string): Promise<number> {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.helpful_count), 0)', 'total')
      .where('r.user_id = :userId', { userId })
      .getRawOne();
    return parseInt(result?.total ?? '0', 10);
  }

  async getSellerStats(
    userId: string,
  ): Promise<{ totalSales: number; totalRevenue: number }> {
    const profile = await this.sellerProfileRepo.findOne({
      where: { userId },
    });
    return {
      totalSales: profile?.totalSales ?? 0,
      totalRevenue: profile?.totalRevenue ?? 0,
    };
  }

  async countUserProducts(userId: string): Promise<number> {
    return this.digitalProductRepo.count({
      where: { createdBy: userId },
    });
  }

  async countUserDistinctCategories(userId: string): Promise<number> {
    const result = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .innerJoin('oi.digitalProduct', 'dp')
      .select('COUNT(DISTINCT dp.type)', 'count')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();
    return parseInt(result?.count ?? '0', 10);
  }

  async countUserOwnedProducts(userId: string): Promise<number> {
    const result = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .select('COUNT(DISTINCT oi.digital_product_id)', 'count')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();
    return parseInt(result?.count ?? '0', 10);
  }

  // ─── Bulk XP Queries (for leaderboard calculation) ──────────────────

  async getTopUsersByXP(
    since: Date,
    limit: number,
  ): Promise<{ userId: string; total: number }[]> {
    return this.xpTransactionRepo
      .createQueryBuilder('tx')
      .select('tx.user_id', 'userId')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.created_at >= :since', { since })
      .groupBy('tx.user_id')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTopReviewers(
    since: Date,
    limit: number,
  ): Promise<{ userId: string; total: number }[]> {
    return this.reviewRepo
      .createQueryBuilder('r')
      .select('r.user_id', 'userId')
      .addSelect('COALESCE(SUM(r.helpful_count), 0)', 'total')
      .where('r.created_at >= :since', { since })
      .groupBy('r.user_id')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
