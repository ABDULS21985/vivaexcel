import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorefrontApiController } from './storefront-api.controller';
import { StorefrontApiService } from './storefront-api.service';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { Review } from '../../entities/review.entity';
import { SellerProfile } from '../../entities/seller-profile.entity';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalProduct,
      DigitalProductCategory,
      DigitalProductVariant,
      Review,
      SellerProfile,
      Cart,
      CartItem,
    ]),
    ApiKeysModule,
  ],
  controllers: [StorefrontApiController],
  providers: [StorefrontApiService],
  exports: [StorefrontApiService],
})
export class StorefrontApiModule {}
