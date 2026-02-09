import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductView } from '../../entities/product-view.entity';
import { ConversionEvent } from '../../entities/conversion-event.entity';
import { RevenueRecord } from '../../entities/revenue-record.entity';
import { AnalyticsSnapshot } from '../../entities/analytics-snapshot.entity';
import {
  AnalyticsScope,
  ConversionEventType,
  ReportGroupBy,
} from './enums/analytics.enums';

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────

export interface TrackViewData {
  digitalProductId: string;
  userId?: string;
  sessionId: string;
  source?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  duration?: number;
  scrollDepth?: number;
}

export interface TrackConversionData {
  digitalProductId?: string;
  userId?: string;
  sessionId: string;
  eventType: ConversionEventType;
  metadata?: Record<string, any>;
}

export interface RecordRevenueData {
  orderId: string;
  sellerId?: string;
  digitalProductId: string;
  grossAmount: number;
  platformFee: number;
  sellerAmount: number;
  couponDiscount?: number;
  netRevenue: number;
  currency?: string;
  period: Date;
}

export interface FunnelStage {
  stage: ConversionEventType;
  count: number;
}

export interface RevenueTimeSeriesPoint {
  period: string;
  grossRevenue: number;
  netRevenue: number;
  platformFees: number;
  orderCount: number;
}

export interface TopProduct {
  digitalProductId: string;
  title: string;
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface TrafficSourceBreakdown {
  source: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface GeographicBreakdown {
  country: string;
  count: number;
  percentage: number;
}

export interface CoViewedProduct {
  digitalProductId: string;
  title: string;
  coViewCount: number;
}

export interface FrequentlyBoughtProduct {
  digitalProductId: string;
  title: string;
  coPurchaseCount: number;
}

@Injectable()
export class MarketplaceAnalyticsRepository {
  constructor(
    @InjectRepository(ProductView)
    private readonly productViewRepository: Repository<ProductView>,
    @InjectRepository(ConversionEvent)
    private readonly conversionEventRepository: Repository<ConversionEvent>,
    @InjectRepository(RevenueRecord)
    private readonly revenueRecordRepository: Repository<RevenueRecord>,
    @InjectRepository(AnalyticsSnapshot)
    private readonly analyticsSnapshotRepository: Repository<AnalyticsSnapshot>,
  ) {}

  // ──────────────────────────────────────────────
  //  Tracking writes
  // ──────────────────────────────────────────────

  async trackView(data: TrackViewData): Promise<ProductView> {
    const view = this.productViewRepository.create({
      digitalProductId: data.digitalProductId,
      userId: data.userId,
      sessionId: data.sessionId,
      source: data.source as any,
      referrer: data.referrer,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      deviceType: data.deviceType as any,
      browser: data.browser,
      os: data.os,
      country: data.country,
      region: data.region,
      city: data.city,
      duration: data.duration,
      scrollDepth: data.scrollDepth,
      viewedAt: new Date(),
    });
    return this.productViewRepository.save(view);
  }

  async trackConversion(data: TrackConversionData): Promise<ConversionEvent> {
    const event = this.conversionEventRepository.create({
      digitalProductId: data.digitalProductId,
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: data.eventType,
      metadata: data.metadata,
      occurredAt: new Date(),
    });
    return this.conversionEventRepository.save(event);
  }

  async recordRevenue(data: RecordRevenueData): Promise<RevenueRecord> {
    const record = this.revenueRecordRepository.create({
      orderId: data.orderId,
      sellerId: data.sellerId,
      digitalProductId: data.digitalProductId,
      grossAmount: data.grossAmount,
      platformFee: data.platformFee,
      sellerAmount: data.sellerAmount,
      couponDiscount: data.couponDiscount ?? 0,
      netRevenue: data.netRevenue,
      currency: data.currency ?? 'USD',
      period: data.period,
      recordedAt: new Date(),
    });
    return this.revenueRecordRepository.save(record);
  }

  // ──────────────────────────────────────────────
  //  View queries
  // ──────────────────────────────────────────────

  async getViewsInPeriod(
    startDate: Date,
    endDate: Date,
    productId?: string,
  ): Promise<number> {
    const qb = this.productViewRepository
      .createQueryBuilder('pv')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate });

    if (productId) {
      qb.andWhere('pv.digitalProductId = :productId', { productId });
    }

    return qb.getCount();
  }

