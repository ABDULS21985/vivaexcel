import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from '../../../common/cache/cache.service';
import { GamificationRepository } from '../gamification.repository';
import {
  LeaderboardPeriod,
  LeaderboardCategory,
} from '../enums/gamification.enums';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly repository: GamificationRepository,
    private readonly cacheService: CacheService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async recalculateLeaderboards() {
    this.logger.log('Starting leaderboard recalculation...');

    try {
      await this.calculateBuyerXPLeaderboard(LeaderboardPeriod.WEEKLY);
      await this.calculateBuyerXPLeaderboard(LeaderboardPeriod.MONTHLY);
      await this.calculateBuyerXPLeaderboard(LeaderboardPeriod.ALL_TIME);

      await this.calculateReviewerLeaderboard(LeaderboardPeriod.WEEKLY);
      await this.calculateReviewerLeaderboard(LeaderboardPeriod.MONTHLY);
      await this.calculateReviewerLeaderboard(LeaderboardPeriod.ALL_TIME);

      await this.cacheService.invalidateByTags(['gamification:leaderboard']);
      this.logger.log('Leaderboard recalculation complete');
    } catch (error) {
      this.logger.error(`Leaderboard recalculation failed: ${error}`);
    }
  }

  private async calculateBuyerXPLeaderboard(
    period: LeaderboardPeriod,
  ): Promise<void> {
    const { since, periodStart, periodEnd } = this.getPeriodDates(period);
    const topUsers = await this.repository.getTopUsersByXP(since, 50);

    for (let i = 0; i < topUsers.length; i++) {
      await this.repository.upsertLeaderboardEntry({
        userId: topUsers[i].userId,
        period,
        category: LeaderboardCategory.BUYER_XP,
        score: Math.round(Number(topUsers[i].total)),
        rank: i + 1,
        periodStart,
        periodEnd,
      });
    }
  }

  private async calculateReviewerLeaderboard(
    period: LeaderboardPeriod,
  ): Promise<void> {
    const { since, periodStart, periodEnd } = this.getPeriodDates(period);
    const topReviewers = await this.repository.getTopReviewers(since, 50);

    for (let i = 0; i < topReviewers.length; i++) {
      await this.repository.upsertLeaderboardEntry({
        userId: topReviewers[i].userId,
        period,
        category: LeaderboardCategory.REVIEWER,
        score: Math.round(Number(topReviewers[i].total)),
        rank: i + 1,
        periodStart,
        periodEnd,
      });
    }
  }

  private getPeriodDates(period: LeaderboardPeriod): {
    since: Date;
    periodStart: Date;
    periodEnd: Date;
  } {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setHours(23, 59, 59, 999);

    let since: Date;
    let periodStart: Date;

    switch (period) {
      case LeaderboardPeriod.WEEKLY: {
        const dayOfWeek = now.getDay();
        since = new Date(now);
        since.setDate(now.getDate() - dayOfWeek);
        since.setHours(0, 0, 0, 0);
        periodStart = new Date(since);
        break;
      }
      case LeaderboardPeriod.MONTHLY: {
        since = new Date(now.getFullYear(), now.getMonth(), 1);
        periodStart = new Date(since);
        break;
      }
      case LeaderboardPeriod.ALL_TIME: {
        since = new Date(2020, 0, 1);
        periodStart = new Date(since);
        break;
      }
    }

    return { since, periodStart, periodEnd };
  }
}
