import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../../common/cache/cache.service';
import { MarketplaceAnalyticsRepository } from '../marketplace-analytics.repository';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import {
  AnalyticsPeriod,
  AnalyticsScope,
  ConversionEventType,
  ReportGroupBy,
} from '../enums/analytics.enums';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// ──────────────────────────────────────────────
//  Cache constants
// ──────────────────────────────────────────────

const CACHE_TTL_REPORT = 600; // 10 minutes
const CACHE_TTL_OVERVIEW = 300; // 5 minutes
const CACHE_TAG = 'marketplace-analytics';

// ──────────────────────────────────────────────
//  Report interfaces
// ──────────────────────────────────────────────

export interface DateRange {
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export interface RevenueReportData {
  timeSeries: {
    period: string;
    grossRevenue: number;
    netRevenue: number;
    platformFees: number;
    orderCount: number;
  }[];
  totals: {
    grossRevenue: number;
    netRevenue: number;
    platformFees: number;
    orderCount: number;
    averageOrderValue: number;
  };
}

export interface ProductPerformanceReportData {
  productId: string;
  totalViews: number;
  uniqueVisitors: number;
  addToCartCount: number;
  purchaseCount: number;
  conversionRate: number;
  cartRate: number;
  grossRevenue: number;
  netRevenue: number;
  trafficSources: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { deviceType: string; count: number; percentage: number }[];
  geoBreakdown: { country: string; count: number; percentage: number }[];
  performanceScore: number;
  performanceBreakdown: {
    viewScore: number;
    conversionScore: number;
    ratingScore: number;
    revenueTrendScore: number;
  };
}

export interface SellerReportData {
  sellerId: string;
  grossRevenue: number;
  netRevenue: number;
  platformFees: number;
  orderCount: number;
  averageOrderValue: number;
  revenueTrend: {
    period: string;
    grossRevenue: number;
    netRevenue: number;
    platformFees: number;
    orderCount: number;
  }[];
}

export interface PlatformReportData {
  gmv: number;
  platformRevenue: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  activeSellers: number;
  activeProducts: number;
  topProducts: {
    digitalProductId: string;
    title: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
  revenueTimeSeries: {
    period: string;
    grossRevenue: number;
    netRevenue: number;
    platformFees: number;
    orderCount: number;
  }[];
}

export interface PlatformOverviewData {
  salesCount: number;
  salesCountChange: number;
  revenue: number;
  revenueChange: number;
  views: number;
  viewsChange: number;
  conversionRate: number;
  conversionRateChange: number;
  averageOrderValue: number;
  aovChange: number;
  sparklines: {
    revenue: number[];
    views: number[];
    orders: number[];
  };
}

export interface ConversionFunnelData {
  stages: {
    stage: string;
    label: string;
    count: number;
    rate: number;
    dropoffRate: number;
  }[];
  overallConversionRate: number;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    private readonly repository: MarketplaceAnalyticsRepository,
    private readonly aggregationService: AnalyticsAggregationService,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Revenue report
  // ──────────────────────────────────────────────

  async generateRevenueReport(
    dateRange: DateRange,
    groupBy: ReportGroupBy = ReportGroupBy.DAY,
    scope?: AnalyticsScope,
    scopeId?: string,
  ): Promise<ApiResponse<RevenueReportData>> {
    const cacheKey = this.cacheService.generateKey(
      'analytics',
      'revenue-report',
      dateRange,
      groupBy,
      scope ?? 'all',
      scopeId ?? 'all',
    );

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        const sellerId = scope === AnalyticsScope.SELLER ? scopeId : undefined;
        const productId = scope === AnalyticsScope.PRODUCT ? scopeId : undefined;

        const timeSeries = await this.repository.getRevenueTimeSeries(
          startDate,
          endDate,
          groupBy,
          sellerId,
          productId,
        );

        const totals = timeSeries.reduce(
          (acc, point) => ({
            grossRevenue: acc.grossRevenue + point.grossRevenue,
            netRevenue: acc.netRevenue + point.netRevenue,
            platformFees: acc.platformFees + point.platformFees,
            orderCount: acc.orderCount + point.orderCount,
            averageOrderValue: 0, // computed below
          }),
          { grossRevenue: 0, netRevenue: 0, platformFees: 0, orderCount: 0, averageOrderValue: 0 },
        );

        totals.averageOrderValue =
          totals.orderCount > 0
            ? Math.round((totals.grossRevenue / totals.orderCount) * 100) / 100
            : 0;

        return { timeSeries, totals };
      },
      { ttl: CACHE_TTL_REPORT, tags: [CACHE_TAG, 'analytics:revenue'] },
    );

