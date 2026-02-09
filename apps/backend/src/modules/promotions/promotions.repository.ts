import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { BundleDiscount } from './entities/bundle-discount.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponQueryDto,
  ValidateCouponDto,
  ApplyCouponDto,
  BulkCreateCouponsDto,
  CreateFlashSaleDto,
  CreateBundleDiscountDto,
  CreateLoyaltyTierDto,
} from './dto';

@Injectable()
export class PromotionsRepository {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponRedemption)
    private readonly couponRedemptionRepo: Repository<CouponRedemption>,
    @InjectRepository(FlashSale)
    private readonly flashSaleRepo: Repository<FlashSale>,
    @InjectRepository(BundleDiscount)
    private readonly bundleDiscountRepo: Repository<BundleDiscount>,
    @InjectRepository(LoyaltyTier)
    private readonly loyaltyTierRepo: Repository<LoyaltyTier>,
  ) {}

  // ──────────────────────────────────────────────
  //  Coupon methods
  // ──────────────────────────────────────────────

  async createCoupon(createdBy: string, dto: CreateCouponDto) {
    const coupon = this.couponRepo.create({ ...dto, createdBy });
    return this.couponRepo.save(coupon);
  }

  async listCoupons(query: CouponQueryDto) {
    // TODO: implement cursor pagination and filtering
    return this.couponRepo.find();
  }

  async getCoupon(id: string) {
    return this.couponRepo.findOneOrFail({ where: { id } });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    await this.couponRepo.update(id, dto);
    return this.getCoupon(id);
  }

  async deleteCoupon(id: string) {
    await this.couponRepo.delete(id);
  }

  async validateCoupon(userId: string, dto: ValidateCouponDto) {
    // TODO: implement coupon validation logic
    return this.couponRepo.findOneOrFail({ where: { code: dto.code } });
  }

  async applyCoupon(userId: string, dto: ApplyCouponDto) {
    // TODO: implement coupon application logic
    const coupon = await this.couponRepo.findOneOrFail({ where: { code: dto.code } });
    const redemption = this.couponRedemptionRepo.create({
      couponId: coupon.id,
      userId,
      orderId: dto.orderId,
      discountAmount: dto.discountAmount,
    });
    return this.couponRedemptionRepo.save(redemption);
  }

  async bulkCreateCoupons(createdBy: string, dto: BulkCreateCouponsDto) {
    // TODO: implement bulk coupon generation
    return [];
  }

  // ──────────────────────────────────────────────
  //  Flash sale methods
  // ──────────────────────────────────────────────

  async createFlashSale(dto: CreateFlashSaleDto) {
    const flashSale = this.flashSaleRepo.create(dto);
    return this.flashSaleRepo.save(flashSale);
  }

  async getActiveFlashSales() {
    return this.flashSaleRepo.find({ where: { isActive: true } });
  }

  async getFlashSale(id: string) {
    return this.flashSaleRepo.findOneOrFail({ where: { id } });
  }

  // ──────────────────────────────────────────────
  //  Bundle discount methods
  // ──────────────────────────────────────────────

  async getBestDeal(userId: string) {
    // TODO: implement best deal calculation
    return null;
  }

  async listBundles() {
    return this.bundleDiscountRepo.find({ where: { isActive: true } });
  }

  async getBundle(id: string) {
    return this.bundleDiscountRepo.findOneOrFail({ where: { id } });
  }

  async createBundle(dto: CreateBundleDiscountDto) {
    const bundle = this.bundleDiscountRepo.create(dto);
    return this.bundleDiscountRepo.save(bundle);
  }

  // ──────────────────────────────────────────────
  //  Loyalty methods
  // ──────────────────────────────────────────────

  async getLoyaltyTiers() {
    return this.loyaltyTierRepo.find({ order: { minimumSpend: 'ASC' } });
  }

  async getUserLoyaltyTier(userId: string) {
    // TODO: implement user tier lookup based on spending
    return this.loyaltyTierRepo.findOne({ where: { minimumSpend: 0 } as any });
  }

  async createLoyaltyTier(dto: CreateLoyaltyTierDto) {
    const tier = this.loyaltyTierRepo.create(dto);
    return this.loyaltyTierRepo.save(tier);
  }
}
