import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { RedisService } from '../../../shared/redis/redis.service';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { ProductView } from '../../../entities/product-view.entity';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
import { ProductSimilarity } from '../entities/product-similarity.entity';
import { RecommendationLog, RecommendationType } from '../entities/recommendation-log.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// ──────────────────────────────────────────────
//  Redis cache keys & TTLs
// ──────────────────────────────────────────────

const CACHE_PREFIX = 'ai_recs';
const CACHE_TTL = 1800; // 30 minutes
const AI_CACHE_TTL = 3600; // 1 hour

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────

interface RecommendedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
  type: string;
  reason?: string;
}

@Injectable()
export class AIRecommendationService {
  private readonly logger = new Logger(AIRecommendationService.name);
  private readonly anthropicClient: Anthropic | null;
  private readonly model = 'claude-sonnet-4-5-20250929';

  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
    @InjectRepository(ProductView)
    private readonly productViewRepository: Repository<ProductView>,
    @InjectRepository(UserPreferenceProfile)
    private readonly profileRepository: Repository<UserPreferenceProfile>,
    @InjectRepository(ProductSimilarity)
    private readonly similarityRepository: Repository<ProductSimilarity>,
    @InjectRepository(RecommendationLog)
    private readonly logRepository: Repository<RecommendationLog>,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY is not configured. AI-powered recommendations will be unavailable.',
      );
      this.anthropicClient = null;
    } else {
      this.anthropicClient = new Anthropic({ apiKey });
    }
  }

  // ──────────────────────────────────────────────
  //  Content-Based Filtering
  // ──────────────────────────────────────────────

  async getSimilarProducts(
    productId: string,
    limit: number = 8,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${CACHE_PREFIX}:similar:${productId}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return {
        status: 'success',
        message: 'Similar products retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    // Check pre-computed similarities first
    const similarities = await this.similarityRepository
      .createQueryBuilder('ps')
      .where('ps.productAId = :productId OR ps.productBId = :productId', { productId })
      .orderBy('ps.similarityScore', 'DESC')
      .take(limit)
      .getMany();

    let productIds: string[];

    if (similarities.length >= limit) {
      productIds = similarities.map((s) =>
        s.productAId === productId ? s.productBId : s.productAId,
      );
    } else {
      // Fallback to on-the-fly content similarity
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['tags', 'category'],
      });

      if (!product) {
        return {
          status: 'success',
          message: 'Product not found',
          data: [],
        };
      }

      const qb = this.productRepository
        .createQueryBuilder('dp')
        .where('dp.id != :productId', { productId })
        .andWhere('dp.status = :status', { status: 'published' });

      if (product.categoryId) {
        qb.andWhere('dp.categoryId = :categoryId', { categoryId: product.categoryId });
      }

      qb.orderBy('dp.averageRating', 'DESC')
        .addOrderBy('dp.totalReviews', 'DESC')
        .take(limit);

      const results = await qb.getMany();
      productIds = results.map((p) => p.id);
    }

    const products = await this.getProductDetails(productIds);
    await this.redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);

    return {
      status: 'success',
      message: 'Similar products retrieved successfully',
      data: products,
    };
  }

  // ──────────────────────────────────────────────
  //  AI-Powered Recommendations
  // ──────────────────────────────────────────────

  async getAIRecommendations(
    userId: string,
    context?: string,
    limit: number = 6,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${CACHE_PREFIX}:ai:${userId}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return {
        status: 'success',
        message: 'AI recommendations retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    // Gather user context
    const profile = await this.getOrCreateProfile(userId);

    // Get recent views
    const recentViews = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('DISTINCT pv.digitalProductId', 'productId')
      .where('pv.userId = :userId', { userId })
      .orderBy('MAX(pv.viewedAt)', 'DESC')
      .groupBy('pv.digitalProductId')
      .take(10)
      .getRawMany();

    const viewedIds = recentViews.map((v) => v.productId);
    const viewedProducts =
      viewedIds.length > 0
        ? await this.productRepository.find({
            where: { id: In(viewedIds) },
            relations: ['category', 'tags'],
          })
        : [];

    // Get catalog for AI to choose from
    const catalog = await this.productRepository.find({
      where: { status: 'published' as any },
      order: { averageRating: 'DESC' },
      take: 50,
      relations: ['category'],
    });

    const excludeIds = new Set([...viewedIds, ...(profile.purchaseHistory ?? [])]);
    const candidates = catalog.filter((p) => !excludeIds.has(p.id));

    if (candidates.length === 0) {
      return {
        status: 'success',
        message: 'No recommendations available',
        data: [],
      };
    }

    // Build AI prompt
    const userContext = [
      context ? `User is looking for: ${context}` : '',
      viewedProducts.length > 0
        ? `Recently viewed: ${viewedProducts
            .slice(0, 5)
            .map((p) => `"${p.title}" (${p.type}, $${p.price})`)
            .join(', ')}`
        : '',
      profile.preferredCategories?.length > 0
        ? `Preferred categories: ${profile.preferredCategories.join(', ')}`
        : '',
      profile.priceRangeMin != null && profile.priceRangeMax != null
        ? `Budget range: $${profile.priceRangeMin} - $${profile.priceRangeMax}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const catalogSummary = candidates
      .slice(0, 30)
      .map(
        (p, i) =>
          `${i + 1}. [${p.id}] "${p.title}" - ${p.type}, $${p.price}, Rating: ${p.averageRating}/5 (${p.totalReviews} reviews)${p.category ? `, Category: ${p.category.name}` : ''}`,
      )
      .join('\n');

    const systemPrompt = `You are a shopping recommendation AI for VivaExcel, a digital products marketplace selling Excel templates, Google Sheets, presentations, design systems, and more.

Given the user's context and browsing history, select the ${limit} best product recommendations from the catalog below. For each recommendation, explain briefly why it's a good match.

Return ONLY a JSON array of objects with this exact format:
[{"id": "product-uuid", "reason": "Brief reason for recommendation"}]

Do not include any other text, markdown, or explanation outside the JSON array.`;

    const userMessage = `User Context:
${userContext || 'New user, no browsing history yet.'}

Available Products:
${catalogSummary}

Select the ${limit} best recommendations.`;

    try {
      const response = await this.callAIForRecommendations(systemPrompt, userMessage);

      const aiPicks = JSON.parse(
        response
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim(),
      );

      const selectedIds = aiPicks.map((pick: any) => pick.id).filter(Boolean);
      const reasonMap = new Map(aiPicks.map((pick: any) => [pick.id, pick.reason]));

      const products = await this.getProductDetails(selectedIds);
      const withReasons = products.map((p) => ({
        ...p,
        reason: (reasonMap.get(p.id) as string) || undefined,
      }));

      // Log the recommendation
      await this.logRepository.save(
        this.logRepository.create({
          userId,
          type: RecommendationType.AI_POWERED,
          recommendedProductIds: selectedIds,
          metadata: { context, aiResponse: aiPicks },
        }),
      );

      await this.redis.set(cacheKey, JSON.stringify(withReasons), AI_CACHE_TTL);

      return {
        status: 'success',
        message: 'AI recommendations retrieved successfully',
        data: withReasons,
      };
    } catch (error) {
      this.logger.warn(`AI recommendation failed, falling back to heuristic: ${error}`);

      // Fallback to simple heuristic
      const fallback = candidates
        .sort((a, b) => Number(b.averageRating) - Number(a.averageRating))
        .slice(0, limit);

      const products = await this.getProductDetails(fallback.map((p) => p.id));

      return {
        status: 'success',
        message: 'Recommendations retrieved successfully',
        data: products,
      };
    }
  }

  // ──────────────────────────────────────────────
  //  "For You" Personalized Feed
  // ──────────────────────────────────────────────

  async getForYouFeed(
    userId: string,
    limit: number = 12,
  ): Promise<ApiResponse<RecommendedProduct[]>> {
    const cacheKey = `${CACHE_PREFIX}:foryou:${userId}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return {
        status: 'success',
        message: 'For You feed retrieved successfully',
        data: JSON.parse(cached),
      };
    }

    const profile = await this.getOrCreateProfile(userId);

    const qb = this.productRepository
      .createQueryBuilder('dp')
      .where('dp.status = :status', { status: 'published' });

    // Filter by preferred categories if available
    if (profile.preferredCategories?.length > 0) {
      qb.andWhere('dp.categoryId IN (:...categories)', {
        categories: profile.preferredCategories,
      });
    }

    // Filter by price range if available
    if (profile.priceRangeMin != null) {
      qb.andWhere('dp.price >= :minPrice', { minPrice: profile.priceRangeMin });
    }
    if (profile.priceRangeMax != null) {
      qb.andWhere('dp.price <= :maxPrice', { maxPrice: profile.priceRangeMax });
    }

    // Exclude already purchased
    if (profile.purchaseHistory?.length > 0) {
      qb.andWhere('dp.id NOT IN (:...purchased)', { purchased: profile.purchaseHistory });
    }

    qb.orderBy('dp.averageRating', 'DESC')
      .addOrderBy('dp.totalReviews', 'DESC')
      .take(limit);

    const results = await qb.getMany();
    const products = results.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      featuredImage: p.featuredImage,
      averageRating: Number(p.averageRating),
      totalReviews: p.totalReviews,
      type: p.type,
    }));

    await this.redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);

    return {
      status: 'success',
      message: 'For You feed retrieved successfully',
      data: products,
    };
  }

  // ──────────────────────────────────────────────
  //  User Preference Profile Management
  // ──────────────────────────────────────────────

  async getOrCreateProfile(userId: string): Promise<UserPreferenceProfile> {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId });
      profile = await this.profileRepository.save(profile);
    }
    return profile;
  }

  async updateProfile(userId: string): Promise<UserPreferenceProfile> {
    const profile = await this.getOrCreateProfile(userId);

    // Compute preferred categories from views
    const categoryViews = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('dp.category_id', 'categoryId')
      .addSelect('COUNT(*)', 'viewCount')
      .innerJoin('digital_products', 'dp', 'dp.id = pv.digital_product_id')
      .where('pv.user_id = :userId', { userId })
      .andWhere('dp.category_id IS NOT NULL')
      .groupBy('dp.category_id')
      .orderBy('"viewCount"', 'DESC')
      .limit(5)
      .getRawMany();

    profile.preferredCategories = categoryViews.map((cv) => cv.categoryId);

    // Compute preferred types
    const typeViews = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('dp.type', 'type')
      .addSelect('COUNT(*)', 'viewCount')
      .innerJoin('digital_products', 'dp', 'dp.id = pv.digital_product_id')
      .where('pv.user_id = :userId', { userId })
      .groupBy('dp.type')
      .orderBy('"viewCount"', 'DESC')
      .limit(5)
      .getRawMany();

    profile.preferredTypes = typeViews.map((tv) => tv.type);

    // Compute price range from views and purchases
    const priceStats = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('MIN(dp.price)', 'minPrice')
      .addSelect('MAX(dp.price)', 'maxPrice')
      .addSelect('AVG(dp.price)', 'avgPrice')
      .innerJoin('digital_products', 'dp', 'dp.id = pv.digital_product_id')
      .where('pv.user_id = :userId', { userId })
      .getRawOne();

    if (priceStats?.minPrice) {
      profile.priceRangeMin = Math.max(0, parseFloat(priceStats.avgPrice) * 0.5);
      profile.priceRangeMax = parseFloat(priceStats.avgPrice) * 2;
    }

    // Update browsing history
    const recentViews = await this.productViewRepository
      .createQueryBuilder('pv')
      .select('DISTINCT pv.digitalProductId', 'productId')
      .where('pv.userId = :userId', { userId })
      .orderBy('MAX(pv.viewedAt)', 'DESC')
      .groupBy('pv.digitalProductId')
      .take(20)
      .getRawMany();

    profile.browsingHistory = recentViews.map((v) => v.productId);
    profile.lastComputedAt = new Date();

    return this.profileRepository.save(profile);
  }

  // ──────────────────────────────────────────────
  //  Recommendation Click Logging
  // ──────────────────────────────────────────────

  async logClick(logId: string, clickedProductId: string): Promise<void> {
    await this.logRepository.update(logId, { clickedProductId });
  }

  async logConversion(logId: string): Promise<void> {
    await this.logRepository.update(logId, { converted: true });
  }

  // ──────────────────────────────────────────────
  //  Private Helpers
  // ──────────────────────────────────────────────

  /**
   * Call the Anthropic Claude API for AI-powered recommendations.
   * Mirrors the pattern used in AiService.callClaude.
   */
  private async callAIForRecommendations(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await this.anthropicClient.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in AI response');
    }

    return textBlock.text;
  }

  /**
   * Fetch full product details for a list of IDs, preserving the input order.
   */
  private async getProductDetails(productIds: string[]): Promise<RecommendedProduct[]> {
    if (productIds.length === 0) return [];

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

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
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          featuredImage: p.featuredImage,
          averageRating: Number(p.averageRating),
          totalReviews: p.totalReviews,
          type: p.type,
        };
      });
  }
}
