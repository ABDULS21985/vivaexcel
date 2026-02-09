import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RedisService } from '../../../shared/redis/redis.service';
import { MarketplaceAnalyticsRepository } from '../marketplace-analytics.repository';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { ConversionEventType } from '../enums/analytics.enums';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// ──────────────────────────────────────────────
//  Redis cache keys & TTLs
// ──────────────────────────────────────────────

const REDIS_PREFIX = 'recommendations';
const FBT_PREFIX = `${REDIS_PREFIX}:fbt`;
const ALSO_VIEWED_PREFIX = `${REDIS_PREFIX}:also_viewed`;
const TRENDING_KEY = `${REDIS_PREFIX}:trending`;
const TOP_RATED_PREFIX = `${REDIS_PREFIX}:top_rated`;
const PERSONALIZED_PREFIX = `${REDIS_PREFIX}:personalized`;
const BADGES_PREFIX = `${REDIS_PREFIX}:badges`;

const CACHE_TTL = 3600; // 1 hour
const BADGES_CACHE_TTL = 1800; // 30 minutes

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────

export interface RecommendedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
}

export type ProductBadge = 'trending' | 'bestseller' | 'new' | 'hot';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly repository: MarketplaceAnalyticsRepository,
    private readonly redis: RedisService,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────
  //  Frequently bought together
  // ──────────────────────────────────────────────

  async getFrequentlyBoughtTogether(
    productId: string,
    limit: number = 4,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${FBT_PREFIX}:${productId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for frequently bought together: ${productId}`);
      return {
        status: 'success',
        message: 'Frequently bought together products retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    this.logger.debug(`Cache MISS for frequently bought together: ${productId}`);

    const coProducts = await this.repository.getFrequentlyBoughtTogether(
      productId,
      limit,
    );

    const productIds = coProducts.map((p) => p.digitalProductId);
    const products = await this.getProductDetails(productIds);

    await this.redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);

    return {
      status: 'success',
      message: 'Frequently bought together products retrieved successfully',
      data: products,
    };
  }

  // ──────────────────────────────────────────────
  //  Customers also viewed
  // ──────────────────────────────────────────────

  async getCustomersAlsoViewed(
    productId: string,
    limit: number = 8,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${ALSO_VIEWED_PREFIX}:${productId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for also viewed: ${productId}`);
      return {
        status: 'success',
        message: 'Customers also viewed products retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    this.logger.debug(`Cache MISS for also viewed: ${productId}`);

    const coViews = await this.repository.getProductCoViews(productId, limit);
    const productIds = coViews.map((p) => p.digitalProductId);
    const products = await this.getProductDetails(productIds);

    await this.redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);

    return {
      status: 'success',
      message: 'Customers also viewed products retrieved successfully',
      data: products,
    };
  }

  // ──────────────────────────────────────────────
  //  Trending products
  // ──────────────────────────────────────────────

  async getTrending(
    limit: number = 10,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${TRENDING_KEY}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug('Cache HIT for trending products');
      return {
        status: 'success',
        message: 'Trending products retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    this.logger.debug('Cache MISS for trending products');

    // Highest view velocity in last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const velocity = await this.repository.getProductViewVelocity(
      sevenDaysAgo,
      now,
      limit,
    );

    const productIds = velocity.map((v) => v.digitalProductId);
    const products = await this.getProductDetails(productIds);

    await this.redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);

    return {
      status: 'success',
      message: 'Trending products retrieved successfully',
      data: products,
    };
  }

  // ──────────────────────────────────────────────
  //  Top rated in category
  // ──────────────────────────────────────────────

  async getTopRatedInCategory(
    categoryId: string,
    limit: number = 8,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${TOP_RATED_PREFIX}:${categoryId}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for top rated in category: ${categoryId}`);
      return {
        status: 'success',
        message: 'Top rated products in category retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    this.logger.debug(`Cache MISS for top rated in category: ${categoryId}`);

    const products = await this.digitalProductRepository.find({
      where: { categoryId, status: 'published' as any },
      order: { averageRating: 'DESC', totalReviews: 'DESC' },
      take: limit,
    });

    const result: RecommendedProduct[] = products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: Number(p.price),
      featuredImage: p.featuredImage,
      averageRating: Number(p.averageRating),
      totalReviews: p.totalReviews,
    }));

    await this.redis.set(cacheKey, JSON.stringify(result), CACHE_TTL);

    return {
      status: 'success',
      message: 'Top rated products in category retrieved successfully',
      data: result,
    };
  }

  // ──────────────────────────────────────────────
  //  Personalized recommendations
  // ──────────────────────────────────────────────

  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 8,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${PERSONALIZED_PREFIX}:${userId}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for personalized: ${userId}`);
      return {
        status: 'success',
        message: 'Personalized recommendations retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    this.logger.debug(`Cache MISS for personalized: ${userId}`);

    // 1. Get user's recently viewed products
    const viewedProductIds = await this.repository.getUserRecentlyViewedProducts(
      userId,
      20,
    );

    // 2. Get user's purchased products (to exclude from recommendations)
    const purchasedProductIds = await this.repository.getUserPurchasedProducts(userId);
    const excludeSet = new Set([...purchasedProductIds, ...viewedProductIds]);

    // 3. Find co-viewed products across all recently viewed items
    const candidateMap = new Map<string, number>();

    for (const viewedId of viewedProductIds.slice(0, 5)) {
      const coViews = await this.repository.getProductCoViews(viewedId, 10);
      for (const coView of coViews) {
        if (!excludeSet.has(coView.digitalProductId)) {
          const existing = candidateMap.get(coView.digitalProductId) ?? 0;
          candidateMap.set(coView.digitalProductId, existing + coView.coViewCount);
        }
      }
    }

    // 4. Also find frequently bought together from purchased items
    for (const purchasedId of purchasedProductIds.slice(0, 5)) {
      const fbt = await this.repository.getFrequentlyBoughtTogether(purchasedId, 5);
      for (const item of fbt) {
        if (!excludeSet.has(item.digitalProductId)) {
          const existing = candidateMap.get(item.digitalProductId) ?? 0;
          // Weight purchase-based recommendations higher
          candidateMap.set(item.digitalProductId, existing + item.coPurchaseCount * 2);
        }
      }
    }

    // 5. Sort by score and pick top N
    const sortedCandidates = Array.from(candidateMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    let products: RecommendedProduct[];

    if (sortedCandidates.length >= limit) {
      products = await this.getProductDetails(sortedCandidates);
    } else {
      // Supplement with trending products if not enough candidates
      const needed = limit - sortedCandidates.length;
      const trending = await this.getTrendingProductIds(needed + 10);
      const supplementIds = trending
        .filter((id) => !excludeSet.has(id) && !candidateMap.has(id))
        .slice(0, needed);

      const allIds = [...sortedCandidates, ...supplementIds];
      products = await this.getProductDetails(allIds);
    }

    // Cache with shorter TTL for personalized (30 min)
    await this.redis.set(cacheKey, JSON.stringify(products), 1800);

    return {
      status: 'success',
      message: 'Personalized recommendations retrieved successfully',
      data: products,
    };
  }

  // ──────────────────────────────────────────────
  //  Product badges
  // ──────────────────────────────────────────────

  async getProductBadges(
    productId: string,
  ): Promise<ApiResponse<ProductBadge[]>> {
    const cacheKey = `${BADGES_PREFIX}:${productId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for badges: ${productId}`);
      return {
        status: 'success',
        message: 'Product badges retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    this.logger.debug(`Cache MISS for badges: ${productId}`);

    const badges: ProductBadge[] = [];

    const product = await this.digitalProductRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      return {
        status: 'success',
        message: 'Product badges retrieved successfully',
        data: [],
      };
    }

    const now = new Date();

    // 1. "new" badge: created in last 14 days
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14);
    if (product.createdAt >= fourteenDaysAgo) {
      badges.push('new');
    }

    // 2. "trending" badge: top 10% view velocity in last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const allVelocity = await this.repository.getProductViewVelocity(
      sevenDaysAgo,
      now,
      1000, // Get a broad sample
    );

    if (allVelocity.length > 0) {
      const productVelocity = allVelocity.find(
        (v) => v.digitalProductId === productId,
      );

      if (productVelocity) {
        const top10PercentThreshold = Math.ceil(allVelocity.length * 0.1);
        const topProductIds = allVelocity
          .slice(0, top10PercentThreshold)
          .map((v) => v.digitalProductId);

        if (topProductIds.includes(productId)) {
          badges.push('trending');
        }
      }
    }

    // 3. "bestseller" badge: top 10% sales in its category (last 90 days)
    if (product.categoryId) {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setUTCDate(ninetyDaysAgo.getUTCDate() - 90);

      const categorySales = await this.repository.getProductSalesInCategory(
        product.categoryId,
        ninetyDaysAgo,
        now,
        1000,
      );

      if (categorySales.length > 0) {
        const top10PercentThreshold = Math.ceil(categorySales.length * 0.1);
        const topProductIds = categorySales
          .slice(0, top10PercentThreshold)
          .map((s) => s.digitalProductId);

        if (topProductIds.includes(productId)) {
          badges.push('bestseller');
        }
      }
    }

    // 4. "hot" badge: high recent conversion rate (last 7 days)
    const recentViews = await this.repository.getViewsInPeriod(
      sevenDaysAgo,
      now,
      productId,
    );

    if (recentViews >= 10) {
      // Require minimum views for statistical significance
      const recentPurchases = await this.repository.getConversionCountByType(
        sevenDaysAgo,
        now,
        ConversionEventType.CHECKOUT_COMPLETED,
        productId,
      );

      const conversionRate = recentPurchases / recentViews;
      // "hot" if conversion rate exceeds 5% (which is above average for digital products)
      if (conversionRate >= 0.05) {
        badges.push('hot');
      }
    }

    await this.redis.set(cacheKey, JSON.stringify(badges), BADGES_CACHE_TTL);

    return {
      status: 'success',
      message: 'Product badges retrieved successfully',
      data: badges,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Fetch full product details for a list of IDs, preserving the input order.
   */
  private async getProductDetails(
    productIds: string[],
  ): Promise<RecommendedProduct[]> {
    if (productIds.length === 0) return [];

    const products = await this.digitalProductRepository.find({
      where: { id: In(productIds) },
    });

    // Build a map for O(1) lookup and preserve the input order
    const productMap = new Map(products.map((p) => [p.id, p]));

    return productIds
      .filter((id) => productMap.has(id))
      .map((id) => {
        const p = productMap.get(id)!;
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: Number(p.price),
          featuredImage: p.featuredImage,
          averageRating: Number(p.averageRating),
          totalReviews: p.totalReviews,
        };
      });
  }

  /**
   * Helper to get trending product IDs (used internally for supplementing personalized recs).
   */
  private async getTrendingProductIds(limit: number): Promise<string[]> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const velocity = await this.repository.getProductViewVelocity(
      sevenDaysAgo,
      now,
      limit,
    );

    return velocity.map((v) => v.digitalProductId);
  }
}
