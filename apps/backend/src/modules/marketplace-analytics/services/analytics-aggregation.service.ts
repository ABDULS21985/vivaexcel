import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../shared/redis/redis.service';
import { MarketplaceAnalyticsRepository } from '../marketplace-analytics.repository';
import { AnalyticsScope, ConversionEventType } from '../enums/analytics.enums';
import { DigitalProduct } from '../../../entities/digital-product.entity';

// Redis key prefixes
const REDIS_PREFIX = 'analytics';
const VIEW_COUNT_PREFIX = `${REDIS_PREFIX}:views`;
const SALES_COUNT_KEY = `${REDIS_PREFIX}:today:sales`;
const REVENUE_KEY = `${REDIS_PREFIX}:today:revenue`;
const ACTIVE_VIEWERS_PREFIX = `${REDIS_PREFIX}:active_viewers`;

// Active viewer window (5 minutes in seconds)
const ACTIVE_VIEWER_WINDOW_SECONDS = 300;

// Daily key expiry (25 hours to cover timezone edge cases)
const DAILY_KEY_TTL = 90000;

@Injectable()
export class AnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(
    private readonly repository: MarketplaceAnalyticsRepository,
    private readonly redis: RedisService,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────
  //  Daily snapshot cron job — runs at 1:00 AM UTC
  // ──────────────────────────────────────────────

  @Cron('0 1 * * *')
  async runDailySnapshotAggregation(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Starting daily analytics snapshot aggregation...');

    try {
      // Get yesterday's date boundaries
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setUTCDate(endOfYesterday.getUTCDate() + 1);

      const periodDate = new Date(yesterday);

      // 1. Aggregate platform-level metrics
      await this.aggregatePlatformSnapshot(periodDate, yesterday, endOfYesterday);

      // 2. Aggregate seller-level snapshots
      await this.aggregateSellerSnapshots(periodDate, yesterday, endOfYesterday);

      // 3. Aggregate product-level snapshots
      await this.aggregateProductSnapshots(periodDate, yesterday, endOfYesterday);

      const elapsed = Date.now() - startTime;
      this.logger.log(
        `Daily analytics snapshot aggregation completed in ${elapsed}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Daily analytics snapshot aggregation failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Platform-level snapshot
  // ──────────────────────────────────────────────

  private async aggregatePlatformSnapshot(
    periodDate: Date,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    this.logger.debug('Aggregating platform-level snapshot...');

    const [
      totalViews,
      uniqueVisitors,
      funnel,
      revenueSummary,
      trafficSources,
      deviceBreakdown,
      geoBreakdown,
    ] = await Promise.all([
      this.repository.getViewsInPeriod(startDate, endDate),
      this.repository.getUniqueVisitors(startDate, endDate),
      this.repository.getConversionFunnel(startDate, endDate),
      this.repository.getTotalPlatformRevenue(startDate, endDate),
      this.repository.getTrafficSourceBreakdown(startDate, endDate),
      this.repository.getDeviceBreakdown(startDate, endDate),
      this.repository.getGeographicBreakdown(startDate, endDate),
    ]);

    const purchaseCount = funnel.find(
      (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
    )?.count ?? 0;

    const metrics = {
      totalViews,
      uniqueVisitors,
      purchaseCount,
      grossRevenue: revenueSummary.grossRevenue,
      netRevenue: revenueSummary.netRevenue,
      platformFees: revenueSummary.platformFees,
      orderCount: revenueSummary.orderCount,
      averageOrderValue:
        revenueSummary.orderCount > 0
          ? Math.round((revenueSummary.grossRevenue / revenueSummary.orderCount) * 100) / 100
          : 0,
      conversionRate:
        totalViews > 0
          ? Math.round((purchaseCount / totalViews) * 10000) / 100
          : 0,
      trafficSources,
      deviceBreakdown,
      topCountries: geoBreakdown.slice(0, 10),
      funnel,
    };

    await this.repository.saveSnapshot({
      period: periodDate,
      scope: AnalyticsScope.PLATFORM,
      metrics,
    });

    this.logger.debug(
      `Platform snapshot saved: ${totalViews} views, ${revenueSummary.grossRevenue} gross revenue`,
    );
  }

  // ──────────────────────────────────────────────
  //  Seller-level snapshots
  // ──────────────────────────────────────────────

  private async aggregateSellerSnapshots(
    periodDate: Date,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const sellers = await this.repository.getDistinctSellersWithActivity(
      startDate,
      endDate,
    );

    this.logger.debug(
      `Aggregating snapshots for ${sellers.length} active sellers...`,
    );

    for (const sellerId of sellers) {
      try {
        const revenueSummary = await this.repository.getSellerRevenueSummary(
          sellerId,
          startDate,
          endDate,
        );

        const metrics = {
          grossRevenue: revenueSummary.grossRevenue,
          netRevenue: revenueSummary.netRevenue,
          platformFees: revenueSummary.platformFees,
          orderCount: revenueSummary.orderCount,
          averageOrderValue:
            revenueSummary.orderCount > 0
              ? Math.round((revenueSummary.grossRevenue / revenueSummary.orderCount) * 100) / 100
              : 0,
        };

        await this.repository.saveSnapshot({
          period: periodDate,
          scope: AnalyticsScope.SELLER,
          scopeId: sellerId,
          metrics,
        });
      } catch (error) {
        this.logger.error(
          `Failed to aggregate snapshot for seller ${sellerId}: ${(error as Error).message}`,
        );
      }
    }

    this.logger.debug(`Seller snapshots completed for ${sellers.length} sellers`);
  }

  // ──────────────────────────────────────────────
  //  Product-level snapshots
  // ──────────────────────────────────────────────

  private async aggregateProductSnapshots(
    periodDate: Date,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const productIds = await this.repository.getDistinctProductsWithViews(
      startDate,
      endDate,
    );

    this.logger.debug(
      `Aggregating snapshots for ${productIds.length} products with views...`,
    );

    for (const productId of productIds) {
      try {
        const [views, uniqueVisitors, revenueSummary, funnel] =
          await Promise.all([
            this.repository.getViewsInPeriod(startDate, endDate, productId),
            this.repository.getUniqueVisitors(startDate, endDate, productId),
            this.repository.getProductRevenueSummary(productId, startDate, endDate),
            this.repository.getConversionFunnel(startDate, endDate, productId),
          ]);

        const purchaseCount = funnel.find(
          (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
        )?.count ?? 0;

        const addToCartCount = funnel.find(
          (s) => s.stage === ConversionEventType.ADD_TO_CART,
        )?.count ?? 0;

        const metrics = {
          views,
          uniqueVisitors,
          addToCartCount,
          purchaseCount,
          grossRevenue: revenueSummary.grossRevenue,
          netRevenue: revenueSummary.netRevenue,
          orderCount: revenueSummary.orderCount,
          conversionRate:
            views > 0
              ? Math.round((purchaseCount / views) * 10000) / 100
              : 0,
          cartRate:
            views > 0
              ? Math.round((addToCartCount / views) * 10000) / 100
              : 0,
        };

        await this.repository.saveSnapshot({
          period: periodDate,
          scope: AnalyticsScope.PRODUCT,
          scopeId: productId,
          metrics,
        });
      } catch (error) {
        this.logger.error(
          `Failed to aggregate snapshot for product ${productId}: ${(error as Error).message}`,
        );
      }
    }

    this.logger.debug(
      `Product snapshots completed for ${productIds.length} products`,
    );
  }

  // ──────────────────────────────────────────────
  //  Redis real-time counters
  // ──────────────────────────────────────────────

  /**
   * Increment the daily view counter for a product.
   */
  async incrementProductViewCount(productId: string): Promise<number> {
    const todayKey = this.getTodayKey(`${VIEW_COUNT_PREFIX}:${productId}`);
    const count = await this.redis.incr(todayKey);

    // Set expiry only on the first increment
    if (count === 1) {
      await this.redis.expire(todayKey, DAILY_KEY_TTL);
    }

    return count;
  }

  /**
   * Increment today's total sales count.
   */
  async incrementTodaySalesCount(): Promise<number> {
    const todayKey = this.getTodayKey(SALES_COUNT_KEY);
    const count = await this.redis.incr(todayKey);

    if (count === 1) {
      await this.redis.expire(todayKey, DAILY_KEY_TTL);
    }

    return count;
  }

  /**
   * Increment today's total revenue by the given amount.
   */
  async incrementTodayRevenue(amount: number): Promise<string> {
    const todayKey = this.getTodayKey(REVENUE_KEY);
    const client = this.redis.getClient();
    const result = await client.incrbyfloat(todayKey, amount);

    // Ensure TTL is set
    const ttl = await this.redis.ttl(todayKey);
    if (ttl < 0) {
      await this.redis.expire(todayKey, DAILY_KEY_TTL);
    }

    return result;
  }

  /**
   * Track an active viewer for a product using a sorted set with timestamp scores.
   */
  async trackActiveViewer(
    productId: string,
    sessionId: string,
  ): Promise<void> {
    const key = `${ACTIVE_VIEWERS_PREFIX}:${productId}`;
    const now = Date.now();
    const client = this.redis.getClient();

    // Add/update the session with current timestamp as score
    await client.zadd(key, now, sessionId);

    // Remove entries older than the window
    const cutoff = now - ACTIVE_VIEWER_WINDOW_SECONDS * 1000;
    await client.zremrangebyscore(key, '-inf', cutoff);

    // Set a TTL on the sorted set itself (auto-cleanup)
    await this.redis.expire(key, ACTIVE_VIEWER_WINDOW_SECONDS * 2);
  }

  /**
   * Get the count of active viewers for a product (sessions within last 5 minutes).
   */
  async getActiveViewers(productId: string): Promise<number> {
    const key = `${ACTIVE_VIEWERS_PREFIX}:${productId}`;
    const now = Date.now();
    const cutoff = now - ACTIVE_VIEWER_WINDOW_SECONDS * 1000;
    const client = this.redis.getClient();

    return client.zcount(key, cutoff, '+inf');
  }

  /**
   * Get today's aggregated sales count and revenue from Redis counters.
   */
  async getTodayStats(): Promise<{
    salesCount: number;
    revenue: number;
  }> {
    const salesKey = this.getTodayKey(SALES_COUNT_KEY);
    const revenueKey = this.getTodayKey(REVENUE_KEY);

    const [salesStr, revenueStr] = await Promise.all([
      this.redis.get(salesKey),
      this.redis.get(revenueKey),
    ]);

    return {
      salesCount: salesStr ? parseInt(salesStr, 10) : 0,
      revenue: revenueStr ? parseFloat(revenueStr) : 0,
    };
  }

  // ──────────────────────────────────────────────
  //  Performance scoring
  // ──────────────────────────────────────────────

  /**
   * Calculate a composite performance score for a product.
   * Weights: views 30%, conversion 30%, rating 20%, revenue trend 20%.
   * Returns a score between 0 and 100.
   */
  async calculatePerformanceScore(productId: string): Promise<{
    score: number;
    breakdown: {
      viewScore: number;
      conversionScore: number;
      ratingScore: number;
      revenueTrendScore: number;
    };
  }> {
    const now = new Date();

    // Current period: last 30 days
    const currentStart = new Date(now);
    currentStart.setUTCDate(currentStart.getUTCDate() - 30);

    // Previous period: 30-60 days ago (for trend comparison)
    const previousStart = new Date(now);
    previousStart.setUTCDate(previousStart.getUTCDate() - 60);
    const previousEnd = new Date(currentStart);

    // Gather data
    const [
      currentViews,
      previousViews,
      currentPurchases,
      currentRevenue,
      previousRevenue,
      product,
    ] = await Promise.all([
      this.repository.getViewsInPeriod(currentStart, now, productId),
      this.repository.getViewsInPeriod(previousStart, previousEnd, productId),
      this.repository.getConversionCountByType(
        currentStart,
        now,
        ConversionEventType.CHECKOUT_COMPLETED,
        productId,
      ),
      this.repository.getProductRevenueSummary(productId, currentStart, now),
      this.repository.getProductRevenueSummary(productId, previousStart, previousEnd),
      this.digitalProductRepository.findOne({ where: { id: productId } }),
    ]);

    // 1. View score (0-100): normalize against platform average
    // Use a logarithmic scale — diminishing returns past a threshold
    const viewScore = Math.min(100, Math.round(Math.log2(currentViews + 1) * 10));

    // 2. Conversion score (0-100): conversion rate normalized
    const conversionRate = currentViews > 0 ? (currentPurchases / currentViews) : 0;
    // A 5% conversion rate is considered excellent for digital products
    const conversionScore = Math.min(100, Math.round((conversionRate / 0.05) * 100));

    // 3. Rating score (0-100): directly mapped from 0-5 rating
    const rating = product ? Number(product.averageRating) || 0 : 0;
    const totalReviews = product ? product.totalReviews || 0 : 0;
    // Weight the rating by confidence (number of reviews)
    const ratingConfidence = Math.min(1, totalReviews / 10);
    const ratingScore = Math.round((rating / 5) * 100 * ratingConfidence);

    // 4. Revenue trend score (0-100): growth vs previous period
    const currentRev = currentRevenue.grossRevenue;
    const previousRev = previousRevenue.grossRevenue;
    let revenueTrendScore: number;

    if (previousRev === 0 && currentRev > 0) {
      revenueTrendScore = 100; // New revenue from zero = maximum trend
    } else if (previousRev === 0 && currentRev === 0) {
      revenueTrendScore = 0;
    } else {
      const growthRate = (currentRev - previousRev) / previousRev;
      // Cap at +100% growth mapping to 100 score, negative growth maps to 0-50
      revenueTrendScore = Math.max(0, Math.min(100, Math.round(50 + growthRate * 50)));
    }

    // Weighted composite score
    const score = Math.round(
      viewScore * 0.3 +
      conversionScore * 0.3 +
      ratingScore * 0.2 +
      revenueTrendScore * 0.2,
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      breakdown: {
        viewScore,
        conversionScore,
        ratingScore,
        revenueTrendScore,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Generate a Redis key scoped to today's date (UTC).
   */
  private getTodayKey(prefix: string): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    return `${prefix}:${dateStr}`;
  }
}
