import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PromotionsRepository } from './promotions.repository';
import { CacheService } from '../../common/cache/cache.service';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../common/interfaces/response.interface';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { BundleDiscount } from './entities/bundle-discount.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import {
  DiscountType,
  CouponApplicableTo,
} from './enums/promotion.enums';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponQueryDto,
  CreateFlashSaleDto,
  CreateBundleDiscountDto,
  CreateLoyaltyTierDto,
  BulkCreateCouponsDto,
} from './dto';
import { CartItemDto } from './dto/validate-coupon.dto';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_FLASH_SALES = 60; // 1 minute (time-sensitive)
const CACHE_TTL_BUNDLES = 300; // 5 minutes
const CACHE_TTL_LOYALTY = 600; // 10 minutes

const CACHE_TAG_PROMOTIONS = 'promotions';
const CACHE_TAG_COUPONS = 'coupons';
const CACHE_TAG_FLASH_SALES = 'flash-sales';
const CACHE_TAG_BUNDLES = 'bundles';
const CACHE_TAG_LOYALTY = 'loyalty';

// Coupon validation result
export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  couponId?: string;
  reason?: string;
}

// Best discount result returned by the promotion engine
export interface BestDiscountResult {
  type: 'coupon' | 'flash_sale' | 'bundle' | 'loyalty' | 'none';
  discount: number;
  description: string;
  promotionId?: string;
  details?: Record<string, any>;
}

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private readonly repository: PromotionsRepository,
    private readonly cacheService: CacheService,
  ) { }

  // ──────────────────────────────────────────────
  //  Coupon methods
  // ──────────────────────────────────────────────

  async createCoupon(
    dto: CreateCouponDto,
    userId: string,
  ): Promise<ApiResponse<Coupon>> {
    // Auto-generate code if not provided
    const code = dto.code || (await this.generateCouponCode());

    // Check for duplicate code
    const existing = await this.repository.findCouponByCode(code);
    if (existing) {
      throw new ConflictException(`Coupon code "${code}" already exists`);
    }

    const coupon = await this.repository.createCoupon({
      ...dto,
      code: code.toUpperCase(),
      createdBy: userId,
      startsAt: new Date(dto.startsAt),
      expiresAt: new Date(dto.expiresAt),
      isActive: dto.isActive ?? true,
      applicableTo: dto.applicableTo ?? CouponApplicableTo.ALL_PRODUCTS,
      usageLimitPerUser: dto.usageLimitPerUser ?? 1,
      currentUsageCount: 0,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_COUPONS,
    ]);
    this.logger.debug(`Coupon "${coupon.code}" created by user ${userId}`);

    return {
      status: 'success',
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  async getCoupons(
    query: CouponQueryDto,
  ): Promise<ApiResponse<PaginatedResponse<Coupon>>> {
    const cacheKey = this.cacheService.generateKey(
      'promotions',
      'coupons',
      'list',
      query,
    );

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllCoupons(query),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG_PROMOTIONS, CACHE_TAG_COUPONS] },
    );

    return {
      status: 'success',
      message: 'Coupons retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async getCouponByCode(code: string): Promise<ApiResponse<Coupon>> {
    const coupon = await this.repository.findCouponByCode(code.toUpperCase());
    if (!coupon) {
      throw new NotFoundException(`Coupon with code "${code}" not found`);
    }

    return {
      status: 'success',
      message: 'Coupon retrieved successfully',
      data: coupon,
    };
  }

  async getCouponById(id: string): Promise<ApiResponse<Coupon>> {
    const coupon = await this.repository.findCouponById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Coupon retrieved successfully',
      data: coupon,
    };
  }

  async updateCoupon(
    id: string,
    dto: UpdateCouponDto,
  ): Promise<ApiResponse<Coupon>> {
    const existing = await this.repository.findCouponById(id);
    if (!existing) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }

    // If code is being changed, check for duplicates
    if (dto.code && dto.code.toUpperCase() !== existing.code) {
      const codeConflict = await this.repository.findCouponByCode(
        dto.code.toUpperCase(),
      );
      if (codeConflict) {
        throw new ConflictException(`Coupon code "${dto.code}" already exists`);
      }
    }

    const { startsAt, expiresAt, code, ...rest } = dto;
    const updateData: Partial<Coupon> = { ...rest };

    if (code) {
      updateData.code = code.toUpperCase();
    }
    if (startsAt) {
      updateData.startsAt = new Date(startsAt);
    }
    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt);
    }

    const updated = await this.repository.updateCoupon(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_COUPONS,
    ]);
    this.logger.debug(`Coupon "${updated.code}" updated`);

    return {
      status: 'success',
      message: 'Coupon updated successfully',
      data: updated,
    };
  }

  async deleteCoupon(id: string): Promise<ApiResponse<null>> {
    const existing = await this.repository.findCouponById(id);
    if (!existing) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }

    const deleted = await this.repository.deleteCoupon(id);
    if (!deleted) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_COUPONS,
    ]);
    this.logger.debug(`Coupon "${existing.code}" soft-deleted`);

    return {
      status: 'success',
      message: 'Coupon deleted successfully',
      data: null,
    };
  }

  async validateCoupon(
    code: string,
    userId: string,
    cartItems: CartItemDto[],
  ): Promise<ApiResponse<CouponValidationResult>> {
    const result = await this.performCouponValidation(
      code,
      userId,
      cartItems,
    );

    return {
      status: 'success',
      message: result.valid
        ? 'Coupon is valid'
        : `Coupon validation failed: ${result.reason}`,
      data: result,
    };
  }

  async applyCoupon(
    code: string,
    userId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<ApiResponse<CouponRedemption>> {
    const coupon = await this.repository.findCouponByCode(code.toUpperCase());
    if (!coupon) {
      throw new NotFoundException(`Coupon with code "${code}" not found`);
    }

    // Record the redemption
    const redemption = await this.repository.createCouponRedemption({
      couponId: coupon.id,
      userId,
      orderId,
      discountAmount,
      redeemedAt: new Date(),
    });

    // Increment usage counter atomically
    await this.repository.incrementCouponUsage(coupon.id);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_COUPONS,
    ]);
    this.logger.debug(
      `Coupon "${coupon.code}" applied to order ${orderId} for user ${userId}, discount: ${discountAmount}`,
    );

    return {
      status: 'success',
      message: 'Coupon applied successfully',
      data: redemption,
    };
  }

  async generateCouponCode(prefix?: string): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let code = '';
      for (let i = 0; i < codeLength; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const fullCode = prefix ? `${prefix.toUpperCase()}-${code}` : code;

      const exists = await this.repository.couponCodeExists(fullCode);
      if (!exists) {
        return fullCode;
      }

      attempts++;
    }

    // Fallback: append timestamp fragment to ensure uniqueness
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const fallbackCode = prefix
      ? `${prefix.toUpperCase()}-${timestamp}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : `${timestamp}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return fallbackCode;
  }

  async bulkCreateCoupons(
    dto: BulkCreateCouponsDto,
    userId: string,
  ): Promise<ApiResponse<Coupon[]>> {
    const { count, prefix, ...couponBaseData } = dto;
    const coupons: Coupon[] = [];

    for (let i = 0; i < count; i++) {
      const code = await this.generateCouponCode(prefix);

      const coupon = await this.repository.createCoupon({
        ...couponBaseData,
        code,
        createdBy: userId,
        startsAt: new Date(couponBaseData.startsAt),
        expiresAt: new Date(couponBaseData.expiresAt),
        isActive: couponBaseData.isActive ?? true,
        applicableTo: couponBaseData.applicableTo ?? CouponApplicableTo.ALL_PRODUCTS,
        usageLimitPerUser: couponBaseData.usageLimitPerUser ?? 1,
        currentUsageCount: 0,
      });

      coupons.push(coupon);
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_COUPONS,
    ]);
    this.logger.debug(
      `Bulk created ${coupons.length} coupons with prefix "${prefix || 'none'}" by user ${userId}`,
    );

    return {
      status: 'success',
      message: `${coupons.length} coupons created successfully`,
      data: coupons,
    };
  }

  // ──────────────────────────────────────────────
  //  Flash sale methods
  // ──────────────────────────────────────────────

  async createFlashSale(
    dto: CreateFlashSaleDto,
  ): Promise<ApiResponse<FlashSale>> {
    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('Flash sale end date must be after start date');
    }

    const flashSale = await this.repository.createFlashSale(
      {
        name: dto.name,
        description: dto.description || null,
        discountPercentage: dto.discountPercentage,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        isActive: true,
        featuredImage: dto.featuredImage || null,
        maxPurchasesPerUser: dto.maxPurchasesPerUser || null,
      },
      dto.productIds,
    );

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_FLASH_SALES,
    ]);
    this.logger.debug(`Flash sale "${flashSale.name}" created with ${dto.productIds.length} products`);

    return {
      status: 'success',
      message: 'Flash sale created successfully',
      data: flashSale,
    };
  }

  async getActiveFlashSales(): Promise<
    ApiResponse<(FlashSale & { countdown: { hours: number; minutes: number; seconds: number } })[]>
  > {
    const cacheKey = this.cacheService.generateKey(
      'promotions',
      'flash-sales',
      'active',
    );

    const flashSales = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findActiveFlashSales(),
      { ttl: CACHE_TTL_FLASH_SALES, tags: [CACHE_TAG_PROMOTIONS, CACHE_TAG_FLASH_SALES] },
    );

    // Add countdown info to each flash sale
    const now = new Date();
    const salesWithCountdown = flashSales.map((sale) => {
      const endsAt = new Date(sale.endsAt);
      const remainingMs = Math.max(0, endsAt.getTime() - now.getTime());
      const totalSeconds = Math.floor(remainingMs / 1000);

      return {
        ...sale,
        countdown: {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        },
      };
    });

    return {
      status: 'success',
      message: 'Active flash sales retrieved successfully',
      data: salesWithCountdown,
    };
  }

  async getFlashSaleById(id: string): Promise<ApiResponse<FlashSale>> {
    const flashSale = await this.repository.findFlashSaleById(id);
    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Flash sale retrieved successfully',
      data: flashSale,
    };
  }

  // ──────────────────────────────────────────────
  //  Bundle discount methods
  // ──────────────────────────────────────────────

  async createBundleDiscount(
    dto: CreateBundleDiscountDto,
  ): Promise<ApiResponse<BundleDiscount>> {
    if (dto.productIds.length < 2) {
      throw new BadRequestException('A bundle must contain at least 2 products');
    }

    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('Bundle end date must be after start date');
    }

    const bundle = await this.repository.createBundleDiscount(
      {
        name: dto.name,
        description: dto.description || null,
        bundlePrice: dto.bundlePrice,
        isActive: dto.isActive ?? true,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
      },
      dto.productIds,
    );

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_BUNDLES,
    ]);
    this.logger.debug(
      `Bundle discount "${bundle.name}" created: $${bundle.bundlePrice} (regular: $${bundle.regularTotalPrice}, save ${bundle.savingsPercentage}%)`,
    );

    return {
      status: 'success',
      message: 'Bundle discount created successfully',
      data: bundle,
    };
  }

  async getBundleDiscounts(): Promise<ApiResponse<BundleDiscount[]>> {
    const cacheKey = this.cacheService.generateKey(
      'promotions',
      'bundles',
      'active',
    );

    const bundles = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllBundleDiscounts(true),
      { ttl: CACHE_TTL_BUNDLES, tags: [CACHE_TAG_PROMOTIONS, CACHE_TAG_BUNDLES] },
    );

    return {
      status: 'success',
      message: 'Bundle discounts retrieved successfully',
      data: bundles,
    };
  }

  async getBundleDiscountById(id: string): Promise<ApiResponse<BundleDiscount>> {
    const bundle = await this.repository.findBundleDiscountById(id);
    if (!bundle) {
      throw new NotFoundException(`Bundle discount with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Bundle discount retrieved successfully',
      data: bundle,
    };
  }

  // ──────────────────────────────────────────────
  //  Loyalty tier methods
  // ──────────────────────────────────────────────

  async getLoyaltyTiers(): Promise<ApiResponse<LoyaltyTier[]>> {
    const cacheKey = this.cacheService.generateKey(
      'promotions',
      'loyalty',
      'tiers',
    );

    const tiers = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllLoyaltyTiers(),
      { ttl: CACHE_TTL_LOYALTY, tags: [CACHE_TAG_PROMOTIONS, CACHE_TAG_LOYALTY] },
    );

    return {
      status: 'success',
      message: 'Loyalty tiers retrieved successfully',
      data: tiers,
    };
  }

  async getUserLoyaltyTier(
    userId: string,
  ): Promise<
    ApiResponse<{
      tier: LoyaltyTier | null;
      totalSpend: number;
      nextTier: LoyaltyTier | null;
      spendToNextTier: number;
    }>
  > {
    const totalSpend = await this.repository.getUserTotalSpend(userId);
    const currentTier = await this.repository.findLoyaltyTierBySpend(totalSpend);

    // Find next tier
    const allTiers = await this.repository.findAllLoyaltyTiers();
    let nextTier: LoyaltyTier | null = null;
    let spendToNextTier = 0;

    if (currentTier) {
      const currentIndex = allTiers.findIndex((t) => t.id === currentTier.id);
      if (currentIndex < allTiers.length - 1) {
        nextTier = allTiers[currentIndex + 1];
        spendToNextTier = Math.max(0, Number(nextTier.minimumSpend) - totalSpend);
      }
    } else if (allTiers.length > 0) {
      // User hasn't reached any tier yet
      nextTier = allTiers[0];
      spendToNextTier = Math.max(0, Number(nextTier.minimumSpend) - totalSpend);
    }

    return {
      status: 'success',
      message: 'User loyalty tier retrieved successfully',
      data: {
        tier: currentTier,
        totalSpend,
        nextTier,
        spendToNextTier: parseFloat(spendToNextTier.toFixed(2)),
      },
    };
  }

  async createLoyaltyTier(
    dto: CreateLoyaltyTierDto,
  ): Promise<ApiResponse<LoyaltyTier>> {
    // Check for duplicate tier name
    const existing = await this.repository.findLoyaltyTierByName(dto.name);
    if (existing) {
      throw new ConflictException(`Loyalty tier "${dto.name}" already exists`);
    }

    const tier = await this.repository.createLoyaltyTier({
      name: dto.name,
      minimumSpend: dto.minimumSpend,
      discountPercentage: dto.discountPercentage,
      perks: dto.perks || null,
      iconUrl: dto.iconUrl || null,
      color: dto.color || null,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PROMOTIONS,
      CACHE_TAG_LOYALTY,
    ]);
    this.logger.debug(
      `Loyalty tier "${tier.name}" created: ${tier.discountPercentage}% at $${tier.minimumSpend} spend`,
    );

    return {
      status: 'success',
      message: 'Loyalty tier created successfully',
      data: tier,
    };
  }

  // ──────────────────────────────────────────────
  //  Promotion engine
  // ──────────────────────────────────────────────

  async calculateBestDiscount(
    cartItems: CartItemDto[],
    userId: string,
  ): Promise<ApiResponse<BestDiscountResult>> {
    if (!cartItems || cartItems.length === 0) {
      return {
        status: 'success',
        message: 'No cart items provided',
        data: {
          type: 'none',
          discount: 0,
          description: 'No items in cart',
        },
      };
    }

    const cartTotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const cartProductIds = cartItems.map((item) => item.productId);

    const discountOptions: BestDiscountResult[] = [];

    // 1. Check active flash sales
    try {
      const flashSales = await this.repository.findActiveFlashSales();
      for (const sale of flashSales) {
        if (!sale.products) continue;
        const saleProductIds = sale.products.map((p) => p.id);
        const matchingItems = cartItems.filter((item) =>
          saleProductIds.includes(item.productId),
        );

        if (matchingItems.length > 0) {
          const flashDiscount = matchingItems.reduce((sum, item) => {
            const itemTotal = Number(item.price) * item.quantity;
            return sum + (itemTotal * Number(sale.discountPercentage)) / 100;
          }, 0);

          discountOptions.push({
            type: 'flash_sale',
            discount: parseFloat(flashDiscount.toFixed(2)),
            description: `Flash Sale: ${sale.name} - ${sale.discountPercentage}% off`,
            promotionId: sale.id,
            details: {
              saleName: sale.name,
              discountPercentage: Number(sale.discountPercentage),
              endsAt: sale.endsAt,
              matchingProductCount: matchingItems.length,
            },
          });
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to check flash sales for promotion engine: ${(error as Error).message}`,
      );
    }

    // 2. Check bundle deals
    try {
      const bundles = await this.repository.findAllBundleDiscounts(true);
      for (const bundle of bundles) {
        if (!bundle.products) continue;
        const bundleProductIds = bundle.products.map((p) => p.id);

        // Check if all bundle products are in the cart
        const allBundleProductsInCart = bundleProductIds.every((bpId) =>
          cartProductIds.includes(bpId),
        );

        if (allBundleProductsInCart) {
          const bundleDiscount =
            Number(bundle.regularTotalPrice) - Number(bundle.bundlePrice);

          discountOptions.push({
            type: 'bundle',
            discount: parseFloat(Math.max(0, bundleDiscount).toFixed(2)),
            description: `Bundle Deal: ${bundle.name} - Save ${bundle.savingsPercentage}%`,
            promotionId: bundle.id,
            details: {
              bundleName: bundle.name,
              bundlePrice: Number(bundle.bundlePrice),
              regularTotalPrice: Number(bundle.regularTotalPrice),
              savingsPercentage: Number(bundle.savingsPercentage),
            },
          });
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to check bundle deals for promotion engine: ${(error as Error).message}`,
      );
    }

    // 3. Check loyalty tier discount
    try {
      const totalSpend = await this.repository.getUserTotalSpend(userId);
      const loyaltyTier = await this.repository.findLoyaltyTierBySpend(totalSpend);

      if (loyaltyTier && Number(loyaltyTier.discountPercentage) > 0) {
        const loyaltyDiscount =
          (cartTotal * Number(loyaltyTier.discountPercentage)) / 100;

        discountOptions.push({
          type: 'loyalty',
          discount: parseFloat(loyaltyDiscount.toFixed(2)),
          description: `${loyaltyTier.name} Tier Discount: ${loyaltyTier.discountPercentage}% off`,
          details: {
            tierName: loyaltyTier.name,
            discountPercentage: Number(loyaltyTier.discountPercentage),
            totalSpend,
          },
        });
      }
    } catch (error) {
      this.logger.warn(
        `Failed to check loyalty tier for promotion engine: ${(error as Error).message}`,
      );
    }

    // Find the best (highest) discount
    if (discountOptions.length === 0) {
      return {
        status: 'success',
        message: 'No applicable promotions found',
        data: {
          type: 'none',
          discount: 0,
          description: 'No promotions currently apply to your cart',
        },
      };
    }

    // Sort by discount amount descending and pick the best
    discountOptions.sort((a, b) => b.discount - a.discount);
    const best = discountOptions[0];

    this.logger.debug(
      `Promotion engine: Best discount for user ${userId} is ${best.type} with $${best.discount} off (from ${discountOptions.length} options)`,
    );

    return {
      status: 'success',
      message: `Best discount found: ${best.description}`,
      data: best,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private async performCouponValidation(
    code: string,
    userId: string,
    cartItems: CartItemDto[],
  ): Promise<CouponValidationResult> {
    // 1. Find the coupon
    const coupon = await this.repository.findCouponByCode(code.toUpperCase());
    if (!coupon) {
      return { valid: false, discount: 0, reason: 'Coupon not found' };
    }

    // 2. Check if coupon is active
    if (!coupon.isActive) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: 'Coupon is not active',
      };
    }

    // 3. Check date range
    const now = new Date();
    if (now < new Date(coupon.startsAt)) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: 'Coupon has not started yet',
      };
    }
    if (now > new Date(coupon.expiresAt)) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: 'Coupon has expired',
      };
    }

    // 4. Check total usage limit
    if (
      coupon.usageLimit !== null &&
      coupon.currentUsageCount >= coupon.usageLimit
    ) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: 'Coupon usage limit has been reached',
      };
    }

    // 5. Check per-user usage limit
    const userRedemptions = await this.repository.countUserRedemptions(
      coupon.id,
      userId,
    );
    if (userRedemptions >= coupon.usageLimitPerUser) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: 'You have already used this coupon the maximum number of times',
      };
    }

    // 6. Calculate applicable cart total based on coupon applicability
    let applicableTotal = 0;
    let applicableItems: CartItemDto[] = [];

    switch (coupon.applicableTo) {
      case CouponApplicableTo.ALL_PRODUCTS:
        applicableItems = cartItems;
        break;

      case CouponApplicableTo.SPECIFIC_PRODUCTS:
        if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
          applicableItems = cartItems.filter((item) =>
            coupon.applicableProductIds!.includes(item.productId),
          );
        }
        break;

      case CouponApplicableTo.SPECIFIC_CATEGORIES:
        if (coupon.applicableCategoryIds && coupon.applicableCategoryIds.length > 0) {
          applicableItems = cartItems.filter(
            (item) =>
              item.categoryId &&
              coupon.applicableCategoryIds!.includes(item.categoryId),
          );
        }
        break;

      case CouponApplicableTo.SPECIFIC_TYPES:
        if (coupon.applicableProductTypes && coupon.applicableProductTypes.length > 0) {
          applicableItems = cartItems.filter(
            (item) =>
              item.productType &&
              coupon.applicableProductTypes!.includes(item.productType),
          );
        }
        break;

      case CouponApplicableTo.SPECIFIC_SELLERS:
        if (coupon.applicableSellerIds && coupon.applicableSellerIds.length > 0) {
          applicableItems = cartItems.filter(
            (item) =>
              item.sellerId &&
              coupon.applicableSellerIds!.includes(item.sellerId),
          );
        }
        break;

      default:
        applicableItems = cartItems;
    }

    if (applicableItems.length === 0) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: 'No items in your cart are eligible for this coupon',
      };
    }

    applicableTotal = applicableItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    // 7. Check minimum order amount
    if (
      coupon.minimumOrderAmount !== null &&
      applicableTotal < Number(coupon.minimumOrderAmount)
    ) {
      return {
        valid: false,
        discount: 0,
        couponId: coupon.id,
        reason: `Minimum order amount of $${coupon.minimumOrderAmount} not met. Applicable total: $${applicableTotal.toFixed(2)}`,
      };
    }

    // 8. Calculate discount amount
    let discount = 0;

    switch (coupon.discountType) {
      case DiscountType.PERCENTAGE:
        discount = (applicableTotal * Number(coupon.discountValue)) / 100;
        break;

      case DiscountType.FIXED_AMOUNT:
        discount = Number(coupon.discountValue);
        break;

      case DiscountType.FREE_SHIPPING:
        // Free shipping doesn't reduce the product total,
        // but we return a nominal discount to indicate it's valid
        discount = 0;
        return {
          valid: true,
          discount: 0,
          couponId: coupon.id,
          reason: 'Free shipping applied',
        };

      default:
        discount = 0;
    }

    // 9. Apply maximum discount cap
    if (
      coupon.maximumDiscountAmount !== null &&
      discount > Number(coupon.maximumDiscountAmount)
    ) {
      discount = Number(coupon.maximumDiscountAmount);
    }

    // Ensure discount doesn't exceed the applicable total
    discount = Math.min(discount, applicableTotal);

    // Round to 2 decimal places
    discount = parseFloat(discount.toFixed(2));

    return {
      valid: true,
      discount,
      couponId: coupon.id,
    };
  }
}
