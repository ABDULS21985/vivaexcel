import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceAnalyticsRepository } from '../marketplace-analytics.repository';
import { ReportingService } from './reporting.service';
import {
  AnalyticsPeriod,
  AnalyticsScope,
  ConversionEventType,
  ReportGroupBy,
} from '../enums/analytics.enums';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// ──────────────────────────────────────────────
//  Response interfaces
// ──────────────────────────────────────────────

export interface SellerOverviewData {
  mode: 'seller';
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  views: number;
  viewsChange: number;
  conversionRate: number;
  conversionRateChange: number;
  sparklines: {
    revenue: number[];
    orders: number[];
  };
}

export interface BuyerOverviewData {
  mode: 'buyer';
  totalSpent: number;
  totalSpentChange: number;
  orders: number;
  ordersChange: number;
  downloads: number;
  productsOwned: number;
  sparklines: {
    spending: number[];
    orders: number[];
  };
}

export type MyOverviewData = SellerOverviewData | BuyerOverviewData;

export interface MyRevenueSeriesData {
  mode: 'seller' | 'buyer';
  timeSeries: {
    period: string;
    amount: number;
    orderCount: number;
  }[];
  total: number;
}

export interface MyTopProductsData {
  products: {
    digitalProductId: string;
    title: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export interface MyFunnelData {
  stages: {
    stage: string;
    label: string;
    count: number;
    rate: number;
    dropoffRate: number;
  }[];
  overallConversionRate: number;
}

export interface MyTrafficData {
  sources: {
    source: string;
    count: number;
    percentage: number;
  }[];
}

export interface MyPurchasesData {
  categories: {
    categoryId: string;
    categoryName: string;
    totalSpent: number;
    itemCount: number;
    percentage: number;
  }[];
  recentOrders: {
    orderId: string;
    orderNumber: string;
    total: number;
    currency: string;
    status: string;
    completedAt: string | null;
    createdAt: string;
    items: { productTitle: string; productSlug: string; price: number }[];
  }[];
}

@Injectable()
export class UserAnalyticsService {
  private readonly logger = new Logger(UserAnalyticsService.name);

  constructor(
    private readonly repository: MarketplaceAnalyticsRepository,
    private readonly reportingService: ReportingService,
  ) {}

  // ──────────────────────────────────────────────
  //  Overview
  // ──────────────────────────────────────────────

  async getMyOverview(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<ApiResponse<MyOverviewData>> {
    const isSeller = await this.repository.isUserSeller(userId);
    const { currentStart, currentEnd, previousStart, previousEnd } =
      this.getPeriodBoundaries(period);

    if (isSeller) {
      const data = await this.buildSellerOverview(
        userId,
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
      );
      return { status: 'success', message: 'Seller analytics overview retrieved', data };
    }

    const data = await this.buildBuyerOverview(
      userId,
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    );
    return { status: 'success', message: 'Buyer analytics overview retrieved', data };
  }

  // ──────────────────────────────────────────────
  //  Revenue / Spending time series
  // ──────────────────────────────────────────────

  async getMyRevenueSeries(
    userId: string,
    period: AnalyticsPeriod,
    groupBy: ReportGroupBy,
  ): Promise<ApiResponse<MyRevenueSeriesData>> {
    const isSeller = await this.repository.isUserSeller(userId);
    const { currentStart, currentEnd } = this.getPeriodBoundaries(period);
    const dateRange = {
      startDate: currentStart.toISOString(),
      endDate: currentEnd.toISOString(),
    };

    if (isSeller) {
      const report = await this.reportingService.generateRevenueReport(
        dateRange,
        groupBy,
        AnalyticsScope.SELLER,
        userId,
      );
      const timeSeries = (report.data?.timeSeries ?? []).map((p) => ({
        period: p.period,
        amount: p.grossRevenue,
        orderCount: p.orderCount,
      }));
      return {
        status: 'success',
        message: 'Seller revenue series retrieved',
        data: {
          mode: 'seller',
          timeSeries,
          total: report.data?.totals?.grossRevenue ?? 0,
        },
      };
    }

    const timeSeries = await this.repository.getUserSpendingTimeSeries(
      userId,
      currentStart,
      currentEnd,
      groupBy,
    );
    const total = timeSeries.reduce((sum, p) => sum + p.totalSpent, 0);
    return {
      status: 'success',
      message: 'Buyer spending series retrieved',
      data: {
        mode: 'buyer',
        timeSeries: timeSeries.map((p) => ({
          period: p.period,
          amount: p.totalSpent,
          orderCount: p.orderCount,
        })),
        total: Math.round(total * 100) / 100,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Seller: Top Products
  // ──────────────────────────────────────────────

  async getMyTopProducts(
    userId: string,
    period: AnalyticsPeriod,
    limit: number,
  ): Promise<ApiResponse<MyTopProductsData>> {
    const { currentStart, currentEnd } = this.getPeriodBoundaries(period);

    const products = await this.repository.getSellerTopProducts(
      userId,
      currentStart,
      currentEnd,
      limit,
    );

    return {
      status: 'success',
      message: 'Top products retrieved',
      data: { products },
    };
  }

  // ──────────────────────────────────────────────
  //  Seller: Conversion Funnel
  // ──────────────────────────────────────────────

  async getMyConversionFunnel(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<ApiResponse<MyFunnelData>> {
    const { currentStart, currentEnd } = this.getPeriodBoundaries(period);

    const funnel = await this.repository.getSellerConversionFunnel(
      userId,
      currentStart,
      currentEnd,
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

    return {
      status: 'success',
      message: 'Conversion funnel retrieved',
      data: { stages, overallConversionRate },
    };
  }

  // ──────────────────────────────────────────────
  //  Seller: Traffic Sources
  // ──────────────────────────────────────────────

  async getMyTrafficSources(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<ApiResponse<MyTrafficData>> {
    const { currentStart, currentEnd } = this.getPeriodBoundaries(period);

    const sources = await this.repository.getSellerTrafficSources(
      userId,
      currentStart,
      currentEnd,
    );

    return {
      status: 'success',
      message: 'Traffic sources retrieved',
      data: { sources },
    };
  }

  // ──────────────────────────────────────────────
  //  Buyer: Purchase Breakdown
  // ──────────────────────────────────────────────

  async getMyPurchaseBreakdown(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<ApiResponse<MyPurchasesData>> {
    const { currentStart, currentEnd } = this.getPeriodBoundaries(period);

    const [categories, recentOrders] = await Promise.all([
      this.repository.getUserCategoryBreakdown(userId, currentStart, currentEnd),
      this.repository.getUserRecentOrders(userId, 10),
    ]);

    return {
      status: 'success',
      message: 'Purchase breakdown retrieved',
      data: { categories, recentOrders },
    };
  }

  // ──────────────────────────────────────────────
  //  Private: Build Seller Overview
  // ──────────────────────────────────────────────

  private async buildSellerOverview(
    userId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
  ): Promise<SellerOverviewData> {
    const [
      currentRevenue,
      previousRevenue,
      currentViews,
      previousViews,
      currentFunnel,
      previousFunnel,
      revenueSeries,
    ] = await Promise.all([
      this.repository.getSellerRevenueSummary(userId, currentStart, currentEnd),
      this.repository.getSellerRevenueSummary(userId, previousStart, previousEnd),
      this.repository.getSellerViewsInPeriod(userId, currentStart, currentEnd),
      this.repository.getSellerViewsInPeriod(userId, previousStart, previousEnd),
      this.repository.getSellerConversionFunnel(userId, currentStart, currentEnd),
      this.repository.getSellerConversionFunnel(userId, previousStart, previousEnd),
      this.repository.getRevenueTimeSeries(
        currentStart,
        currentEnd,
        ReportGroupBy.DAY,
        userId,
      ),
    ]);

    const currentPurchases = currentFunnel.find(
      (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
    )?.count ?? 0;
    const previousPurchases = previousFunnel.find(
      (s) => s.stage === ConversionEventType.CHECKOUT_COMPLETED,
    )?.count ?? 0;

    const currentConvRate =
      currentViews > 0
        ? Math.round((currentPurchases / currentViews) * 10000) / 100
        : 0;
    const previousConvRate =
      previousViews > 0
        ? Math.round((previousPurchases / previousViews) * 10000) / 100
        : 0;

    return {
      mode: 'seller',
      revenue: Math.round(currentRevenue.grossRevenue * 100) / 100,
      revenueChange: this.calcPercentChange(
        previousRevenue.grossRevenue,
        currentRevenue.grossRevenue,
      ),
      orders: currentRevenue.orderCount,
      ordersChange: this.calcPercentChange(
        previousRevenue.orderCount,
        currentRevenue.orderCount,
      ),
      views: currentViews,
      viewsChange: this.calcPercentChange(previousViews, currentViews),
      conversionRate: currentConvRate,
      conversionRateChange: this.calcPercentChange(previousConvRate, currentConvRate),
      sparklines: {
        revenue: revenueSeries.map((p) => p.grossRevenue),
        orders: revenueSeries.map((p) => p.orderCount),
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Private: Build Buyer Overview
  // ──────────────────────────────────────────────

  private async buildBuyerOverview(
    userId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
  ): Promise<BuyerOverviewData> {
    const [
      currentSummary,
      previousSummary,
      downloads,
      productsOwned,
      spendingSeries,
    ] = await Promise.all([
      this.repository.getUserOrderSummary(userId, currentStart, currentEnd),
      this.repository.getUserOrderSummary(userId, previousStart, previousEnd),
      this.repository.getUserDownloadCount(userId),
      this.repository.getUserProductsOwnedCount(userId),
      this.repository.getUserSpendingTimeSeries(
        userId,
        currentStart,
        currentEnd,
        ReportGroupBy.DAY,
      ),
    ]);

    return {
      mode: 'buyer',
      totalSpent: Math.round(currentSummary.totalSpent * 100) / 100,
      totalSpentChange: this.calcPercentChange(
        previousSummary.totalSpent,
        currentSummary.totalSpent,
      ),
      orders: currentSummary.orderCount,
      ordersChange: this.calcPercentChange(
        previousSummary.orderCount,
        currentSummary.orderCount,
      ),
      downloads,
      productsOwned,
      sparklines: {
        spending: spendingSeries.map((p) => p.totalSpent),
        orders: spendingSeries.map((p) => p.orderCount),
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private getPeriodBoundaries(period: AnalyticsPeriod): {
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
  } {
    const now = new Date();
    let days: number;

    switch (period) {
      case AnalyticsPeriod.SEVEN_DAYS:
        days = 7;
        break;
      case AnalyticsPeriod.NINETY_DAYS:
        days = 90;
        break;
      case AnalyticsPeriod.ONE_YEAR:
        days = 365;
        break;
      case AnalyticsPeriod.THIRTY_DAYS:
      default:
        days = 30;
        break;
    }

    const currentEnd = new Date(now);
    const currentStart = new Date(now);
    currentStart.setUTCDate(currentStart.getUTCDate() - days);

    const previousEnd = new Date(currentStart);
    const previousStart = new Date(previousEnd);
    previousStart.setUTCDate(previousStart.getUTCDate() - days);

    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  private calcPercentChange(previous: number, current: number): number {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }
}
