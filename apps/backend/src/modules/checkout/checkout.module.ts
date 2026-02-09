import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { DownloadToken } from '../../entities/download-token.entity';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { User } from '../../entities/user.entity';

import { StripeModule } from '../stripe/stripe.module';
import { CartModule } from '../cart/cart.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      DownloadToken,
      Cart,
      CartItem,
      DigitalProduct,
      DigitalProductVariant,
      DigitalProductFile,
      User,
    ]),
    forwardRef(() => StripeModule),
    forwardRef(() => CartModule),
    MediaModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
