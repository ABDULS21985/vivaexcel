import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import Anthropic from '@anthropic-ai/sdk';
import { CustomBundle } from './entities/custom-bundle.entity';
import { CustomBundleStatus } from './enums';
import {
  DigitalProduct,
  DigitalProductStatus,
} from '../../entities/digital-product.entity';
import { Order } from '../../entities/order.entity';
import { Coupon } from '../promotions/entities/coupon.entity';
import {
  DiscountType,
  CouponApplicableTo,
} from '../promotions/enums';
import { CartService } from '../cart/cart.service';
import { RedisService } from '../../shared/redis/redis.service';

// ──────────────────────────────────────────────
//  Tiered pricing constants
// ──────────────────────────────────────────────

const BUNDLE_TIERS = [
  { minProducts: 5, discountPercent: 25 },
  { minProducts: 4, discountPercent: 20 },
  { minProducts: 3, discountPercent: 15 },
  { minProducts: 2, discountPercent: 10 },
];

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────

export interface BundleWithProducts extends CustomBundle {
  products: DigitalProduct[];
  nextTier?: { productsNeeded: number; discountPercent: number } | null;
}

export interface BundleSuggestion {
  product: DigitalProduct;
  reason: string;
}

export interface BundleCheckoutResult {
  cartReady: boolean;
  couponCode: string;
  bundlePrice: number;
  savings: number;
}

// ──────────────────────────────────────────────
//  Cache
// ──────────────────────────────────────────────

const CACHE_PREFIX = 'bundle';
const SUGGESTION_TTL = 1800; // 30 min

@Injectable()
export class CustomBundleService {
  private readonly logger = new Logger(CustomBundleService.name);
  private readonly anthropicClient: Anthropic | null;
  private readonly model = 'claude-sonnet-4-5-20250929';

