import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CouponsController,
  FlashSalesController,
  PromotionsController,
  LoyaltyController,
} from './controllers';
import { PromotionsService } from './promotions.service';
import { PromotionsRepository } from './promotions.repository';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { BundleDiscount } from './entities/bundle-discount.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coupon,
      CouponRedemption,
      FlashSale,
      BundleDiscount,
      LoyaltyTier,
    ]),
  ],
  controllers: [
    CouponsController,
    FlashSalesController,
    PromotionsController,
    LoyaltyController,
  ],
  providers: [PromotionsService, PromotionsRepository],
  exports: [PromotionsService],
})
export class PromotionsModule {}
