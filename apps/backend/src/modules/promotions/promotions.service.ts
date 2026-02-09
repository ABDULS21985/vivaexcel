import { Injectable } from '@nestjs/common';
import { PromotionsRepository } from './promotions.repository';
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
export class PromotionsService {
  constructor(private readonly promotionsRepository: PromotionsRepository) {}

  // ──────────────────────────────────────────────
  //  Coupon methods
  // ──────────────────────────────────────────────

  async createCoupon(createdBy: string, dto: CreateCouponDto) {
    return this.promotionsRepository.createCoupon(createdBy, dto);
  }

  async listCoupons(query: CouponQueryDto) {
    return this.promotionsRepository.listCoupons(query);
  }

  async getCoupon(id: string) {
    return this.promotionsRepository.getCoupon(id);
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    return this.promotionsRepository.updateCoupon(id, dto);
  }

  async deleteCoupon(id: string) {
    return this.promotionsRepository.deleteCoupon(id);
  }

  async validateCoupon(userId: string, dto: ValidateCouponDto) {
    return this.promotionsRepository.validateCoupon(userId, dto);
  }

  async applyCoupon(userId: string, dto: ApplyCouponDto) {
    return this.promotionsRepository.applyCoupon(userId, dto);
  }

  async bulkCreateCoupons(createdBy: string, dto: BulkCreateCouponsDto) {
    return this.promotionsRepository.bulkCreateCoupons(createdBy, dto);
  }

  // ──────────────────────────────────────────────
  //  Flash sale methods
  // ──────────────────────────────────────────────

  async createFlashSale(dto: CreateFlashSaleDto) {
    return this.promotionsRepository.createFlashSale(dto);
  }

  async getActiveFlashSales() {
    return this.promotionsRepository.getActiveFlashSales();
  }

  async getFlashSale(id: string) {
    return this.promotionsRepository.getFlashSale(id);
  }

  // ──────────────────────────────────────────────
  //  Bundle discount methods
  // ──────────────────────────────────────────────

  async getBestDeal(userId: string) {
    return this.promotionsRepository.getBestDeal(userId);
  }

  async listBundles() {
    return this.promotionsRepository.listBundles();
  }

  async getBundle(id: string) {
    return this.promotionsRepository.getBundle(id);
  }

  async createBundle(dto: CreateBundleDiscountDto) {
    return this.promotionsRepository.createBundle(dto);
  }

  // ──────────────────────────────────────────────
  //  Loyalty methods
  // ──────────────────────────────────────────────

  async getLoyaltyTiers() {
    return this.promotionsRepository.getLoyaltyTiers();
  }

  async getUserLoyaltyTier(userId: string) {
    return this.promotionsRepository.getUserLoyaltyTier(userId);
  }

  async createLoyaltyTier(dto: CreateLoyaltyTierDto) {
    return this.promotionsRepository.createLoyaltyTier(dto);
  }
}
