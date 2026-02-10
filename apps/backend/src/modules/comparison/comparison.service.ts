import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ComparisonSet } from './entities/comparison-set.entity';
import {
  DigitalProduct,
  DigitalProductStatus,
  DigitalProductType,
} from '../../entities/digital-product.entity';
import { RedisService } from '../../shared/redis/redis.service';

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────

export interface ComparisonAttribute {
  name: string;
  key: string;
  values: (string | number | boolean | null)[];
  type: 'price' | 'rating' | 'number' | 'boolean' | 'text';
}

export interface ComparisonHighlights {
  bestValue?: string;
  bestRated?: string;
  mostPopular?: string;
  recommendation?: string;
}

export interface ComparisonData {
  products: DigitalProduct[];
  attributes: ComparisonAttribute[];
  highlights: ComparisonHighlights;
  aiInsight?: string;
}

// ──────────────────────────────────────────────
//  Cache keys
// ──────────────────────────────────────────────

const CACHE_PREFIX = 'comparison';
const COMPARISON_DATA_TTL = 300; // 5 minutes
const AI_INSIGHT_TTL = 3600; // 1 hour

@Injectable()
export class ComparisonService {
  private readonly logger = new Logger(ComparisonService.name);
  private readonly anthropicClient: Anthropic | null;
  private readonly model = 'claude-sonnet-4-5-20250929';