  async getUniqueVisitors(
    startDate: Date,
    endDate: Date,
    productId?: string,
  ): Promise<number> {
    const qb = this.productViewRepository
      .createQueryBuilder('pv')
      .select('COUNT(DISTINCT COALESCE(pv.userId, pv.sessionId))', 'uniqueVisitors')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate });

    if (productId) {
      qb.andWhere('pv.digitalProductId = :productId', { productId });
    }

    const result = await qb.getRawOne();
    return parseInt(result?.uniqueVisitors, 10) || 0;
  }

  // ──────────────────────────────────────────────
  //  Conversion funnel
  // ──────────────────────────────────────────────

  async getConversionFunnel(
    startDate: Date,
    endDate: Date,
    productId?: string,
  ): Promise<FunnelStage[]> {
    const qb = this.conversionEventRepository
      .createQueryBuilder('ce')
      .select('ce.eventType', 'stage')
      .addSelect('COUNT(ce.id)', 'count')
      .where('ce.occurredAt >= :startDate', { startDate })
      .andWhere('ce.occurredAt < :endDate', { endDate });

    if (productId) {
      qb.andWhere('ce.digitalProductId = :productId', { productId });
    }

    qb.groupBy('ce.eventType');

    const results = await qb.getRawMany();

    // Define the funnel order
    const funnelOrder: ConversionEventType[] = [
      ConversionEventType.VIEW,
      ConversionEventType.ADD_TO_CART,
      ConversionEventType.CHECKOUT_STARTED,
      ConversionEventType.CHECKOUT_COMPLETED,
      ConversionEventType.DOWNLOAD,
    ];

    // Build the full funnel with zeros for missing stages
    return funnelOrder.map((stage) => {
      const match = results.find((r) => r.stage === stage);
      return {
        stage,
        count: match ? parseInt(match.count, 10) : 0,
      };
    });
  }

  // ──────────────────────────────────────────────
  //  Revenue time series
  // ──────────────────────────────────────────────

  async getRevenueTimeSeries(
    startDate: Date,
    endDate: Date,
    groupBy: ReportGroupBy,
    sellerId?: string,
    productId?: string,
  ): Promise<RevenueTimeSeriesPoint[]> {
    let dateTrunc: string;
    switch (groupBy) {
      case ReportGroupBy.WEEK:
        dateTrunc = 'week';
        break;
      case ReportGroupBy.MONTH:
        dateTrunc = 'month';
        break;
      default:
        dateTrunc = 'day';
        break;
    }

    const qb = this.revenueRecordRepository
      .createQueryBuilder('rr')
      .select(`DATE_TRUNC('${dateTrunc}', rr.recordedAt)`, 'period')
      .addSelect('SUM(rr.grossAmount)', 'grossRevenue')
      .addSelect('SUM(rr.netRevenue)', 'netRevenue')
      .addSelect('SUM(rr.platformFee)', 'platformFees')
      .addSelect('COUNT(DISTINCT rr.orderId)', 'orderCount')
      .where('rr.recordedAt >= :startDate', { startDate })
      .andWhere('rr.recordedAt < :endDate', { endDate });

    if (sellerId) {
      qb.andWhere('rr.sellerId = :sellerId', { sellerId });
    }

    if (productId) {
      qb.andWhere('rr.digitalProductId = :productId', { productId });
    }

    qb.groupBy('period');
    qb.orderBy('period', 'ASC');

    const results = await qb.getRawMany();

    return results.map((row) => ({
      period: row.period instanceof Date ? row.period.toISOString() : String(row.period),
      grossRevenue: parseFloat(row.grossRevenue) || 0,
      netRevenue: parseFloat(row.netRevenue) || 0,
      platformFees: parseFloat(row.platformFees) || 0,
      orderCount: parseInt(row.orderCount, 10) || 0,
    }));
  }

  // ──────────────────────────────────────────────
  //  Top products
  // ──────────────────────────────────────────────

  async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
    orderBy: 'views' | 'revenue' | 'conversion',
  ): Promise<TopProduct[]> {
    // Sub-query for views
    const viewsSubQuery = this.productViewRepository
      .createQueryBuilder('pv')
      .select('pv.digitalProductId', 'productId')
      .addSelect('COUNT(pv.id)', 'viewCount')
      .where('pv.viewedAt >= :startDate')
      .andWhere('pv.viewedAt < :endDate')
      .groupBy('pv.digitalProductId');

    // Sub-query for conversions (CHECKOUT_COMPLETED)
    const conversionsSubQuery = this.conversionEventRepository
      .createQueryBuilder('ce')
      .select('ce.digitalProductId', 'productId')
      .addSelect('COUNT(ce.id)', 'conversionCount')
      .where('ce.occurredAt >= :startDate')
      .andWhere('ce.occurredAt < :endDate')
      .andWhere('ce.eventType = :purchaseType')
      .groupBy('ce.digitalProductId');

    // Sub-query for revenue
    const revenueSubQuery = this.revenueRecordRepository
      .createQueryBuilder('rr')
      .select('rr.digitalProductId', 'productId')
      .addSelect('SUM(rr.grossAmount)', 'totalRevenue')
      .where('rr.recordedAt >= :startDate')
      .andWhere('rr.recordedAt < :endDate')
      .groupBy('rr.digitalProductId');

    // Use raw query for the full join since TypeORM doesn't support full outer joins well
    const qb = this.productViewRepository.manager
      .createQueryBuilder()
      .select('dp.id', 'digitalProductId')
      .addSelect('dp.title', 'title')
      .addSelect('COALESCE(v."viewCount", 0)', 'views')
      .addSelect('COALESCE(c."conversionCount", 0)', 'conversions')
      .addSelect('COALESCE(r."totalRevenue", 0)', 'revenue')
      .addSelect(
        'CASE WHEN COALESCE(v."viewCount", 0) > 0 THEN ROUND(COALESCE(c."conversionCount", 0)::numeric / v."viewCount" * 100, 2) ELSE 0 END',
        'conversionRate',
      )
      .from('digital_products', 'dp')
      .leftJoin(
        `(${viewsSubQuery.getQuery()})`,
        'v',
        'v."productId" = dp.id',
      )
      .leftJoin(
        `(${conversionsSubQuery.getQuery()})`,
        'c',
        'c."productId" = dp.id',
      )
      .leftJoin(
        `(${revenueSubQuery.getQuery()})`,
        'r',
        'r."productId" = dp.id',
      )
      .setParameters({
        startDate,
        endDate,
        purchaseType: ConversionEventType.CHECKOUT_COMPLETED,
      })
      .where(
        'COALESCE(v."viewCount", 0) > 0 OR COALESCE(c."conversionCount", 0) > 0 OR COALESCE(r."totalRevenue", 0) > 0',
      );

    switch (orderBy) {
      case 'revenue':
        qb.orderBy('revenue', 'DESC');
        break;
      case 'conversion':
        qb.orderBy('"conversionRate"', 'DESC');
        break;
      case 'views':
      default:
        qb.orderBy('views', 'DESC');
        break;
    }

    qb.limit(limit);

    const results = await qb.getRawMany();

    return results.map((row) => ({
      digitalProductId: row.digitalProductId,
      title: row.title,
      views: parseInt(row.views, 10) || 0,
      conversions: parseInt(row.conversions, 10) || 0,
      revenue: parseFloat(row.revenue) || 0,
      conversionRate: parseFloat(row.conversionRate) || 0,
    }));
  }

  // ──────────────────────────────────────────────
  //  Traffic source breakdown
  // ──────────────────────────────────────────────

  async getTrafficSourceBreakdown(
    startDate: Date,
    endDate: Date,
    productId?: string,
  ): Promise<TrafficSourceBreakdown[]> {
    const qb = this.productViewRepository
      .createQueryBuilder('pv')
      .select('pv.source', 'source')
      .addSelect('COUNT(pv.id)', 'count')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate });

    if (productId) {
      qb.andWhere('pv.digitalProductId = :productId', { productId });
    }

    qb.groupBy('pv.source');
    qb.orderBy('count', 'DESC');

    const results = await qb.getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.count, 10), 0);

    return results.map((row) => {
      const count = parseInt(row.count, 10);
      return {
        source: row.source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      };
    });
  }

  // ──────────────────────────────────────────────
  //  Device breakdown
  // ──────────────────────────────────────────────

  async getDeviceBreakdown(
    startDate: Date,
    endDate: Date,
    productId?: string,
  ): Promise<DeviceBreakdown[]> {
    const qb = this.productViewRepository
      .createQueryBuilder('pv')
      .select('COALESCE(pv.deviceType, \'unknown\')', 'deviceType')
      .addSelect('COUNT(pv.id)', 'count')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate });

    if (productId) {
      qb.andWhere('pv.digitalProductId = :productId', { productId });
    }

    qb.groupBy('pv.deviceType');
    qb.orderBy('count', 'DESC');

    const results = await qb.getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.count, 10), 0);

    return results.map((row) => {
      const count = parseInt(row.count, 10);
      return {
        deviceType: row.deviceType,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      };
    });
  }

  // ──────────────────────────────────────────────
  //  Geographic breakdown
  // ──────────────────────────────────────────────

  async getGeographicBreakdown(
    startDate: Date,
    endDate: Date,
    productId?: string,
  ): Promise<GeographicBreakdown[]> {
    const qb = this.productViewRepository
      .createQueryBuilder('pv')
      .select('COALESCE(pv.country, \'unknown\')', 'country')
      .addSelect('COUNT(pv.id)', 'count')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate });

    if (productId) {
      qb.andWhere('pv.digitalProductId = :productId', { productId });
    }

    qb.groupBy('pv.country');
    qb.orderBy('count', 'DESC');

    const results = await qb.getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.count, 10), 0);

    return results.map((row) => {
      const count = parseInt(row.count, 10);
      return {
        country: row.country,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      };
    });
  }

  // ──────────────────────────────────────────────
  //  Co-views & frequently bought together
  // ──────────────────────────────────────────────

  async getProductCoViews(
    productId: string,
    limit: number,
  ): Promise<CoViewedProduct[]> {
    // Find sessions that viewed this product, then find other products in those sessions
    const results = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('pv.digitalProductId', 'digitalProductId')
      .addSelect('dp.title', 'title')
      .addSelect('COUNT(pv.id)', 'coViewCount')
      .innerJoin(
        'product_views',
        'pv2',
        'pv2.session_id = pv.session_id AND pv2.digital_product_id = :targetProductId',
      )
      .innerJoin('digital_products', 'dp', 'dp.id = pv.digital_product_id')
      .where('pv.digitalProductId != :targetProductId', { targetProductId: productId })
      .groupBy('pv.digitalProductId')
      .addGroupBy('dp.title')
      .orderBy('"coViewCount"', 'DESC')
      .limit(limit)
      .setParameter('targetProductId', productId)
      .getRawMany();

    return results.map((row) => ({
      digitalProductId: row.digitalProductId,
      title: row.title,
      coViewCount: parseInt(row.coViewCount, 10) || 0,
    }));
  }

  async getFrequentlyBoughtTogether(
    productId: string,
    limit: number,
  ): Promise<FrequentlyBoughtProduct[]> {
    // Find orders containing this product, then find other products in those orders
    const results = await this.revenueRecordRepository.manager
      .createQueryBuilder()
      .select('oi2.digital_product_id', 'digitalProductId')
      .addSelect('dp.title', 'title')
      .addSelect('COUNT(DISTINCT oi.order_id)', 'coPurchaseCount')
      .from('order_items', 'oi')
      .innerJoin(
        'order_items',
        'oi2',
        'oi2.order_id = oi.order_id AND oi2.digital_product_id != :targetProductId',
      )
      .innerJoin('digital_products', 'dp', 'dp.id = oi2.digital_product_id')
      .where('oi.digital_product_id = :targetProductId', { targetProductId: productId })
      .groupBy('oi2.digital_product_id')
      .addGroupBy('dp.title')
      .orderBy('"coPurchaseCount"', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((row) => ({
      digitalProductId: row.digitalProductId,
      title: row.title,
      coPurchaseCount: parseInt(row.coPurchaseCount, 10) || 0,
    }));
  }

  // ──────────────────────────────────────────────
  //  Snapshots
  // ──────────────────────────────────────────────

  async saveSnapshot(snapshot: {
    period: Date;
    scope: AnalyticsScope;
    scopeId?: string;
    metrics: Record<string, any>;
  }): Promise<AnalyticsSnapshot> {
    // Upsert: use the unique constraint on (period, scope, scopeId)
    const existing = await this.analyticsSnapshotRepository.findOne({
      where: {
        period: snapshot.period,
        scope: snapshot.scope,
        scopeId: snapshot.scopeId ?? undefined,
      },
    });

    if (existing) {
      existing.metrics = snapshot.metrics;
      return this.analyticsSnapshotRepository.save(existing);
    }

    const entity = this.analyticsSnapshotRepository.create(snapshot);
    return this.analyticsSnapshotRepository.save(entity);
  }

  async getSnapshots(
    scope: AnalyticsScope,
    startDate: Date,
    endDate: Date,
    scopeId?: string,
  ): Promise<AnalyticsSnapshot[]> {
    const qb = this.analyticsSnapshotRepository
      .createQueryBuilder('snap')
      .where('snap.scope = :scope', { scope })
      .andWhere('snap.period >= :startDate', { startDate })
      .andWhere('snap.period <= :endDate', { endDate });

    if (scopeId) {
      qb.andWhere('snap.scopeId = :scopeId', { scopeId });
    } else {
      qb.andWhere('snap.scopeId IS NULL');
    }

    qb.orderBy('snap.period', 'ASC');

    return qb.getMany();
  }

  // ──────────────────────────────────────────────
  //  Aggregation helpers (used by cron jobs)
  // ──────────────────────────────────────────────

  async getDistinctSellersWithActivity(
    startDate: Date,
    endDate: Date,
  ): Promise<string[]> {
    const results = await this.revenueRecordRepository
      .createQueryBuilder('rr')
      .select('DISTINCT rr.sellerId', 'sellerId')
      .where('rr.recordedAt >= :startDate', { startDate })
      .andWhere('rr.recordedAt < :endDate', { endDate })
      .andWhere('rr.sellerId IS NOT NULL')
      .getRawMany();

    return results.map((r) => r.sellerId);
  }

  async getDistinctProductsWithViews(
    startDate: Date,
    endDate: Date,
  ): Promise<string[]> {
    const results = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('DISTINCT pv.digitalProductId', 'digitalProductId')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate })
      .getRawMany();

    return results.map((r) => r.digitalProductId);
  }

  async getSellerRevenueSummary(
    sellerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ grossRevenue: number; netRevenue: number; platformFees: number; orderCount: number }> {
    const result = await this.revenueRecordRepository
      .createQueryBuilder('rr')
      .select('SUM(rr.grossAmount)', 'grossRevenue')
      .addSelect('SUM(rr.netRevenue)', 'netRevenue')
      .addSelect('SUM(rr.platformFee)', 'platformFees')
      .addSelect('COUNT(DISTINCT rr.orderId)', 'orderCount')
      .where('rr.sellerId = :sellerId', { sellerId })
      .andWhere('rr.recordedAt >= :startDate', { startDate })
      .andWhere('rr.recordedAt < :endDate', { endDate })
      .getRawOne();

    return {
      grossRevenue: parseFloat(result?.grossRevenue) || 0,
      netRevenue: parseFloat(result?.netRevenue) || 0,
      platformFees: parseFloat(result?.platformFees) || 0,
      orderCount: parseInt(result?.orderCount, 10) || 0,
    };
  }

  async getProductRevenueSummary(
    productId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ grossRevenue: number; netRevenue: number; orderCount: number }> {
    const result = await this.revenueRecordRepository
      .createQueryBuilder('rr')
      .select('SUM(rr.grossAmount)', 'grossRevenue')
      .addSelect('SUM(rr.netRevenue)', 'netRevenue')
      .addSelect('COUNT(DISTINCT rr.orderId)', 'orderCount')
      .where('rr.digitalProductId = :productId', { productId })
      .andWhere('rr.recordedAt >= :startDate', { startDate })
      .andWhere('rr.recordedAt < :endDate', { endDate })
      .getRawOne();

    return {
      grossRevenue: parseFloat(result?.grossRevenue) || 0,
      netRevenue: parseFloat(result?.netRevenue) || 0,
      orderCount: parseInt(result?.orderCount, 10) || 0,
    };
  }

  async getTotalPlatformRevenue(
    startDate: Date,
    endDate: Date,
  ): Promise<{ grossRevenue: number; netRevenue: number; platformFees: number; orderCount: number }> {
    const result = await this.revenueRecordRepository
      .createQueryBuilder('rr')
      .select('SUM(rr.grossAmount)', 'grossRevenue')
      .addSelect('SUM(rr.netRevenue)', 'netRevenue')
      .addSelect('SUM(rr.platformFee)', 'platformFees')
      .addSelect('COUNT(DISTINCT rr.orderId)', 'orderCount')
      .where('rr.recordedAt >= :startDate', { startDate })
      .andWhere('rr.recordedAt < :endDate', { endDate })
      .getRawOne();

    return {
      grossRevenue: parseFloat(result?.grossRevenue) || 0,
      netRevenue: parseFloat(result?.netRevenue) || 0,
      platformFees: parseFloat(result?.platformFees) || 0,
      orderCount: parseInt(result?.orderCount, 10) || 0,
    };
  }

  async getConversionCountByType(
    startDate: Date,
    endDate: Date,
    eventType: ConversionEventType,
    productId?: string,
  ): Promise<number> {
    const qb = this.conversionEventRepository
      .createQueryBuilder('ce')
      .where('ce.occurredAt >= :startDate', { startDate })
      .andWhere('ce.occurredAt < :endDate', { endDate })
      .andWhere('ce.eventType = :eventType', { eventType });

    if (productId) {
      qb.andWhere('ce.digitalProductId = :productId', { productId });
    }

    return qb.getCount();
  }

  /**
   * Get view velocity for products over a time range — used for trending calculations.
   * Returns products ordered by view count in the specified period.
   */
  async getProductViewVelocity(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<{ digitalProductId: string; viewCount: number }[]> {
    const results = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('pv.digitalProductId', 'digitalProductId')
      .addSelect('COUNT(pv.id)', 'viewCount')
      .where('pv.viewedAt >= :startDate', { startDate })
      .andWhere('pv.viewedAt < :endDate', { endDate })
      .groupBy('pv.digitalProductId')
      .orderBy('"viewCount"', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => ({
      digitalProductId: r.digitalProductId,
      viewCount: parseInt(r.viewCount, 10) || 0,
    }));
  }

  /**
   * Get products a user has viewed recently.
   */
  async getUserRecentlyViewedProducts(
    userId: string,
    limit: number,
  ): Promise<string[]> {
    const results = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('pv.digitalProductId', 'digitalProductId')
      .addSelect('MAX(pv.viewedAt)', 'lastViewed')
      .where('pv.userId = :userId', { userId })
      .groupBy('pv.digitalProductId')
      .orderBy('"lastViewed"', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => r.digitalProductId);
  }

  /**
   * Get products a user has purchased.
   */
  async getUserPurchasedProducts(userId: string): Promise<string[]> {
    const results = await this.conversionEventRepository
      .createQueryBuilder('ce')
      .select('DISTINCT ce.digitalProductId', 'digitalProductId')
      .where('ce.userId = :userId', { userId })
      .andWhere('ce.eventType = :type', { type: ConversionEventType.CHECKOUT_COMPLETED })
      .andWhere('ce.digitalProductId IS NOT NULL')
      .getRawMany();

    return results.map((r) => r.digitalProductId);
  }

  /**
   * Get sales count for a product in a category within a date range.
   */
  async getProductSalesInCategory(
    categoryId: string,
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<{ digitalProductId: string; salesCount: number }[]> {
    const results = await this.conversionEventRepository
      .createQueryBuilder('ce')
      .select('ce.digitalProductId', 'digitalProductId')
      .addSelect('COUNT(ce.id)', 'salesCount')
      .innerJoin('digital_products', 'dp', 'dp.id = ce.digital_product_id')
      .where('dp.category_id = :categoryId', { categoryId })
      .andWhere('ce.eventType = :type', { type: ConversionEventType.CHECKOUT_COMPLETED })
      .andWhere('ce.occurredAt >= :startDate', { startDate })
      .andWhere('ce.occurredAt < :endDate', { endDate })
      .groupBy('ce.digitalProductId')
      .orderBy('"salesCount"', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => ({
      digitalProductId: r.digitalProductId,
      salesCount: parseInt(r.salesCount, 10) || 0,
    }));
  }
}
