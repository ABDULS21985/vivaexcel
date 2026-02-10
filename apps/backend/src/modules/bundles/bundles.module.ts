import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomBundle } from './entities';
import { CustomBundleService } from './bundles.service';
import { CustomBundleController } from './bundles.controller';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { Order } from '../../entities/order.entity';
import { Coupon } from '../promotions/entities/coupon.entity';
import { CartModule } from '../cart/cart.module';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomBundle,
      DigitalProduct,
      DigitalProductCategory,
      Order,
      Coupon,
    ]),
    forwardRef(() => CartModule),
    forwardRef(() => PromotionsModule),
  ],
  controllers: [CustomBundleController],
  providers: [CustomBundleService],
  exports: [CustomBundleService],
})
export class BundlesModule {}
