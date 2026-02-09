import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { createHash } from 'crypto';
import { PageView } from './entities/page-view.entity';
import { Post } from '../../entities/post.entity';
import { NewsletterSubscriber, SubscriberStatus } from '../../entities/newsletter-subscriber.entity';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { AnalyticsPeriod } from './dto/analytics-query.dto';
import {
  DashboardOverviewDto,
  PostStatsDto,
  TopPostDto,
  TrafficSourceItemDto,
  DailyViewDto,
} from './dto/analytics-response.dto';
import { ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(PageView)
    private readonly pageViewRepository: Repository<PageView>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Track a page view. The client IP is hashed for privacy.
   */
  async trackPageView(
    dto: TrackPageViewDto,
    userId?: string,
    userAgent?: string,
    ip?: string,
  ): Promise<ApiResponse<null>> {
    const ipHash = ip
      ? createHash('sha256').update(ip).digest('hex').substring(0, 16)
      : undefined;

    const pageView = this.pageViewRepository.create({
      postId: dto.postId || undefined,
      path: dto.path,
      referrer: dto.referrer || undefined,
      userAgent: userAgent || undefined,
      ipHash,
      sessionId: dto.sessionId || undefined,
      userId: userId || undefined,
    });

    await this.pageViewRepository.save(pageView);

    return {
      status: 'success',
      message: 'Page view tracked successfully',
      data: null,
    };
  }

  /**
   * Dashboard overview with total views, unique visitors, popular posts,
   * and subscriber growth over the last 30 days.
   */
  async getDashboard(): Promise<ApiResponse<DashboardOverviewDto>> {
    const thirtyDaysAgo = this.getDateOffset(30);

    // Total views in last 30 days
    const totalViewsResult = await this.pageViewRepository
      .createQueryBuilder('pv')
      .where('pv.created_at >= :since', { since: thirtyDaysAgo })
      .getCount();

    // Unique visitors (by ip_hash) in last 30 days
    const uniqueVisitorsResult = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select('COUNT(DISTINCT pv.ip_hash)', 'count')
      .where('pv.created_at >= :since', { since: thirtyDaysAgo })
      .andWhere('pv.ip_hash IS NOT NULL')
      .getRawOne();
    const uniqueVisitors = parseInt(uniqueVisitorsResult?.count ?? '0', 10);

    // Total published posts
    const totalPosts = await this.postRepository.count({
      where: { status: 'published' as any },
    });

    // Total active subscribers
    const totalSubscribers = await this.subscriberRepository.count({
      where: { status: SubscriberStatus.ACTIVE },
    });

    // Subscriber growth in last 30 days
    const subscriberGrowthResult = await this.subscriberRepository
      .createQueryBuilder('sub')
      .where('sub.created_at >= :since', { since: thirtyDaysAgo })
      .andWhere('sub.status = :status', { status: SubscriberStatus.ACTIVE })
      .getCount();

    // Popular posts in last 30 days
    const popularPosts = await this.getTopPostsRaw(30, 5);

    const dashboard: DashboardOverviewDto = {
      totalViews: totalViewsResult,
      uniqueVisitors,
      totalPosts,
      totalSubscribers,
      subscriberGrowth: subscriberGrowthResult,
      popularPosts,
    };

    return {
      status: 'success',
      message: 'Dashboard data retrieved successfully',
      data: dashboard,
    };
  }

  /**
   * Stats for a specific post: total views, unique visitors,
   * top referrers, and daily view chart data.
   */
  async getPostStats(postId: string): Promise<ApiResponse<PostStatsDto>> {
    // Total views for this post
    const totalViews = await this.pageViewRepository.count({
      where: { postId },
    });

    // Unique visitors for this post
    const uniqueResult = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select('COUNT(DISTINCT pv.ip_hash)', 'count')
      .where('pv.post_id = :postId', { postId })
      .andWhere('pv.ip_hash IS NOT NULL')
      .getRawOne();
    const uniqueVisitors = parseInt(uniqueResult?.count ?? '0', 10);

    // Top referrers for this post
    const referrers = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select('pv.referrer', 'source')
      .addSelect('COUNT(*)', 'visits')
      .where('pv.post_id = :postId', { postId })
      .andWhere('pv.referrer IS NOT NULL')
      .andWhere("pv.referrer != ''")
      .groupBy('pv.referrer')
      .orderBy('visits', 'DESC')
      .limit(10)
      .getRawMany();

    const totalReferrerVisits = referrers.reduce(
      (sum: number, r: any) => sum + parseInt(r.visits, 10),
      0,
    );

    const topReferrers: TrafficSourceItemDto[] = referrers.map((r: any) => {
      const visits = parseInt(r.visits, 10);
      return {
        source: r.source,
        visits,
        percentage:
          totalReferrerVisits > 0
            ? Math.round((visits / totalReferrerVisits) * 10000) / 100
            : 0,
      };
    });

    // Daily views for last 30 days
    const dailyViews = await this.getDailyViewsForPost(postId, 30);

    const stats: PostStatsDto = {
      totalViews,
      uniqueVisitors,
      avgTimeLabel: 'N/A',
      topReferrers,
      dailyViews,
    };

    return {
      status: 'success',
      message: 'Post stats retrieved successfully',
      data: stats,
    };
  }

  /**
   * Top performing posts for a given period.
   */
  async getTopPosts(
    period: AnalyticsPeriod = '30d',
  ): Promise<ApiResponse<TopPostDto[]>> {
    const days = this.periodToDays(period);
    const topPosts = await this.getTopPostsRaw(days, 20);

    return {
      status: 'success',
      message: 'Top posts retrieved successfully',
      data: topPosts,
    };
  }

  /**
   * Traffic source breakdown for a given period.
   */
  async getTrafficSources(
    period: AnalyticsPeriod = '30d',
  ): Promise<ApiResponse<TrafficSourceItemDto[]>> {
    const days = this.periodToDays(period);
    const since = this.getDateOffset(days);

    const sources = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select(
        `CASE
          WHEN pv.referrer IS NULL OR pv.referrer = '' THEN 'Direct'
          WHEN pv.referrer ILIKE '%google%' THEN 'Google'
          WHEN pv.referrer ILIKE '%bing%' THEN 'Bing'
          WHEN pv.referrer ILIKE '%facebook%' OR pv.referrer ILIKE '%fb.com%' THEN 'Facebook'
          WHEN pv.referrer ILIKE '%twitter%' OR pv.referrer ILIKE '%t.co%' THEN 'Twitter/X'
          WHEN pv.referrer ILIKE '%linkedin%' THEN 'LinkedIn'
          WHEN pv.referrer ILIKE '%reddit%' THEN 'Reddit'
          WHEN pv.referrer ILIKE '%youtube%' THEN 'YouTube'
          ELSE 'Other'
        END`,
        'source',
      )
      .addSelect('COUNT(*)', 'visits')
      .where('pv.created_at >= :since', { since })
      .groupBy('source')
      .orderBy('visits', 'DESC')
      .getRawMany();

    const totalVisits = sources.reduce(
      (sum: number, s: any) => sum + parseInt(s.visits, 10),
      0,
    );

    const trafficSources: TrafficSourceItemDto[] = sources.map((s: any) => {
      const visits = parseInt(s.visits, 10);
      return {
        source: s.source,
        visits,
        percentage:
          totalVisits > 0
            ? Math.round((visits / totalVisits) * 10000) / 100
            : 0,
      };
    });

    return {
      status: 'success',
      message: 'Traffic sources retrieved successfully',
      data: trafficSources,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private async getTopPostsRaw(
    days: number,
    limit: number,
  ): Promise<TopPostDto[]> {
    const since = this.getDateOffset(days);

    const results = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select('pv.post_id', 'id')
      .addSelect('post.title', 'title')
      .addSelect('post.slug', 'slug')
      .addSelect('COUNT(*)', 'views')
      .addSelect('COUNT(DISTINCT pv.ip_hash)', 'uniqueViews')
      .innerJoin('posts', 'post', 'post.id = pv.post_id')
      .where('pv.created_at >= :since', { since })
      .andWhere('pv.post_id IS NOT NULL')
      .groupBy('pv.post_id')
      .addGroupBy('post.title')
      .addGroupBy('post.slug')
      .orderBy('views', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      views: parseInt(row.views, 10),
      uniqueViews: parseInt(row.uniqueViews, 10),
    }));
  }

  private async getDailyViewsForPost(
    postId: string,
    days: number,
  ): Promise<DailyViewDto[]> {
    const since = this.getDateOffset(days);

    const results = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select("TO_CHAR(pv.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'views')
      .where('pv.post_id = :postId', { postId })
      .andWhere('pv.created_at >= :since', { since })
      .groupBy("TO_CHAR(pv.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map((row: any) => ({
      date: row.date,
      views: parseInt(row.views, 10),
    }));
  }

  private periodToDays(period: AnalyticsPeriod): number {
    switch (period) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 30;
    }
  }

  private getDateOffset(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}