  constructor(
    @InjectRepository(CustomBundle)
    private readonly bundleRepository: Repository<CustomBundle>,
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly cartService: CartService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropicClient = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured. AI bundle suggestions unavailable.');
      this.anthropicClient = null;
    }
  }

  // ──────────────────────────────────────────────
  //  Tiered pricing
  // ──────────────────────────────────────────────

  static getDiscountPercentage(productCount: number): number {
    for (const tier of BUNDLE_TIERS) {
      if (productCount >= tier.minProducts) {
        return tier.discountPercent;
      }
    }
    return 0;
  }

  static getNextTier(
    productCount: number,
  ): { productsNeeded: number; discountPercent: number } | null {
    // Find the next tier above the current discount
    const currentDiscount = CustomBundleService.getDiscountPercentage(productCount);
    for (let i = BUNDLE_TIERS.length - 1; i >= 0; i--) {
      const tier = BUNDLE_TIERS[i];
      if (tier.discountPercent > currentDiscount) {
        return {
          productsNeeded: tier.minProducts - productCount,
          discountPercent: tier.discountPercent,
        };
      }
    }
    return null;
  }

  // ──────────────────────────────────────────────
  //  Create bundle
  // ──────────────────────────────────────────────

  async createBundle(
    userId: string | undefined,
    sessionId: string | undefined,
    productIds: string[],
  ): Promise<BundleWithProducts> {
    if (productIds.length < 2) {
      throw new BadRequestException('A bundle requires at least 2 products');
    }

    const products = await this.loadAndValidateProducts(productIds);

    const bundle = this.bundleRepository.create({
      userId,
      sessionId,
      productIds,
      shareToken: nanoid(12),
      status: CustomBundleStatus.DRAFT,
    });

    this.recalculatePricing(bundle, products);

    const saved = await this.bundleRepository.save(bundle);
    return this.enrichBundle(saved, products);
  }

  // ──────────────────────────────────────────────
  //  Add product to bundle
  // ──────────────────────────────────────────────

  async addToBundle(
    bundleId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
  ): Promise<BundleWithProducts> {
    const bundle = await this.findBundle(bundleId, userId, sessionId);

    if (bundle.status === CustomBundleStatus.PURCHASED) {
      throw new BadRequestException('Cannot modify a purchased bundle');
    }

    if (bundle.productIds.includes(productId)) {
      // Idempotent — return current state
      const products = await this.loadAndValidateProducts(bundle.productIds);
      return this.enrichBundle(bundle, products);
    }

    // Validate product exists and is published
    const product = await this.productRepository.findOne({
      where: { id: productId, status: DigitalProductStatus.PUBLISHED },
    });
    if (!product) {
      throw new NotFoundException('Product not found or unavailable');
    }

    // Check if user already owns this product
    if (userId) {
      const ownsProduct = await this.userOwnsProduct(userId, productId);
      if (ownsProduct) {
        throw new BadRequestException('You already own this product');
      }
    }

    bundle.productIds = [...bundle.productIds, productId];
    const products = await this.loadAndValidateProducts(bundle.productIds);
    this.recalculatePricing(bundle, products);

    const saved = await this.bundleRepository.save(bundle);
    return this.enrichBundle(saved, products);
  }

  // ──────────────────────────────────────────────
  //  Remove product from bundle
  // ──────────────────────────────────────────────

  async removeFromBundle(
    bundleId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
  ): Promise<BundleWithProducts> {
    const bundle = await this.findBundle(bundleId, userId, sessionId);

    if (bundle.status === CustomBundleStatus.PURCHASED) {
      throw new BadRequestException('Cannot modify a purchased bundle');
    }

    bundle.productIds = bundle.productIds.filter((pid) => pid !== productId);

    const products =
      bundle.productIds.length > 0
        ? await this.loadAndValidateProducts(bundle.productIds)
        : [];

    this.recalculatePricing(bundle, products);

    const saved = await this.bundleRepository.save(bundle);
    return this.enrichBundle(saved, products);
  }

  // ──────────────────────────────────────────────
  //  Get bundle with products
  // ──────────────────────────────────────────────

  async getBundle(
    bundleId: string,
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<BundleWithProducts> {
    const bundle = await this.findBundle(bundleId, userId, sessionId);
    const products =
      bundle.productIds.length > 0
        ? await this.productRepository.find({
            where: { id: In(bundle.productIds) },
            relations: ['category', 'tags'],
          })
        : [];

    return this.enrichBundle(bundle, products);
  }

  // ──────────────────────────────────────────────
  //  Get shared bundle (public)
  // ──────────────────────────────────────────────

  async getBundleByShareToken(shareToken: string): Promise<BundleWithProducts> {
    const bundle = await this.bundleRepository.findOne({
      where: { shareToken },
    });
    if (!bundle) {
      throw new NotFoundException('Shared bundle not found');
    }

    const products =
      bundle.productIds.length > 0
        ? await this.productRepository.find({
            where: { id: In(bundle.productIds) },
            relations: ['category', 'tags'],
          })
        : [];

    return this.enrichBundle(bundle, products);
  }

  // ──────────────────────────────────────────────
  //  Checkout bundle
  // ──────────────────────────────────────────────

  async checkoutBundle(
    bundleId: string,
    userId: string,
  ): Promise<BundleCheckoutResult> {
    const bundle = await this.findBundle(bundleId, userId, undefined);

    if (bundle.productIds.length < 2) {
      throw new BadRequestException('Bundle must have at least 2 products to checkout');
    }

    if (bundle.status === CustomBundleStatus.PURCHASED) {
      throw new BadRequestException('This bundle has already been purchased');
    }

    // Generate a unique coupon code for this bundle
    const couponCode = await this.generateBundleCouponCode();

    // Create a temporary coupon for the bundle discount
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const coupon = this.couponRepository.create({
      code: couponCode,
      name: `Bundle Discount (${bundle.discountPercentage}% off)`,
      description: `Auto-generated coupon for custom bundle ${bundle.id}`,
      discountType: DiscountType.PERCENTAGE,
      discountValue: Number(bundle.discountPercentage),
      applicableTo: CouponApplicableTo.SPECIFIC_PRODUCTS,
      applicableProductIds: bundle.productIds,
      usageLimit: 1,
      usageLimitPerUser: 1,
      currentUsageCount: 0,
      startsAt: new Date(),
      expiresAt,
      isActive: true,
      createdBy: userId,
    });

    await this.couponRepository.save(coupon);

    // Add all products to cart
    for (const productId of bundle.productIds) {
      try {
        await this.cartService.addItem(userId, undefined, productId);
      } catch (error) {
        this.logger.warn(
          `Failed to add product ${productId} to cart: ${(error as Error).message}`,
        );
      }
    }

    // Update bundle status
    bundle.couponCode = couponCode;
    bundle.status = CustomBundleStatus.ACTIVE;
    await this.bundleRepository.save(bundle);

    return {
      cartReady: true,
      couponCode,
      bundlePrice: Number(bundle.bundlePrice),
      savings: Number(bundle.savings),
    };
  }

  // ──────────────────────────────────────────────
  //  AI-powered suggestions
  // ──────────────────────────────────────────────

  async suggestBundleAdditions(
    bundleId: string,
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<BundleSuggestion[]> {
    const bundle = await this.findBundle(bundleId, userId, sessionId);

    if (bundle.productIds.length === 0) return [];

    // Check cache
    const cacheKey = `${CACHE_PREFIX}:suggestions:${[...bundle.productIds].sort().join(':')}`;
    const cached = await this.safeRedisGet(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Re-load product data for cached suggestions
        const productIds = parsed.map((s: { productId: string }) => s.productId);
        const products = await this.productRepository.find({
          where: { id: In(productIds) },
          relations: ['category'],
        });
        return parsed
          .map((s: { productId: string; reason: string }) => ({
            product: products.find((p) => p.id === s.productId),
            reason: s.reason,
          }))
          .filter((s: { product?: DigitalProduct }) => s.product);
      } catch {
        // Invalid cache
      }
    }

    // Load bundle products
    const bundleProducts = await this.productRepository.find({
      where: { id: In(bundle.productIds) },
      relations: ['category'],
    });

    // Find candidate products: same categories, not in bundle, published
    const categoryIds = bundleProducts
      .map((p) => p.category?.id)
      .filter(Boolean) as string[];

    let candidates: DigitalProduct[] = [];
    if (categoryIds.length > 0) {
      candidates = await this.productRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .where('p.status = :status', { status: DigitalProductStatus.PUBLISHED })
        .andWhere('p.id NOT IN (:...excludeIds)', {
          excludeIds: bundle.productIds,
        })
        .andWhere('category.id IN (:...categoryIds)', { categoryIds })
        .orderBy('p.downloadCount', 'DESC')
        .limit(12)
        .getMany();
    }

    // Fallback: popular products if no category matches
    if (candidates.length < 4) {
      const fallback = await this.productRepository.find({
        where: {
          status: DigitalProductStatus.PUBLISHED,
          id: Not(In(bundle.productIds)),
        },
        order: { downloadCount: 'DESC' },
        take: 8,
        relations: ['category'],
      });
      // Merge without duplicates
      const existingIds = new Set(candidates.map((c) => c.id));
      for (const p of fallback) {
        if (!existingIds.has(p.id)) {
          candidates.push(p);
        }
      }
    }

    // Try AI ranking if available
    let suggestions: BundleSuggestion[];
    if (this.anthropicClient && candidates.length > 0) {
      suggestions = await this.getAISuggestions(bundleProducts, candidates);
    } else {
      // Heuristic: same category first, then by popularity
      suggestions = candidates.slice(0, 4).map((p) => ({
        product: p,
        reason: p.category
          ? `Popular in ${p.category.name}`
          : 'Trending product',
      }));
    }

    // Cache suggestion IDs and reasons
    const cacheData = suggestions.map((s) => ({
      productId: s.product.id,
      reason: s.reason,
    }));
    await this.safeRedisSet(cacheKey, JSON.stringify(cacheData), SUGGESTION_TTL);

    return suggestions;
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private recalculatePricing(bundle: CustomBundle, products: DigitalProduct[]): void {
    const count = products.length;
    const totalRetail = products.reduce(
      (sum, p) => sum + Math.round(Number(p.price) * 100),
      0,
    ) / 100;

    const discountPercent = CustomBundleService.getDiscountPercentage(count);
    const savings = Math.round(totalRetail * discountPercent) / 100;
    const bundlePrice = Math.round((totalRetail - savings) * 100) / 100;

    bundle.totalRetailPrice = totalRetail;
    bundle.bundlePrice = bundlePrice;
    bundle.savings = savings;
    bundle.discountPercentage = discountPercent;
    bundle.discountTier = count;
  }

  private enrichBundle(
    bundle: CustomBundle,
    products: DigitalProduct[],
  ): BundleWithProducts {
    const nextTier = CustomBundleService.getNextTier(products.length);
    // Preserve product ordering from productIds
    const orderedProducts = bundle.productIds
      .map((pid) => products.find((p) => p.id === pid))
      .filter(Boolean) as DigitalProduct[];

    return {
      ...bundle,
      products: orderedProducts,
      nextTier,
    };
  }

  private async loadAndValidateProducts(
    productIds: string[],
  ): Promise<DigitalProduct[]> {
    const products = await this.productRepository.find({
      where: { id: In(productIds), status: DigitalProductStatus.PUBLISHED },
      relations: ['category', 'tags'],
    });

    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((pid) => !foundIds.has(pid));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Products not found or unavailable: ${missing.join(', ')}`,
      );
    }

    return products;
  }

  private async findBundle(
    id: string,
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<CustomBundle> {
    const where: Record<string, unknown> = { id };
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const bundle = await this.bundleRepository.findOne({ where });
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }
    return bundle;
  }

  private async userOwnsProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const order = await this.orderRepository
      .createQueryBuilder('o')
      .innerJoin('o.items', 'item')
      .where('o.userId = :userId', { userId })
      .andWhere('o.status = :status', { status: 'completed' })
      .andWhere('item.digitalProductId = :productId', { productId })
      .limit(1)
      .getOne();

    return !!order;
  }

  private async generateBundleCouponCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;

    while (attempts < 10) {
      let code = 'BUNDLE-';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const exists = await this.couponRepository.findOne({
        where: { code },
      });
      if (!exists) return code;
      attempts++;
    }

    throw new BadRequestException('Failed to generate unique coupon code');
  }

  private async getAISuggestions(
    bundleProducts: DigitalProduct[],
    candidates: DigitalProduct[],
  ): Promise<BundleSuggestion[]> {
    if (!this.anthropicClient) return [];

    const bundleDesc = bundleProducts
      .map((p) => `"${p.title}" (${p.type}, ${p.category?.name ?? 'N/A'}, $${Number(p.price).toFixed(2)})`)
      .join(', ');

    const candidateList = candidates
      .map((p, i) => `${i + 1}. "${p.title}" (${p.type}, ${p.category?.name ?? 'N/A'}, $${Number(p.price).toFixed(2)}, ${p.downloadCount} downloads)`)
      .join('\n');

    try {
      const response = await this.anthropicClient.messages.create({
        model: this.model,
        max_tokens: 512,
        system: `You are a digital product recommendation engine. Given a user's bundle and available products, pick the 4 best complementary products and explain why in one short sentence each. Return valid JSON: [{"index": 1, "reason": "..."}]`,
        messages: [
          {
            role: 'user',
            content: `Current bundle: ${bundleDesc}\n\nAvailable products:\n${candidateList}\n\nPick the 4 best additions:`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return [];

      const text = textBlock.text.trim();
      // Extract JSON from possible markdown fence
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const picks = JSON.parse(jsonMatch[0]) as { index: number; reason: string }[];

      return picks
        .map((pick) => {
          const product = candidates[pick.index - 1];
          if (!product) return null;
          return { product, reason: pick.reason };
        })
        .filter(Boolean)
        .slice(0, 4) as BundleSuggestion[];
    } catch (error) {
      this.logger.warn(`AI suggestions failed: ${(error as Error).message}`);
      // Fallback
      return candidates.slice(0, 4).map((p) => ({
        product: p,
        reason: p.category ? `Popular in ${p.category.name}` : 'Trending product',
      }));
    }
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
      // Non-critical
    }
  }
}
