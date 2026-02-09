import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { ReviewVote } from '../../entities/review-vote.entity';
import { ReviewReport } from '../../entities/review-report.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PaginatedResponse } from '../../common/interfaces/response.interface';
import {
  ReviewStatus,
  VoteType,
  ReportStatus,
} from './enums/review.enums';
import { ReviewSortBy } from './dto/review-query.dto';

export interface ReviewQueryOptions {
  cursor?: string;
  limit?: number;
  sortBy?: ReviewSortBy;
  rating?: number;
  status?: ReviewStatus;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  verifiedPurchasePercent: number;
}

export interface TopReviewer {
  userId: string;
  reviewCount: number;
  helpfulCount: number;
  averageRating: number;
}

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewVote)
    private readonly voteRepository: Repository<ReviewVote>,
    @InjectRepository(ReviewReport)
    private readonly reportRepository: Repository<ReviewReport>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  // ──────────────────────────────────────────────
  //  Review query methods
  // ──────────────────────────────────────────────

  async findProductReviews(
    productId: string,
    query: ReviewQueryOptions,
  ): Promise<PaginatedResponse<Review>> {
    const {
      cursor,
      limit = 20,
      sortBy = ReviewSortBy.NEWEST,
      rating,
      status,
    } = query;

    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.digitalProductId = :productId', { productId });

    // Status filter — default to approved for public queries
    if (status) {
      qb.andWhere('review.status = :status', { status });
    } else {
      qb.andWhere('review.status = :status', { status: ReviewStatus.APPROVED });
    }

    // Rating filter
    if (rating) {
      qb.andWhere('review.rating = :rating', { rating });
    }

    // Sorting
    let orderColumn: string;
    let orderDirection: 'ASC' | 'DESC';

    switch (sortBy) {
      case ReviewSortBy.HIGHEST:
        orderColumn = 'review.rating';
        orderDirection = 'DESC';
        break;
      case ReviewSortBy.LOWEST:
        orderColumn = 'review.rating';
        orderDirection = 'ASC';
        break;
      case ReviewSortBy.MOST_HELPFUL:
        orderColumn = 'review.helpfulCount';
        orderDirection = 'DESC';
        break;
      case ReviewSortBy.NEWEST:
      default:
        orderColumn = 'review.createdAt';
        orderDirection = 'DESC';
        break;
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor.id && decodedCursor.createdAt) {
        if (orderDirection === 'DESC') {
          qb.andWhere(
            `(${orderColumn} < :cursorValue OR (${orderColumn} = :cursorValue AND review.id < :cursorId))`,
            { cursorValue: decodedCursor.createdAt, cursorId: decodedCursor.id },
          );
        } else {
          qb.andWhere(
            `(${orderColumn} > :cursorValue OR (${orderColumn} = :cursorValue AND review.id > :cursorId))`,
            { cursorValue: decodedCursor.createdAt, cursorId: decodedCursor.id },
          );
        }
      }
    }

    qb.orderBy(orderColumn, orderDirection);
    qb.addOrderBy('review.id', orderDirection);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const lastItem = items[items.length - 1];
    const nextCursor =
      hasNextPage && lastItem
        ? this.encodeCursor({ id: lastItem.id, createdAt: lastItem.createdAt })
        : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findById(id: string): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'votes'],
    });
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { userId, digitalProductId: productId },
    });
  }

  async create(data: Partial<Review>): Promise<Review> {
    const review = this.reviewRepository.create(data);
    return this.reviewRepository.save(review);
  }

  async update(id: string, data: Partial<Review>): Promise<Review | null> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) return null;

    Object.assign(review, data);
    return this.reviewRepository.save(review);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.reviewRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  // ──────────────────────────────────────────────
  //  Aggregate stats
  // ──────────────────────────────────────────────

  async getReviewStats(productId: string): Promise<ReviewStats> {
    // Average rating and total count
    const statsResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.digitalProductId = :productId', { productId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    // Rating distribution (1-5)
    const distributionResults = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.digitalProductId = :productId', { productId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('review.rating')
      .getRawMany();

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of distributionResults) {
      ratingDistribution[parseInt(row.rating, 10)] = parseInt(row.count, 10);
    }

    // Verified purchase percentage
    const totalReviews = parseInt(statsResult?.totalReviews, 10) || 0;
    let verifiedPurchasePercent = 0;

    if (totalReviews > 0) {
      const verifiedResult = await this.reviewRepository
        .createQueryBuilder('review')
        .select('COUNT(review.id)', 'verifiedCount')
        .where('review.digitalProductId = :productId', { productId })
        .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
        .andWhere('review.isVerifiedPurchase = :verified', { verified: true })
        .getRawOne();

      const verifiedCount = parseInt(verifiedResult?.verifiedCount, 10) || 0;
      verifiedPurchasePercent = Math.round((verifiedCount / totalReviews) * 100);
    }

    return {
      averageRating: parseFloat(statsResult?.averageRating) || 0,
      totalReviews,
      ratingDistribution,
      verifiedPurchasePercent,
    };
  }

  // ──────────────────────────────────────────────
  //  Moderation queries
  // ──────────────────────────────────────────────

  async findPendingModeration(
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<Review>> {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.status = :status', { status: ReviewStatus.PENDING_MODERATION });

    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor.id && decodedCursor.createdAt) {
        qb.andWhere(
          '(review.createdAt < :cursorCreatedAt OR (review.createdAt = :cursorCreatedAt AND review.id < :cursorId))',
          { cursorCreatedAt: decodedCursor.createdAt, cursorId: decodedCursor.id },
        );
      }
    }

    qb.orderBy('review.createdAt', 'ASC');
    qb.addOrderBy('review.id', 'ASC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const lastItem = items[items.length - 1];
    const nextCursor =
      hasNextPage && lastItem
        ? this.encodeCursor({ id: lastItem.id, createdAt: lastItem.createdAt })
        : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findFlaggedReviews(
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<Review>> {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.status = :status', { status: ReviewStatus.FLAGGED });

    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor.id && decodedCursor.createdAt) {
        qb.andWhere(
          '(review.createdAt < :cursorCreatedAt OR (review.createdAt = :cursorCreatedAt AND review.id < :cursorId))',
          { cursorCreatedAt: decodedCursor.createdAt, cursorId: decodedCursor.id },
        );
      }
    }

    qb.orderBy('review.createdAt', 'DESC');
    qb.addOrderBy('review.id', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const lastItem = items[items.length - 1];
    const nextCursor =
      hasNextPage && lastItem
        ? this.encodeCursor({ id: lastItem.id, createdAt: lastItem.createdAt })
        : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Top reviewers
  // ──────────────────────────────────────────────

  async getTopReviewers(limit: number = 10): Promise<TopReviewer[]> {
    const results = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.userId', 'userId')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .addSelect('SUM(review.helpfulCount)', 'helpfulCount')
      .addSelect('AVG(review.rating)', 'averageRating')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('review.userId')
      .orderBy('"reviewCount"', 'DESC')
      .addOrderBy('"helpfulCount"', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((row) => ({
      userId: row.userId,
      reviewCount: parseInt(row.reviewCount, 10),
      helpfulCount: parseInt(row.helpfulCount, 10) || 0,
      averageRating: parseFloat(row.averageRating) || 0,
    }));
  }

  // ──────────────────────────────────────────────
  //  Vote methods
  // ──────────────────────────────────────────────

  async findVote(reviewId: string, userId: string): Promise<ReviewVote | null> {
    return this.voteRepository.findOne({
      where: { reviewId, userId },
    });
  }

  async createVote(data: Partial<ReviewVote>): Promise<ReviewVote> {
    const vote = this.voteRepository.create(data);
    return this.voteRepository.save(vote);
  }

  async updateVote(id: string, data: Partial<ReviewVote>): Promise<ReviewVote | null> {
    const vote = await this.voteRepository.findOne({ where: { id } });
    if (!vote) return null;

    Object.assign(vote, data);
    return this.voteRepository.save(vote);
  }

  async deleteVote(id: string): Promise<boolean> {
    const result = await this.voteRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  // ──────────────────────────────────────────────
  //  Report methods
  // ──────────────────────────────────────────────

  async createReport(data: Partial<ReviewReport>): Promise<ReviewReport> {
    const report = this.reportRepository.create(data);
    return this.reportRepository.save(report);
  }

  async countPendingReports(reviewId: string): Promise<number> {
    return this.reportRepository.count({
      where: { reviewId, status: ReportStatus.PENDING },
    });
  }

  // ──────────────────────────────────────────────
  //  Purchase verification & social proof
  // ──────────────────────────────────────────────

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const count = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .andWhere('item.digitalProductId = :productId', { productId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getCount();

    return count > 0;
  }

  async countRecentPurchases(productId: string, hours: number = 24): Promise<number> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('item.digitalProductId = :productId', { productId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.completedAt >= :since', { since })
      .getCount();
  }

  // ──────────────────────────────────────────────
  //  All reviews (admin)
  // ──────────────────────────────────────────────

  async findAllReviews(query: {
    cursor?: string;
    limit?: number;
    search?: string;
    status?: ReviewStatus;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Review>> {
    const {
      cursor,
      limit = 20,
      search,
      status,
      rating,
      sortOrder = 'DESC',
    } = query;

    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoin('review.digitalProduct', 'product')
      .addSelect(['product.id', 'product.title', 'product.slug']);

    if (status) {
      qb.andWhere('review.status = :status', { status });
    }

    if (rating) {
      qb.andWhere('review.rating = :rating', { rating });
    }

    if (search) {
      qb.andWhere(
        '(review.title ILIKE :search OR review.body ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor.id && decodedCursor.createdAt) {
        if (sortOrder === 'DESC') {
          qb.andWhere(
            '(review.createdAt < :cursorCreatedAt OR (review.createdAt = :cursorCreatedAt AND review.id < :cursorId))',
            { cursorCreatedAt: decodedCursor.createdAt, cursorId: decodedCursor.id },
          );
        } else {
          qb.andWhere(
            '(review.createdAt > :cursorCreatedAt OR (review.createdAt = :cursorCreatedAt AND review.id > :cursorId))',
            { cursorCreatedAt: decodedCursor.createdAt, cursorId: decodedCursor.id },
          );
        }
      }
    }

    qb.orderBy('review.createdAt', sortOrder);
    qb.addOrderBy('review.id', sortOrder);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    // Get total count
    const totalQb = this.reviewRepository.createQueryBuilder('review');
    if (status) totalQb.andWhere('review.status = :status', { status });
    if (rating) totalQb.andWhere('review.rating = :rating', { rating });
    if (search) {
      totalQb.andWhere(
        '(review.title ILIKE :search OR review.body ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    const total = await totalQb.getCount();

    const lastItem = items[items.length - 1];
    const nextCursor =
      hasNextPage && lastItem
        ? this.encodeCursor({ id: lastItem.id, createdAt: lastItem.createdAt })
        : undefined;

    return {
      items,
      meta: {
        total,
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findByIdWithRelations(id: string): Promise<Review | null> {
    return this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoin('review.digitalProduct', 'product')
      .addSelect(['product.id', 'product.title', 'product.slug'])
      .leftJoinAndSelect('review.reports', 'reports')
      .leftJoin('reports.reporter', 'reporter')
      .addSelect(['reporter.id', 'reporter.firstName', 'reporter.lastName', 'reporter.email'])
      .where('review.id = :id', { id })
      .getOne();
  }

  // ──────────────────────────────────────────────
  //  Global stats (no productId filter)
  // ──────────────────────────────────────────────

  async getGlobalReviewStats(): Promise<{
    totalReviews: number;
    averageRating: number;
    pendingModeration: number;
    flaggedCount: number;
    approvedCount: number;
    rejectedCount: number;
    ratingDistribution: { rating: number; count: number }[];
    verifiedPurchaseCount: number;
    unverifiedCount: number;
    responseRate: number;
  }> {
    // Total approved reviews stats
    const approvedStats = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    const totalReviews = parseInt(approvedStats?.totalReviews, 10) || 0;
    const averageRating = parseFloat(approvedStats?.averageRating) || 0;

    // Status counts
    const statusCounts = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.status', 'status')
      .addSelect('COUNT(review.id)', 'count')
      .groupBy('review.status')
      .getRawMany();

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = parseInt(row.count, 10);
    }

    const pendingModeration = statusMap[ReviewStatus.PENDING_MODERATION] || 0;
    const flaggedCount = statusMap[ReviewStatus.FLAGGED] || 0;
    const approvedCount = statusMap[ReviewStatus.APPROVED] || 0;
    const rejectedCount = statusMap[ReviewStatus.REJECTED] || 0;

    // Rating distribution
    const distributionResults = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    const ratingDistribution = [5, 4, 3, 2, 1].map((r) => {
      const found = distributionResults.find(
        (d) => parseInt(d.rating, 10) === r,
      );
      return { rating: r, count: found ? parseInt(found.count, 10) : 0 };
    });

    // Verified purchase count
    const verifiedResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.isVerifiedPurchase = :verified', { verified: true })
      .getRawOne();

    const verifiedPurchaseCount = parseInt(verifiedResult?.count, 10) || 0;
    const unverifiedCount = totalReviews - verifiedPurchaseCount;

    // Response rate (reviews with seller response / total approved)
    const respondedResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.sellerResponse IS NOT NULL')
      .getRawOne();

    const respondedCount = parseInt(respondedResult?.count, 10) || 0;
    const responseRate = totalReviews > 0 ? respondedCount / totalReviews : 0;

    return {
      totalReviews,
      averageRating,
      pendingModeration,
      flaggedCount,
      approvedCount,
      rejectedCount,
      ratingDistribution,
      verifiedPurchaseCount,
      unverifiedCount,
      responseRate,
    };
  }

  // ──────────────────────────────────────────────
  //  Analytics
  // ──────────────────────────────────────────────

  async getReviewAnalytics(): Promise<{
    averageByCategory: { category: string; averageRating: number; reviewCount: number }[];
    trends: { date: string; count: number; averageRating: number }[];
    topRatedProducts: { productId: string; productTitle: string; averageRating: number; reviewCount: number }[];
    lowestRatedProducts: { productId: string; productTitle: string; averageRating: number; reviewCount: number }[];
  }> {
    // Average rating by product type (as "category")
    const categoryResults = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.digitalProduct', 'product')
      .select('product.type', 'category')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('product.type')
      .orderBy('"reviewCount"', 'DESC')
      .getRawMany();

    const averageByCategory = categoryResults.map((row) => ({
      category: row.category,
      averageRating: parseFloat(row.averageRating) || 0,
      reviewCount: parseInt(row.reviewCount, 10),
    }));

    // Reviews over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendResults = await this.reviewRepository
      .createQueryBuilder('review')
      .select("DATE_TRUNC('day', review.created_at)", 'date')
      .addSelect('COUNT(review.id)', 'count')
      .addSelect('AVG(review.rating)', 'averageRating')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.createdAt >= :since', { since: thirtyDaysAgo })
      .groupBy("DATE_TRUNC('day', review.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    const trends = trendResults.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
      averageRating: parseFloat(row.averageRating) || 0,
    }));

    // Top rated products (min 2 reviews)
    const topRatedResults = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.digitalProduct', 'product')
      .select('product.id', 'productId')
      .addSelect('product.title', 'productTitle')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('product.id')
      .addGroupBy('product.title')
      .having('COUNT(review.id) >= 2')
      .orderBy('"averageRating"', 'DESC')
      .addOrderBy('"reviewCount"', 'DESC')
      .limit(10)
      .getRawMany();

    const topRatedProducts = topRatedResults.map((row) => ({
      productId: row.productId,
      productTitle: row.productTitle,
      averageRating: parseFloat(row.averageRating) || 0,
      reviewCount: parseInt(row.reviewCount, 10),
    }));

    // Lowest rated products (min 2 reviews)
    const lowestRatedResults = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.digitalProduct', 'product')
      .select('product.id', 'productId')
      .addSelect('product.title', 'productTitle')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('product.id')
      .addGroupBy('product.title')
      .having('COUNT(review.id) >= 2')
      .orderBy('"averageRating"', 'ASC')
      .addOrderBy('"reviewCount"', 'DESC')
      .limit(10)
      .getRawMany();

    const lowestRatedProducts = lowestRatedResults.map((row) => ({
      productId: row.productId,
      productTitle: row.productTitle,
      averageRating: parseFloat(row.averageRating) || 0,
      reviewCount: parseInt(row.reviewCount, 10),
    }));

    return {
      averageByCategory,
      trends,
      topRatedProducts,
      lowestRatedProducts,
    };
  }

  // ──────────────────────────────────────────────
  //  Report management
  // ──────────────────────────────────────────────

  async dismissAllReports(reviewId: string): Promise<void> {
    await this.reportRepository
      .createQueryBuilder()
      .update(ReviewReport)
      .set({ status: ReportStatus.DISMISSED })
      .where('reviewId = :reviewId', { reviewId })
      .andWhere('status = :status', { status: ReportStatus.PENDING })
      .execute();
  }

  // ──────────────────────────────────────────────
  //  Cursor helpers
  // ──────────────────────────────────────────────

  private encodeCursor(data: { id: string; createdAt: Date }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { id: string; createdAt: string } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { id: '', createdAt: '' };
    }
  }
}