  constructor(
    @InjectRepository(ComparisonSet)
    private readonly comparisonSetRepository: Repository<ComparisonSet>,
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropicClient = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured. AI comparison insights unavailable.');
      this.anthropicClient = null;
    }
  }

  // ──────────────────────────────────────────────
  //  Create comparison set
  // ──────────────────────────────────────────────

  async createComparison(
    userId: string | undefined,
    sessionId: string | undefined,
    productIds: string[],
  ): Promise<ComparisonSet> {
    await this.validateProductsForComparison(productIds);

    const set = this.comparisonSetRepository.create({
      userId,
      sessionId,
      productIds,
      lastViewedAt: new Date(),
    });

    return this.comparisonSetRepository.save(set);
  }

  // ──────────────────────────────────────────────
  //  Update comparison set (add/remove)
  // ──────────────────────────────────────────────

  async updateComparison(
    id: string,
    userId: string | undefined,
    sessionId: string | undefined,
    action: 'add' | 'remove',
    productId: string,
  ): Promise<ComparisonSet> {
    const set = await this.findComparisonSet(id, userId, sessionId);

    if (action === 'add') {
      if (set.productIds.includes(productId)) {
        return set; // Already included, idempotent
      }
      if (set.productIds.length >= 4) {
        throw new BadRequestException('Maximum 4 products can be compared at once');
      }
      // Validate same type constraint
      await this.validateProductsForComparison([...set.productIds, productId]);
      set.productIds = [...set.productIds, productId];
    } else {
      set.productIds = set.productIds.filter((pid) => pid !== productId);
    }

    set.lastViewedAt = new Date();
    return this.comparisonSetRepository.save(set);
  }

  // ──────────────────────────────────────────────
  //  Get comparison set with full data
  // ──────────────────────────────────────────────

  async getComparison(
    id: string,
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<ComparisonData> {
    const set = await this.findComparisonSet(id, userId, sessionId);

    // Update lastViewedAt
    set.lastViewedAt = new Date();
    await this.comparisonSetRepository.save(set);

    return this.getComparisonData(set.productIds);
  }

  // ──────────────────────────────────────────────
  //  Quick compare (no persistence)
  // ──────────────────────────────────────────────

  async getQuickCompare(productIds: string[]): Promise<ComparisonData> {
    if (productIds.length < 2 || productIds.length > 4) {
      throw new BadRequestException('Quick compare requires 2-4 product IDs');
    }
    return this.getComparisonData(productIds);
  }

  // ──────────────────────────────────────────────
  //  Core: Build comparison data
  // ──────────────────────────────────────────────

  async getComparisonData(productIds: string[]): Promise<ComparisonData> {
    // Check cache
    const cacheKey = `${CACHE_PREFIX}:data:${this.sortedIdsHash(productIds)}`;
    const cached = await this.safeRedisGet(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Invalid cache, proceed to rebuild
      }
    }

    // Load products
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['category', 'tags', 'variants'],
    });

    if (products.length < 2) {
      throw new BadRequestException('At least 2 valid products are required for comparison');
    }

    // Preserve original order
    const orderedProducts = productIds
      .map((pid) => products.find((p) => p.id === pid))
      .filter(Boolean) as DigitalProduct[];

    // Build attribute matrix
    const attributes = this.buildAttributeMatrix(orderedProducts);

    // Calculate highlights
    const highlights = this.calculateHighlights(orderedProducts);

    // Fetch AI insight (async, non-blocking)
    let aiInsight: string | undefined;
    try {
      aiInsight = await this.getAIInsight(orderedProducts);
    } catch (error) {
      this.logger.warn(`AI insight generation failed: ${(error as Error).message}`);
    }

    const data: ComparisonData = {
      products: orderedProducts,
      attributes,
      highlights,
      aiInsight,
    };

    // Cache result
    await this.safeRedisSet(cacheKey, JSON.stringify(data), COMPARISON_DATA_TTL);

    return data;
  }

  // ──────────────────────────────────────────────
  //  Attribute matrix builder
  // ──────────────────────────────────────────────

  private buildAttributeMatrix(products: DigitalProduct[]): ComparisonAttribute[] {
    const attrs: ComparisonAttribute[] = [];

    // Universal attributes
    attrs.push({
      name: 'Price',
      key: 'price',
      values: products.map((p) => Number(p.price)),
      type: 'price',
    });

    attrs.push({
      name: 'Rating',
      key: 'rating',
      values: products.map((p) => Number(p.averageRating)),
      type: 'rating',
    });

    attrs.push({
      name: 'Downloads',
      key: 'downloads',
      values: products.map((p) => p.downloadCount),
      type: 'number',
    });

    attrs.push({
      name: 'Reviews',
      key: 'reviews',
      values: products.map((p) => p.totalReviews),
      type: 'number',
    });

    attrs.push({
      name: 'Category',
      key: 'category',
      values: products.map((p) => p.category?.name ?? null),
      type: 'text',
    });

    attrs.push({
      name: 'Product Type',
      key: 'productType',
      values: products.map((p) => p.type),
      type: 'text',
    });

    attrs.push({
      name: 'Featured',
      key: 'isFeatured',
      values: products.map((p) => p.isFeatured),
      type: 'boolean',
    });

    attrs.push({
      name: 'Bestseller',
      key: 'isBestseller',
      values: products.map((p) => p.isBestseller),
      type: 'boolean',
    });

    // Variants count
    attrs.push({
      name: 'Variants',
      key: 'variants',
      values: products.map((p) => p.variants?.length ?? 0),
      type: 'number',
    });

    // Type-specific attributes from metadata
    const productType = products[0]?.type;
    if (productType) {
      const typeAttrs = this.getTypeSpecificAttributes(products, productType);
      attrs.push(...typeAttrs);
    }

    return attrs;
  }

  private getTypeSpecificAttributes(
    products: DigitalProduct[],
    type: DigitalProductType,
  ): ComparisonAttribute[] {
    const attrs: ComparisonAttribute[] = [];
    const getMetaValue = (p: DigitalProduct, key: string) =>
      (p.metadata as Record<string, unknown>)?.[key] ?? null;

    switch (type) {
      case DigitalProductType.POWERPOINT:
        attrs.push({
          name: 'Slide Count',
          key: 'slideCount',
          values: products.map((p) => getMetaValue(p, 'slideCount') as number | null),
          type: 'number',
        });
        attrs.push({
          name: 'Has Animations',
          key: 'hasAnimations',
          values: products.map((p) => getMetaValue(p, 'hasAnimations') as boolean | null),
          type: 'boolean',
        });
        attrs.push({
          name: 'Aspect Ratio',
          key: 'aspectRatio',
          values: products.map((p) => getMetaValue(p, 'aspectRatio') as string | null),
          type: 'text',
        });
        break;

      case DigitalProductType.WEB_TEMPLATE:
        attrs.push({
          name: 'Framework',
          key: 'framework',
          values: products.map((p) => getMetaValue(p, 'framework') as string | null),
          type: 'text',
        });
        attrs.push({
          name: 'Responsive',
          key: 'responsive',
          values: products.map((p) => getMetaValue(p, 'responsive') as boolean | null),
          type: 'boolean',
        });
        attrs.push({
          name: 'Pages Count',
          key: 'pagesCount',
          values: products.map((p) => getMetaValue(p, 'pagesCount') as number | null),
          type: 'number',
        });
        break;

      case DigitalProductType.CODE_TEMPLATE:
        attrs.push({
          name: 'Language',
          key: 'language',
          values: products.map((p) => getMetaValue(p, 'language') as string | null),
          type: 'text',
        });
        attrs.push({
          name: 'Framework',
          key: 'framework',
          values: products.map((p) => getMetaValue(p, 'framework') as string | null),
          type: 'text',
        });
        break;

      case DigitalProductType.DOCUMENT:
        attrs.push({
          name: 'Page Count',
          key: 'pageCount',
          values: products.map((p) => getMetaValue(p, 'pageCount') as number | null),
          type: 'number',
        });
        attrs.push({
          name: 'Format',
          key: 'format',
          values: products.map((p) => getMetaValue(p, 'format') as string | null),
          type: 'text',
        });
        attrs.push({
          name: 'Editable',
          key: 'editable',
          values: products.map((p) => getMetaValue(p, 'editable') as boolean | null),
          type: 'boolean',
        });
        break;
    }

    return attrs;
  }

  // ──────────────────────────────────────────────
  //  Highlights calculator
  // ──────────────────────────────────────────────

  private calculateHighlights(products: DigitalProduct[]): ComparisonHighlights {
    const highlights: ComparisonHighlights = {};

    // Best value = lowest price
    const sorted = [...products].sort(
      (a, b) => Number(a.price) - Number(b.price),
    );
    if (sorted.length > 0) {
      highlights.bestValue = sorted[0].id;
    }

    // Best rated = highest rating
    const byRating = [...products].sort(
      (a, b) => Number(b.averageRating) - Number(a.averageRating),
    );
    if (byRating.length > 0 && Number(byRating[0].averageRating) > 0) {
      highlights.bestRated = byRating[0].id;
    }

    // Most popular = highest downloads
    const byDownloads = [...products].sort(
      (a, b) => b.downloadCount - a.downloadCount,
    );
    if (byDownloads.length > 0 && byDownloads[0].downloadCount > 0) {
      highlights.mostPopular = byDownloads[0].id;
    }

    return highlights;
  }

  // ──────────────────────────────────────────────
  //  AI Insight generation
  // ──────────────────────────────────────────────

  private async getAIInsight(products: DigitalProduct[]): Promise<string | undefined> {
    if (!this.anthropicClient) return undefined;

    // Check cache
    const cacheKey = `${CACHE_PREFIX}:ai:${this.sortedIdsHash(products.map((p) => p.id))}`;
    const cached = await this.safeRedisGet(cacheKey);
    if (cached) return cached;

    const productSummaries = products.map((p, i) => {
      const meta = p.metadata as Record<string, unknown> | undefined;
      return `Product ${String.fromCharCode(65 + i)} - "${p.title}":
  Price: $${Number(p.price).toFixed(2)}
  Rating: ${Number(p.averageRating).toFixed(1)}/5 (${p.totalReviews} reviews)
  Downloads: ${p.downloadCount}
  Type: ${p.type}
  Category: ${p.category?.name ?? 'N/A'}
  ${meta ? `Metadata: ${JSON.stringify(meta)}` : ''}`;
    });

    try {
      const response = await this.anthropicClient.messages.create({
        model: this.model,
        max_tokens: 512,
        system: `You are a digital product comparison expert. Provide a brief, helpful comparison insight (3-4 sentences max) for a customer comparing digital products. Mention which product is best for different use cases. Be specific and actionable. Do NOT use markdown formatting.`,
        messages: [
          {
            role: 'user',
            content: `Compare these digital products and provide a brief recommendation:\n\n${productSummaries.join('\n\n')}`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const insight = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : undefined;

      if (insight) {
        await this.safeRedisSet(cacheKey, insight, AI_INSIGHT_TTL);
      }

      return insight;
    } catch (error) {
      this.logger.warn(`AI insight failed: ${(error as Error).message}`);
      return undefined;
    }
  }

  // ──────────────────────────────────────────────
  //  Validation helpers
  // ──────────────────────────────────────────────

  private async validateProductsForComparison(productIds: string[]): Promise<void> {
    if (productIds.length < 2) {
      throw new BadRequestException('At least 2 products are required for comparison');
    }
    if (productIds.length > 4) {
      throw new BadRequestException('Maximum 4 products can be compared at once');
    }

    const products = await this.productRepository.find({
      where: { id: In(productIds), status: DigitalProductStatus.PUBLISHED },
      select: ['id', 'type'],
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are invalid or unavailable');
    }

    // Check same type
    const types = new Set(products.map((p) => p.type));
    if (types.size > 1) {
      throw new BadRequestException(
        'All products must be of the same type for comparison',
      );
    }
  }

  private async findComparisonSet(
    id: string,
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<ComparisonSet> {
    const where: Record<string, unknown> = { id };
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const set = await this.comparisonSetRepository.findOne({ where });
    if (!set) {
      throw new NotFoundException('Comparison set not found');
    }
    return set;
  }

  // ──────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────

  private sortedIdsHash(ids: string[]): string {
    return [...ids].sort().join(':');
  }

  private async safeRedisGet(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch {
      return null;
    }
  }

  private async safeRedisSet(key: string, value: string, ttl: number): Promise<void> {
    try {
      await this.redis.set(key, value, ttl);
    } catch {
      // Non-critical, silently fail
    }
  }
}
