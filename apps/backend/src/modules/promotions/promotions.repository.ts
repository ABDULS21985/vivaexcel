import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { BundleDiscount } from './entities/bundle-discount.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import { Product } from '../products/entities/product.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { PaginatedResponse } from '../../common/interfaces/response.interface';
import { CouponQueryDto } from './dto/coupon-query.dto';

@Injectable()
export class PromotionsRepository {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponRedemption)
    private readonly couponRedemptionRepository: Repository<CouponRedemption>,
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
    @InjectRepository(BundleDiscount)
    private readonly bundleDiscountRepository: Repository<BundleDiscount>,
    @InjectRepository(LoyaltyTier)
    private readonly loyaltyTierRepository: Repository<LoyaltyTier>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // ──────────────────────────────────────────────
  //  Coupon methods
  // ──────────────────────────────────────────────

  async findCouponByCode(code: string): Promise<Coupon | null> {
    return this.couponRepository.findOne({
      where: { code },
      relations: ['redemptions'],
    });
  }

  async findCouponById(id: string): Promise<Coupon | null> {
    return this.couponRepository.findOne({
      where: { id },
      relations: ['redemptions'],
    });
  }

  async findAllCoupons(query: CouponQueryDto): Promise<PaginatedResponse<Coupon>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      discountType,
      applicableTo,
      isActive,
    } = query;

    const qb = this.couponRepository.createQueryBuilder('coupon');

    // Search filter
    if (search) {
      qb.andWhere(
        '(coupon.code ILIKE :search OR coupon.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Discount type filter
    if (discountType) {
      qb.andWhere('coupon.discountType = :discountType', { discountType });
    }

    // Applicable-to filter
    if (applicableTo) {
      qb.andWhere('coupon.applicableTo = :applicableTo', { applicableTo });
    }

    // Active status filter
    if (isActive !== undefined) {
      qb.andWhere('coupon.isActive = :isActive', { isActive });
    }

    // Determine sort column
    const allowedSortColumns: Record<string, string> = {
      createdAt: 'coupon.createdAt',
      code: 'coupon.code',
      name: 'coupon.name',
      expiresAt: 'coupon.expiresAt',
      currentUsageCount: 'coupon.currentUsageCount',
    };
    const orderColumn = allowedSortColumns[sortBy] || 'coupon.createdAt';
    const orderDirection: 'ASC' | 'DESC' = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (decodedCursor.id && decodedCursor.createdAt) {
        if (orderDirection === 'DESC') {
          qb.andWhere(
            '(coupon.createdAt < :cursorCreatedAt OR (coupon.createdAt = :cursorCreatedAt AND coupon.id < :cursorId))',
            { cursorCreatedAt: decodedCursor.createdAt, cursorId: decodedCursor.id },
          );
        } else {
          qb.andWhere(
            '(coupon.createdAt > :cursorCreatedAt OR (coupon.createdAt = :cursorCreatedAt AND coupon.id > :cursorId))',
            { cursorCreatedAt: decodedCursor.createdAt, cursorId: decodedCursor.id },
          );
        }
      }
    }

    qb.orderBy(orderColumn, orderDirection);
    qb.addOrderBy('coupon.id', orderDirection);
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

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const coupon = this.couponRepository.create(data);
    return this.couponRepository.save(coupon);
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | null> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) return null;

    Object.assign(coupon, data);
    return this.couponRepository.save(coupon);
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await this.couponRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async couponCodeExists(code: string): Promise<boolean> {
    const count = await this.couponRepository.count({ where: { code } });
    return count > 0;
  }

  // ──────────────────────────────────────────────
  //  Coupon redemption methods
  // ──────────────────────────────────────────────

  async createCouponRedemption(data: Partial<CouponRedemption>): Promise<CouponRedemption> {
    const redemption = this.couponRedemptionRepository.create(data);
    return this.couponRedemptionRepository.save(redemption);
  }

  async countUserRedemptions(couponId: string, userId: string): Promise<number> {
    return this.couponRedemptionRepository.count({
      where: { couponId, userId },
    });
  }

  async incrementCouponUsage(couponId: string): Promise<void> {
    await this.couponRepository
      .createQueryBuilder()
      .update(Coupon)
      .set({ currentUsageCount: () => '"current_usage_count" + 1' })
      .where('id = :couponId', { couponId })
      .execute();
  }

  // ──────────────────────────────────────────────
  //  Flash sale methods
  // ──────────────────────────────────────────────

  async findActiveFlashSales(): Promise<FlashSale[]> {
    const now = new Date();

    return this.flashSaleRepository
      .createQueryBuilder('flashSale')
      .leftJoinAndSelect('flashSale.products', 'product')
      .where('flashSale.isActive = :isActive', { isActive: true })
      .andWhere('flashSale.startsAt <= :now', { now })
      .andWhere('flashSale.endsAt >= :now', { now })
      .orderBy('flashSale.endsAt', 'ASC')
      .getMany();
  }

  async findFlashSaleById(id: string): Promise<FlashSale | null> {
    return this.flashSaleRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async createFlashSale(data: Partial<FlashSale>, productIds: string[]): Promise<FlashSale> {
    const products = await this.productRepository.findByIds(productIds);

    // Build original prices map: productId -> current price
    const originalPrices: Record<string, number> = {};
    for (const product of products) {
      originalPrices[product.id] = Number(product.price) || 0;
    }

    const flashSale = this.flashSaleRepository.create({
      ...data,
      originalPrices,
      products,
    });

    return this.flashSaleRepository.save(flashSale);
  }

  // ──────────────────────────────────────────────
  //  Bundle discount methods
  // ──────────────────────────────────────────────

  async findAllBundleDiscounts(active?: boolean): Promise<BundleDiscount[]> {
    const qb = this.bundleDiscountRepository
      .createQueryBuilder('bundle')
      .leftJoinAndSelect('bundle.products', 'product');

    if (active !== undefined) {
      qb.andWhere('bundle.isActive = :active', { active });

      if (active) {
        const now = new Date();
        qb.andWhere('(bundle.startsAt IS NULL OR bundle.startsAt <= :now)', { now });
        qb.andWhere('(bundle.endsAt IS NULL OR bundle.endsAt >= :now)', { now });
      }
    }

    qb.orderBy('bundle.createdAt', 'DESC');

    return qb.getMany();
  }

  async findBundleDiscountById(id: string): Promise<BundleDiscount | null> {
    return this.bundleDiscountRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async createBundleDiscount(
    data: Partial<BundleDiscount>,
    productIds: string[],
  ): Promise<BundleDiscount> {
    const products = await this.productRepository.findByIds(productIds);

    // Auto-calculate regularTotalPrice from product prices
    const regularTotalPrice = products.reduce(
      (sum, product) => sum + (Number(product.price) || 0),
      0,
    );

    // Auto-calculate savingsPercentage
    const bundlePrice = Number(data.bundlePrice) || 0;
    const savingsPercentage =
      regularTotalPrice > 0
        ? parseFloat(
            (((regularTotalPrice - bundlePrice) / regularTotalPrice) * 100).toFixed(2),
          )
        : 0;

    const bundle = this.bundleDiscountRepository.create({
      ...data,
      regularTotalPrice,
      savingsPercentage,
      products,
    });

    return this.bundleDiscountRepository.save(bundle);
  }

  // ──────────────────────────────────────────────
  //  Loyalty tier methods
  // ──────────────────────────────────────────────

  async findAllLoyaltyTiers(): Promise<LoyaltyTier[]> {
    return this.loyaltyTierRepository.find({
      order: { minimumSpend: 'ASC' },
    });
  }

  async findLoyaltyTierBySpend(totalSpend: number): Promise<LoyaltyTier | null> {
    return this.loyaltyTierRepository
      .createQueryBuilder('tier')
      .where('tier.minimumSpend <= :totalSpend', { totalSpend })
      .orderBy('tier.minimumSpend', 'DESC')
      .getOne();
  }

  async createLoyaltyTier(data: Partial<LoyaltyTier>): Promise<LoyaltyTier> {
    const tier = this.loyaltyTierRepository.create(data);
    return this.loyaltyTierRepository.save(tier);
  }

  async findLoyaltyTierByName(name: string): Promise<LoyaltyTier | null> {
    return this.loyaltyTierRepository.findOne({
      where: { name: name as any },
    });
  }

  // ──────────────────────────────────────────────
  //  User spend aggregation
  // ──────────────────────────────────────────────

  async getUserTotalSpend(userId: string): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'totalSpend')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();

    return parseFloat(result?.totalSpend) || 0;
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
