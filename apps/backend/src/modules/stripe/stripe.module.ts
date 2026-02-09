import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { Subscription } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { CheckoutModule } from '../checkout/checkout.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, User]),
    forwardRef(() => CheckoutModule),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