    return {
      status: 'success',
      message: 'Revenue report generated successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Product performance report
  // ──────────────────────────────────────────────

  async generateProductPerformanceReport(
    productId: string,
    dateRange: DateRange,
  ): Promise<ApiResponse<ProductPerformanceReportData>> {
    const cacheKey = this.cacheService.generateKey(
      'analytics',
      'product-performance',
      productId,
      dateRange,
    );

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        const [
          totalViews,
          uniqueVisitors,
          funnel,
          revenueSummary,
          trafficSources,
          deviceBreakdown,
          geoBreakdown,
          performance,
        ] = await Promise.all([
          this.repository.getViewsInPeriod(startDate, endDate, productId),
          this.repository.getUniqueVisitors(startDate, endDate, productId),
          this.repository.getConversionFunnel(startDate, endDate, productId),
          this.repository.getProductRevenueSummary(productId, startDate, endDate),
          this.repository.getTrafficSourceBreakdown(startDate, endDate, productId),
          this.repository.getDeviceBreakdown(startDate, endDate, productId),
          this.repository.getGeographicBreakdown(startDate, endDate, productId),
          this.aggregationService.calculatePerformanceScore(productId),
        ]);

        const addToCartCount = funnel.find(
          (s) => s.stage === ConversionEventType.ADD_TO_CART,
        )?.count ?? 0;

        const purchaseCount = funnel.find(
          (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
        )?.count ?? 0;

        return {
          productId,
          totalViews,
          uniqueVisitors,
          addToCartCount,
          purchaseCount,
          conversionRate:
            totalViews > 0
              ? Math.round((purchaseCount / totalViews) * 10000) / 100
              : 0,
          cartRate:
            totalViews > 0
              ? Math.round((addToCartCount / totalViews) * 10000) / 100
              : 0,
          grossRevenue: revenueSummary.grossRevenue,
          netRevenue: revenueSummary.netRevenue,
          trafficSources,
          deviceBreakdown,
          geoBreakdown,
          performanceScore: performance.score,
          performanceBreakdown: performance.breakdown,
        };
      },
      { ttl: CACHE_TTL_REPORT, tags: [CACHE_TAG, `analytics:product:${productId}`] },
    );

    return {
      status: 'success',
      message: 'Product performance report generated successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Seller report
  // ──────────────────────────────────────────────

  async generateSellerReport(
    sellerId: string,
    dateRange: DateRange,
  ): Promise<ApiResponse<SellerReportData>> {
    const cacheKey = this.cacheService.generateKey(
      'analytics',
      'seller-report',
      sellerId,
      dateRange,
    );

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        const [revenueSummary, revenueTrend] = await Promise.all([
          this.repository.getSellerRevenueSummary(sellerId, startDate, endDate),
          this.repository.getRevenueTimeSeries(
            startDate,
            endDate,
            ReportGroupBy.DAY,
            sellerId,
          ),
        ]);

        return {
          sellerId,
          grossRevenue: revenueSummary.grossRevenue,
          netRevenue: revenueSummary.netRevenue,
          platformFees: revenueSummary.platformFees,
          orderCount: revenueSummary.orderCount,
          averageOrderValue:
            revenueSummary.orderCount > 0
              ? Math.round((revenueSummary.grossRevenue / revenueSummary.orderCount) * 100) / 100
              : 0,
          revenueTrend,
        };
      },
      { ttl: CACHE_TTL_REPORT, tags: [CACHE_TAG, `analytics:seller:${sellerId}`] },
    );

    return {
      status: 'success',
      message: 'Seller report generated successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Platform report
  // ──────────────────────────────────────────────

  async generatePlatformReport(
    dateRange: DateRange,
  ): Promise<ApiResponse<PlatformReportData>> {
    const cacheKey = this.cacheService.generateKey(
      'analytics',
      'platform-report',
      dateRange,
    );

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        const [
          revenueSummary,
          totalViews,
          uniqueVisitors,
          funnel,
          activeSellers,
          activeProducts,
          topProducts,
          revenueTimeSeries,
        ] = await Promise.all([
          this.repository.getTotalPlatformRevenue(startDate, endDate),
          this.repository.getViewsInPeriod(startDate, endDate),
          this.repository.getUniqueVisitors(startDate, endDate),
          this.repository.getConversionFunnel(startDate, endDate),
          this.repository.getDistinctSellersWithActivity(startDate, endDate),
          this.repository.getDistinctProductsWithViews(startDate, endDate),
          this.repository.getTopProducts(startDate, endDate, 10, 'revenue'),
          this.repository.getRevenueTimeSeries(startDate, endDate, ReportGroupBy.DAY),
        ]);

        const purchaseCount = funnel.find(
          (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
        )?.count ?? 0;

        return {
          gmv: revenueSummary.grossRevenue,
          platformRevenue: revenueSummary.platformFees,
          netRevenue: revenueSummary.netRevenue,
          totalOrders: revenueSummary.orderCount,
          averageOrderValue:
            revenueSummary.orderCount > 0
              ? Math.round((revenueSummary.grossRevenue / revenueSummary.orderCount) * 100) / 100
              : 0,
          totalViews,
          uniqueVisitors,
          conversionRate:
            totalViews > 0
              ? Math.round((purchaseCount / totalViews) * 10000) / 100
              : 0,
          activeSellers: activeSellers.length,
          activeProducts: activeProducts.length,
          topProducts,
          revenueTimeSeries,
        };
      },
      { ttl: CACHE_TTL_REPORT, tags: [CACHE_TAG, 'analytics:platform'] },
    );

    return {
      status: 'success',
      message: 'Platform report generated successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Platform overview with sparklines
  // ──────────────────────────────────────────────

  async getPlatformOverview(
    period: AnalyticsPeriod,
  ): Promise<ApiResponse<PlatformOverviewData>> {
    const cacheKey = this.cacheService.generateKey(
      'analytics',
      'platform-overview',
      period,
    );

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const { currentStart, currentEnd, previousStart, previousEnd } =
          this.getPeriodBoundaries(period);

        // Current period metrics
        const [
          currentRevenueSummary,
          currentViews,
          currentFunnel,
          previousRevenueSummary,
          previousViews,
          previousFunnel,
        ] = await Promise.all([
          this.repository.getTotalPlatformRevenue(currentStart, currentEnd),
          this.repository.getViewsInPeriod(currentStart, currentEnd),
          this.repository.getConversionFunnel(currentStart, currentEnd),
          this.repository.getTotalPlatformRevenue(previousStart, previousEnd),
          this.repository.getViewsInPeriod(previousStart, previousEnd),
          this.repository.getConversionFunnel(previousStart, previousEnd),
        ]);

        const currentPurchases = currentFunnel.find(
          (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
        )?.count ?? 0;

        const previousPurchases = previousFunnel.find(
          (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
        )?.count ?? 0;

        // Calculate percentage changes
        const salesCountChange = this.calcPercentChange(
          previousRevenueSummary.orderCount,
          currentRevenueSummary.orderCount,
        );
        const revenueChange = this.calcPercentChange(
          previousRevenueSummary.grossRevenue,
          currentRevenueSummary.grossRevenue,
        );
        const viewsChange = this.calcPercentChange(previousViews, currentViews);

        const currentConversionRate =
          currentViews > 0
            ? Math.round((currentPurchases / currentViews) * 10000) / 100
            : 0;
        const previousConversionRate =
          previousViews > 0
            ? Math.round((previousPurchases / previousViews) * 10000) / 100
            : 0;
        const conversionRateChange = this.calcPercentChange(
          previousConversionRate,
          currentConversionRate,
        );

        const currentAov =
          currentRevenueSummary.orderCount > 0
            ? currentRevenueSummary.grossRevenue / currentRevenueSummary.orderCount
            : 0;
        const previousAov =
          previousRevenueSummary.orderCount > 0
            ? previousRevenueSummary.grossRevenue / previousRevenueSummary.orderCount
            : 0;
        const aovChange = this.calcPercentChange(previousAov, currentAov);

        // Build sparkline data (daily revenue, views, orders for the current period)
        const revenueTimeSeries = await this.repository.getRevenueTimeSeries(
          currentStart,
          currentEnd,
          ReportGroupBy.DAY,
        );

        // Build daily view counts for sparkline
        const sparklineRevenue = revenueTimeSeries.map((p) => p.grossRevenue);
        const sparklineOrders = revenueTimeSeries.map((p) => p.orderCount);

        // For views sparkline, use snapshots if available, otherwise derive from the period
        const snapshots = await this.repository.getSnapshots(
          AnalyticsScope.PLATFORM,
          currentStart,
          currentEnd,
        );

        const sparklineViews = snapshots.length > 0
          ? snapshots.map((s) => s.metrics?.totalViews ?? 0)
          : revenueTimeSeries.map(() => 0); // fallback to zeros

        return {
          salesCount: currentRevenueSummary.orderCount,
          salesCountChange,
          revenue: Math.round(currentRevenueSummary.grossRevenue * 100) / 100,
          revenueChange,
          views: currentViews,
          viewsChange,
          conversionRate: currentConversionRate,
          conversionRateChange,
          averageOrderValue: Math.round(currentAov * 100) / 100,
          aovChange,
          sparklines: {
            revenue: sparklineRevenue,
            views: sparklineViews,
            orders: sparklineOrders,
          },
        };
      },
      { ttl: CACHE_TTL_OVERVIEW, tags: [CACHE_TAG, 'analytics:overview'] },
    );

    return {
      status: 'success',
      message: 'Platform overview retrieved successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Conversion funnel
  // ──────────────────────────────────────────────

  async getConversionFunnel(
    period: AnalyticsPeriod,
    productId?: string,
  ): Promise<ApiResponse<ConversionFunnelData>> {
    const cacheKey = this.cacheService.generateKey(
      'analytics',
      'conversion-funnel',
      period,
      productId ?? 'all',
    );

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const { currentStart, currentEnd } = this.getPeriodBoundaries(period);

        const funnel = await this.repository.getConversionFunnel(
          currentStart,
          currentEnd,
          productId,
        );

        const stageLabels: Record<string, string> = {
          [ConversionEventType.VIEW]: 'Product Views',
          [ConversionEventType.ADD_TO_CART]: 'Added to Cart',
          [ConversionEventType.CHECKOUT_STARTED]: 'Checkout Started',
          [ConversionEventType.CHECKOUT_COMPLETED]: 'Purchase Completed',
          [ConversionEventType.DOWNLOAD]: 'Downloaded',
        };

        const viewCount = funnel.find(
          (s) => s.stage === ConversionEventType.VIEW,
        )?.count ?? 0;

        const purchaseCount = funnel.find(
          (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
        )?.count ?? 0;

        const stages = funnel.map((stage, index) => {
          const previousCount = index === 0 ? stage.count : funnel[index - 1].count;
          const rate =
            viewCount > 0
              ? Math.round((stage.count / viewCount) * 10000) / 100
              : 0;
          const dropoffRate =
            previousCount > 0 && index > 0
              ? Math.round(((previousCount - stage.count) / previousCount) * 10000) / 100
              : 0;

          return {
            stage: stage.stage,
            label: stageLabels[stage.stage] ?? stage.stage,
            count: stage.count,
            rate,
            dropoffRate,
          };
        });

        const overallConversionRate =
          viewCount > 0
            ? Math.round((purchaseCount / viewCount) * 10000) / 100
            : 0;

        return { stages, overallConversionRate };
      },
      { ttl: CACHE_TTL_OVERVIEW, tags: [CACHE_TAG, 'analytics:funnel'] },
    );

    return {
      status: 'success',
      message: 'Conversion funnel retrieved successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  CSV export
  // ──────────────────────────────────────────────

  exportToCsv(
    data: Record<string, any>[],
    headers: { key: string; label: string }[],
  ): string {
    if (data.length === 0) {
      return headers.map((h) => h.label).join(',') + '\n';
    }

    // Build header row
    const headerRow = headers.map((h) => this.escapeCsvField(h.label)).join(',');

    // Build data rows
    const dataRows = data.map((row) => {
      return headers
        .map((h) => {
          const value = row[h.key];
          if (value === null || value === undefined) {
            return '';
          }
          return this.escapeCsvField(String(value));
        })
        .join(',');
    });

    return [headerRow, ...dataRows].join('\n') + '\n';
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Get date boundaries for a given analytics period, including the prior
   * period of the same length for comparison.
   */
  private getPeriodBoundaries(period: AnalyticsPeriod): {
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
  } {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (period) {
      case AnalyticsPeriod.SEVEN_DAYS: {
        currentEnd = new Date(now);
        currentStart = new Date(now);
        currentStart.setUTCDate(currentStart.getUTCDate() - 7);
        previousEnd = new Date(currentStart);
        previousStart = new Date(previousEnd);
        previousStart.setUTCDate(previousStart.getUTCDate() - 7);
        break;
      }

      case AnalyticsPeriod.THIRTY_DAYS: {
        currentEnd = new Date(now);
        currentStart = new Date(now);
        currentStart.setUTCDate(currentStart.getUTCDate() - 30);
        previousEnd = new Date(currentStart);
        previousStart = new Date(previousEnd);
        previousStart.setUTCDate(previousStart.getUTCDate() - 30);
        break;
      }

      case AnalyticsPeriod.NINETY_DAYS: {
        currentEnd = new Date(now);
        currentStart = new Date(now);
        currentStart.setUTCDate(currentStart.getUTCDate() - 90);
        previousEnd = new Date(currentStart);
        previousStart = new Date(previousEnd);
        previousStart.setUTCDate(previousStart.getUTCDate() - 90);
        break;
      }

      case AnalyticsPeriod.ONE_YEAR: {
        currentEnd = new Date(now);
        currentStart = new Date(now);
        currentStart.setUTCFullYear(currentStart.getUTCFullYear() - 1);
        previousEnd = new Date(currentStart);
        previousStart = new Date(previousEnd);
        previousStart.setUTCFullYear(previousStart.getUTCFullYear() - 1);
        break;
      }

      case AnalyticsPeriod.CUSTOM:
      default: {
        // Default to last 30 days for CUSTOM without explicit dates
        currentEnd = new Date(now);
        currentStart = new Date(now);
        currentStart.setUTCDate(currentStart.getUTCDate() - 30);
        previousEnd = new Date(currentStart);
        previousStart = new Date(previousEnd);
        previousStart.setUTCDate(previousStart.getUTCDate() - 30);
        break;
      }
    }

    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  /**
   * Calculate the percentage change between two values.
   * Returns a rounded percentage (e.g. 15.5 for a 15.5% increase).
   */
  private calcPercentChange(previous: number, current: number): number {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }

  /**
   * Escape a field value for CSV output.
   * Wraps in double quotes if the field contains commas, double quotes, or newlines.
   */
  private escapeCsvField(field: string): string {
    if (
      field.includes(',') ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r')
    ) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
